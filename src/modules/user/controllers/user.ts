import { Request, Response } from "express";

import { z } from "zod";

import UserService from "@/modules/user/services/user";
import { RequestUser } from "@/middlewares/auth";

import { QueryFailedError } from "typeorm";

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
}

export default UserController;
