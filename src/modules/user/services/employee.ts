import { AppDataSource } from "@/database/data-source";
import { StatusEnum } from "@/database/base-entity";

import { RoleEnum } from "@/modules/user/models/base-user";
import { EmployeeValidator } from "@/modules/user/validators/employee";

import { Branch } from "@/modules/branch/models/branch";
import { NotFound } from "@/utils/errors/not-found";

import { RequestUser } from "@/middlewares/auth";

import jwt from "jsonwebtoken";
import { BadRequest } from "@/utils/errors/bad-request";
import { EmployeeUser, User } from "@/modules/user/models/user";
import TemplateService from "@/modules/notification/services/template";
import EmailService from "@/services/email";
import { QueryRunner } from "typeorm";

export interface JwtPasswordResetPayload {
    id: number;
}

class EmployeeService {

    static async save(
        data: any,
        user: RequestUser,
        queryRunner?: QueryRunner
    ): Promise<EmployeeUser> {
        const validated = EmployeeValidator.parse(data);

        const manager = queryRunner ? queryRunner.manager : AppDataSource.manager;

        const branch = await manager.getRepository(Branch).findOneBy({ id: validated.branch_id });
        if (!branch || branch.brand_id !== user.brand_id || branch.status !== StatusEnum.ACTIVE) {
            throw new NotFound("A filial não foi encontrada para ser atribuída ao novo funcionário");
        }

        const existing = await manager.getRepository(User).findOneBy({
            register: validated.register
        });
        if (existing) throw new BadRequest("O funcionário já existe e trabalha em outra filial");

        const employee = manager.getRepository(User).create({
            ...validated,
            role: RoleEnum.EMPLOYEE,
            status: StatusEnum.INACTIVE
        }) as EmployeeUser;

        await manager.getRepository(User).save(employee);
        return employee;
    }

    static create_password_reset_token(user_id: number): string {
        const payload: JwtPasswordResetPayload = { id: user_id };

        return jwt.sign(payload, process.env.JWT_PASSWORD_SECRET as string, { expiresIn: "7d" });
    }

    static async send_welcome_email(employee: EmployeeUser, token: string) {
        const template = await TemplateService.getByKey("EMPLOYEE_WELCOME");
        if (!template) throw new Error("Template EMPLOYEE_WELCOME não encontrado");

        await new EmailService().send({
            to: employee.email,
            subject: template.subject,
            html: TemplateService.format(template.template, [
                {
                    key: "welcome_link",
                    value: `${process.env.WEB_URL}/employee/activate?token=${token}`
                }
            ])
        });
    }

    static async create(data: any, user: RequestUser) {
        const QueryRunner = AppDataSource.createQueryRunner();
        await QueryRunner.connect();
        await QueryRunner.startTransaction();

        try {
            const employee = await this.save(data, user, QueryRunner);

            const token = this.create_password_reset_token(employee.id);
            await this.send_welcome_email(employee, token);

            await QueryRunner.commitTransaction();

            return {
                id: employee.id,
                role: employee.role as "M" | "E",
                register: employee.register,
                name: employee.name,
                salary: employee.salary,
                branch_id: employee.branch_id,
                createdAt: employee.createdAt,
                updatedAt: employee.updatedAt,
                status: employee.status
            };
        } catch (err) {
            await QueryRunner.rollbackTransaction();
            throw err;
        } finally {
            await QueryRunner.release();
        }
    }
}

export default EmployeeService;
