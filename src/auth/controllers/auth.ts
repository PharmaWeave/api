import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppDataSource } from "@/database/data-source";
import { LoginValidator } from "@/auth/validators/login";
import { ServerResponse } from "http";
import { RoleEnum, RoleType } from "@/user/models/base-user";
import { StatusEnum } from "@/database/base-entity";
import { In } from "typeorm";
import { BrandUser, EmployeeUser, User } from "@/user/models/user";

class AuthController {

    static async validate(res: Response, data: any) {
        const { register, password } = LoginValidator.parse(data);

        let account: BrandUser | EmployeeUser | null = null;
        let role: Exclude<RoleType, "U"> | null = null;

        const UserRepository = AppDataSource.getRepository(User);
        account = await UserRepository.findOne({
            where: {
                register: register,
                status: StatusEnum.ACTIVE,
                role: RoleEnum.ADMIN
            }
        }) as BrandUser | null;

        if (account) role = account.role;
        else {
            account = await UserRepository.findOne({
                where: {
                    register: register,
                    status: StatusEnum.ACTIVE,
                    role: In([RoleEnum.EMPLOYEE, RoleEnum.MANAGER])
                },
                relations: ["branch"]
            }) as EmployeeUser | null;

            if (account) role = account.role;
        }

        if (!account || !role) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const isValid = await bcrypt.compare(password, account.password as string);
        if (!isValid) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        return { account, role };
    }

    static async login(req: Request, res: Response) {
        let response = await this.validate(res, req.body);
        if (response instanceof ServerResponse) return response;

        const { account, role } = response as {
            account: BrandUser | EmployeeUser,
            role: Exclude<RoleType, "U">
        };

        const accessToken = jwt.sign(
            {
                id: account.id,
                brand_id: role === RoleEnum.ADMIN ? account.id : (account as EmployeeUser).branch.brand_id,
                branch_id: role === RoleEnum.ADMIN ? undefined : (account as EmployeeUser).branch_id,
                role: role
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            {
                id: account.id,
                brand_id: role === RoleEnum.ADMIN ? account.id : (account as EmployeeUser).branch.brand_id,
                branch_id: role === RoleEnum.ADMIN ? undefined : (account as EmployeeUser).branch_id,
                role: role
            },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: "30d" }
        );

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        return res.json({
            data: {
                access_token: accessToken
            }
        });
    }
}

export default AuthController;
