import { Request, Response } from "express";

import { z } from "zod";
import bcrypt from "bcryptjs";

import { Brand, BrandColumns } from "@/user/models/brand";
import { AppDataSource } from "@/database/data-source";
import { BrandValidator } from "@/user/validators/brand";
import { QueryFailedError } from "typeorm";

class BrandController {

    static async save(data: any): Promise<Omit<BrandColumns, "password">> {
        const validated = BrandValidator.parse(data);

        const hashed = await bcrypt.hash(validated.password, 10);

        const repository = AppDataSource.getRepository(Brand);
        const brand = repository.create({
            ...validated,
            password: hashed,
            role: 'A',
        });

        await repository.save(brand);

        const { password, ...saved } = brand;

        return saved
    }

    static async signup(req: Request, res: Response) {
        try {
            const saved = await this.save(req.body)

            res.status(201).json({
                data: saved
            });
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    error: err.issues.map(i => i.message)
                });
            }

            if (err instanceof QueryFailedError) {
                if (err.driverError.code === "23505") {
                    return res.status(400).json({
                        error: "Empresa com CNPJ já cadastrado!"
                    });
                }
            }

            res.status(500).json({
                error: "Erro interno do servidor!"
            });
        }
    }
}

export default BrandController
