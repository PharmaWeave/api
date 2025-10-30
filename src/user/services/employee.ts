import { AppDataSource } from "@/database/data-source";
import { StatusEnum } from "@/database/base-entity";

import { RoleEnum } from "@/user/models/base-user";
import { EmployeeValidator } from "@/user/validators/employee";

import { Branch } from "@/branch/models/branch";
import { NotFound } from "@/utils/errors/not-found";

import { RequestUser } from "@/middlewares/auth";

import jwt from "jsonwebtoken";
import { BadRequest } from "@/utils/errors/bad-request";
import { EmployeeUser, User } from "@/user/models/user";

export interface JwtPasswordResetPayload {
    id: number;
}

class EmployeeService {

    static async save(data: any, user: RequestUser): Promise<Omit<EmployeeUser, "password" | "branch">> {
        const validated = EmployeeValidator.parse(data);

        const BranchRepository = AppDataSource.getRepository(Branch);
        const branch = await BranchRepository.findOneBy({ id: validated.branch_id });

        if (!branch || (branch.brand_id !== user.brand_id) || branch.status !== StatusEnum.ACTIVE) {
            throw new NotFound("A filial não foi encontrada para ser atribuída ao novo funcionário");
        }

        const EmployeeRepository = AppDataSource.getRepository(User);
        const existing = await EmployeeRepository.findOneBy({
            register: validated.register
        });
        if (existing) throw new BadRequest("O funcionário já existe e trabalha em outra filial");

        const employee = EmployeeRepository.create({
            ...validated,
            role: RoleEnum.EMPLOYEE,
            status: StatusEnum.INACTIVE
        }) as EmployeeUser;

        await EmployeeRepository.save(employee);

        const saved: Omit<EmployeeUser, "password" | "branch"> = {
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

        return saved;
    }

    static create_password_reset_token(user_id: number) {
        const payload: JwtPasswordResetPayload = { id: user_id };

        const token = jwt.sign(
            payload,
            process.env.JWT_PASSWORD_SECRET as string,
            { expiresIn: "7d" }
        );

        return token;
    }
}

export default EmployeeService;
