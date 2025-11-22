import { Request, Response } from "express";

import { z } from "zod";

import UserService from "@/modules/user/services/user";
import { RequestUser } from "@/middlewares/auth";

import { In, QueryFailedError } from "typeorm";
import { AppDataSource } from "@/database/data-source";
import { User } from "../models/user";
import { RoleEnum } from "../models/base-user";
import { NotFound } from "@/utils/errors/not-found";
import { Forbidden } from "@/utils/errors/forbidden";

class UserController {

    static async create(req: Request, res: Response) {
        try {
            const saved = await UserService.save(req.body, (req.user as RequestUser));

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

    static async get_all(req: Request, res: Response) {
        const products = await UserService.retrieve(req.user as RequestUser);

        res.status(200).json({
            data: products
        });
    }

    static async update(req: Request, res: Response) {
        const parser = z.object({
            user_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { user_id } = parser.parse(req.params);

        const updated = await UserService.update(user_id, req.body);

        res.status(200).json({
            data: updated
        });
    }

    static async toggle_status(req: Request, res: Response) {
        const parser = z.object({
            user_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { user_id } = parser.parse(req.params);

        const EmployeeRepository = AppDataSource.getRepository(User);

        const employee = await EmployeeRepository.findOne({
            where: {
                id: user_id,
                role: In([RoleEnum.USER, RoleEnum.EMPLOYEE, RoleEnum.MANAGER])
            },
            select: ["id", "status", "role"]
        });

        if (!employee) throw new NotFound("O usuário não foi encontrado");

        const current_role = (req.user as RequestUser).role;
        const target_role = employee.role;

        if (
            target_role === RoleEnum.EMPLOYEE
            && current_role !== RoleEnum.MANAGER
        ) throw new Forbidden("Apenas gerentes podem modificar status de um funcionário");
        else if (
            target_role === RoleEnum.MANAGER
            && current_role !== RoleEnum.ADMIN
        ) throw new Forbidden("Apenas administradores podem modificar status de um gerente");

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
            .where("id = :id", { id: user_id })
            .returning("*")
            .execute();

        if (!result.affected) throw new NotFound("O usuário não foi encontrado");

        const {
            password: _password,
            legal_name: _legalName,
            ...data
        } = result.raw[0];

        return res.status(200).json({
            data: data
        });
    }
}

export default UserController;
