import { Request, Response } from "express";

import { z } from "zod";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import EmployeeService, { JwtPasswordResetPayload } from "@/modules/user/services/employee";
import { EmployeePasswordValidator } from "@/modules/user/validators/employee";
import { RoleEnum, RoleType } from "@/modules/user/models/base-user";

import { RequestUser } from "@/middlewares/auth";

import { AppDataSource } from "@/database/data-source";
import { StatusEnum } from "@/database/base-entity";

import { BadRequest } from "@/utils/errors/bad-request";
import { NotFound } from "@/utils/errors/not-found";

import { In, QueryFailedError } from "typeorm";
import { Forbidden } from "@/utils/errors/forbidden";
import { User } from "../models/user";

class EmployeeController {

    static async create(req: Request, res: Response) {
        try {
            const saved = await EmployeeService.create(req.body, req.user as RequestUser);

            res.status(201).json({
                data: saved
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === "23505") {
                    return res.status(400).json({
                        error: "Um usuário com esse CPF já existe!"
                    });
                }
            }

            throw err;
        }
    }

    static async update(req: Request, res: Response) {
        const parser = z.object({
            employee_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { employee_id } = parser.parse(req.params);

        try {
            const updated = await EmployeeService.update(employee_id, req.body, req.user as RequestUser);

            res.status(200).json({
                data: updated
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === "23505") {
                    return res.status(400).json({
                        error: "Um usuário com esse CPF já existe!"
                    });
                }
            }

            throw err;
        }
    }

    static async activate(req: Request, res: Response) {
        const token = req.query.token as string;

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_PASSWORD_SECRET as string) as JwtPasswordResetPayload;
        } catch (_) {
            throw new BadRequest("Token inválido");
        }

        if (payload && payload.id) {
            const EmployeeRepository = AppDataSource.getRepository(User);

            const employee = await EmployeeRepository.findOneBy({
                id: payload.id,
                role: In([RoleEnum.MANAGER, RoleEnum.EMPLOYEE]),
                status: In([StatusEnum.ACTIVE, StatusEnum.INACTIVE])
            });

            if (!employee) throw new BadRequest("Usuário não encontrado para o token fornecido");

            if (
                (employee.status === StatusEnum.ACTIVE && employee.password)
                || (employee.status === StatusEnum.INACTIVE && employee.password)
            ) throw new BadRequest("Token inválido");

            const validated = EmployeePasswordValidator.parse(req.body);
            const hashed = await bcrypt.hash(validated.password, 10);

            await EmployeeRepository.update({
                id: payload.id
            }, {
                password: hashed,
                status: StatusEnum.ACTIVE
            });
        } else throw new BadRequest("Token inválido");

        res.status(204).send();
    }

    static async promote_to_manager(req: Request, res: Response) {
        const parser = z.object({
            employee_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { employee_id } = parser.parse(req.params);

        const EmployeeRepository = AppDataSource.getRepository(User);
        const employee = await EmployeeRepository.createQueryBuilder()
            .update(User)
            .set({
                role: RoleEnum.MANAGER
            })
            .where("id = :id AND status = :status AND role IN ('E', 'M')", {
                id: employee_id,
                status: StatusEnum.ACTIVE
            })
            .returning("*")
            .execute();

        if (!employee.affected) throw new NotFound("O funcionário não foi encontrado");

        const {
            password: _password,
            legal_name: _legalName,
            ...data
        } = employee.raw[0];

        return res.status(200).json({
            data: data
        });
    }

    static async demote_to_employee(req: Request, res: Response) {
        const parser = z.object({
            employee_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { employee_id } = parser.parse(req.params);

        const EmployeeRepository = AppDataSource.getRepository(User);
        const employee = await EmployeeRepository.createQueryBuilder()
            .update(User)
            .set({
                role: RoleEnum.EMPLOYEE
            })
            .where("id = :id AND status = :status AND role IN ('E', 'M')", {
                id: employee_id,
                status: StatusEnum.ACTIVE
            })
            .returning("*")
            .execute();

        if (!employee.affected) throw new NotFound("O funcionário não foi encontrado");

        const {
            password: _password,
            legal_name: _legalName,
            ...data
        } = employee.raw[0];

        return res.status(200).json({
            data: data
        });
    }

    static async toggle_status(req: Request, res: Response) {
        const parser = z.object({
            employee_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { employee_id } = parser.parse(req.params);

        const EmployeeRepository = AppDataSource.getRepository(User);

        const employee = await EmployeeRepository.findOne({
            where: {
                id: employee_id,
                role: In([RoleEnum.EMPLOYEE, RoleEnum.MANAGER])
            },
            select: ["id", "status", "role"]
        });

        if (!employee) throw new NotFound("O funcionário não foi encontrado");

        const current_role = (req.user as RequestUser).role;
        const target_role = employee.role;

        if (
            target_role === RoleEnum.MANAGER
            && current_role !== RoleEnum.ADMIN
        ) throw new Forbidden("Apenas administradores podem modificar status de um gerente");

        const AdminOrManager: RoleType[] = [RoleEnum.ADMIN, RoleEnum.MANAGER];
        if (
            target_role === RoleEnum.EMPLOYEE
            && !AdminOrManager.includes(current_role)
        ) throw new Forbidden("Você não possui permissão para modificar o status deste funcionário");

        const result = await EmployeeRepository.createQueryBuilder()
            .update(User)
            .set({
                status: () => `(
                    CASE 
                        WHEN status = 'A' THEN 'I' 
                        WHEN status = 'I' THEN 'A' 
                        ELSE status 
                    END
                )::user_status_enum`
            })
            .where("id = :id", { id: employee_id })
            .returning("*")
            .execute();

        if (!result.affected) throw new NotFound("O funcionário não foi encontrado");

        const {
            password: _password,
            legal_name: _legalName,
            ...data
        } = result.raw[0];

        return res.status(200).json({
            data: data
        });
    }

    static async retrieve(req: Request, res: Response) {
        const parser = z.object({
            role: z.enum([RoleEnum.MANAGER, RoleEnum.EMPLOYEE]).optional()
        });

        const queries = parser.parse(req.query);
        const current = req.user as RequestUser;

        let roles: RoleType[] = [RoleEnum.EMPLOYEE];
        if (current.role === RoleEnum.ADMIN) roles.push(RoleEnum.MANAGER);

        if (queries.role) {
            if (queries.role === RoleEnum.MANAGER && current.role !== RoleEnum.ADMIN) {
                throw new Forbidden("Somente administradores podem ver os gerentes de uma franquia");
            }

            roles = [queries.role];
        }

        const EmployeeRepository = AppDataSource.getRepository(User);

        const employees = await EmployeeRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.branch", "branch")
            .where("user.role IN (:...roles)", {
                roles: roles
            })
            .andWhere("branch.brand_id = :brand_id", {
                brand_id: current.brand_id
            })
            .andWhere("user.status IN ('A', 'I')")
            .select([
                "user.id",
                "user.name",
                "user.register",
                "user.email",
                "user.role",
                "user.status",
                "user.createdAt",
                "user.updatedAt",
                "user.salary",
                "branch.id",
                "branch.name"
            ])
            .orderBy("user.name")
            .getMany();

        return res.status(200).json({
            data: employees
        });
    }
}

export default EmployeeController;
