import { Request, Response } from "express";

import bcrypt from "bcryptjs";

import { AppDataSource } from "@/database/data-source";
import { LoginValidator } from "@/modules/auth/validators/login";
import { ServerResponse } from "http";
import { RoleEnum, RoleType } from "@/modules/user/models/base-user";
import { StatusEnum } from "@/database/base-entity";
import { In } from "typeorm";
import { BrandUser, EmployeeUser, User } from "@/modules/user/models/user";
import AuthService from "../services/auth";
import { RefreshValidator } from "../validators/refresh";

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

        const { access_token, refresh_token } = AuthService.generate_tokens(account, role);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        return res.json({
            data: {
                access_token: access_token
            }
        });
    }

    static async logout(req: Request, res: Response) {
        res.cookie("refresh_token", null, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 0
        });

        return res.status(204).send();
    }

    static async refresh(req: Request, res: Response) {
        const validated = RefreshValidator.parse(req.cookies);

        const { access_token, refresh_token } = await AuthService.refresh_tokens(validated.refresh_token);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        return res.json({
            data: {
                access_token: access_token
            }
        });
    }
}

export default AuthController;
