import { Request, Response } from "express";

import BrandService from "@/modules/user/services/brand";

import { QueryFailedError } from "typeorm";

class BrandController {

    static async signup(req: Request, res: Response) {
        try {
            const saved = await BrandService.save(req.body);

            res.status(201).json({
                data: saved
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === "23505") {
                    return res.status(400).json({
                        error: "Empresa com CNPJ já cadastrado!"
                    });
                }
            }

            throw err;
        }
    }
}

export default BrandController;
