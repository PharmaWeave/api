import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppDataSource } from "@/database/data-source";
import { Brand, BrandColumns } from "@/user/models/brand";
import { Employee, EmployeeColumns } from "@/user/models/employee";
import { LoginValidator } from "@/auth/validators/login";
import { ServerResponse } from "http";

class AuthController {

    static async validate(res: Response, data: any) {
        const { register, password } = LoginValidator.parse(data);

        let account: BrandColumns | EmployeeColumns | null = null;
        let role: "A" | "M" | null = null;

        const BrandRepository = AppDataSource.getRepository(Brand);
        account = await BrandRepository.findOne({ where: { cnpj: register } });

        if (account) role = "A";
        else {
            const EmployeeRepository = AppDataSource.getRepository(Employee);
            account = await EmployeeRepository.findOne({ where: { cpf: register } });

            if (account) role = "M";
        }

        if (!account || !role) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const isValid = await bcrypt.compare(password, account.password);
        if (!isValid) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        return { account, role }
    }

    static async login(req: Request, res: Response) {
        try {
            let response = await this.validate(res, req.body);
            if (response instanceof ServerResponse) return response;

            const { account, role } = response as {
                account: BrandColumns | EmployeeColumns,
                role: "A" | "M"
            }

            const accessToken = jwt.sign(
                { id: account.id, role },
                process.env.JWT_SECRET as string,
                { expiresIn: "15m" }
            );

            const refreshToken = jwt.sign(
                { id: account.id, role },
                process.env.JWT_REFRESH_SECRET as string,
                { expiresIn: "30d" }
            );

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 30,
            });

            return res.json({
                data: {
                    access_token: accessToken
                }
            });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    error: err.issues.map(i => i.message),
                });
            }

            return res.status(500).json({
                error: "Erro interno do servidor"
            });
        }
    }
}

export default AuthController;
