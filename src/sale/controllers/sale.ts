import { Request, Response } from "express";

import { z } from "zod";

import SaleService from "@/sale/services/sale";
import { RequestUser } from "@/middlewares/auth";

class SaleController {

    static async create(req: Request, res: Response) {
        const saved = await SaleService.save(req.body, req.user as RequestUser);

        res.status(201).json({
            data: saved
        });
    }

    static async delete(req: Request, res: Response) {
        const parser = z.object({
            sale_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { sale_id } = parser.parse(req.params);

        await SaleService.rollback(sale_id);

        res.status(204).send();
    }

    static async history(req: Request, res: Response) {
        const parser = z.object({
            user_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { user_id } = parser.parse(req.params);

        const result = await SaleService.history(user_id);

        return res.status(200).json({
            data: result
        });
    }

    static async metrics(req: Request, res: Response) {
        const result = await SaleService.metrics(req.user as RequestUser);

        return res.status(200).json({
            data: result
        });
    }

    static async retrieve(req: Request, res: Response) {
        const parser = z.object({
            page: z.string()
                .regex(/^\d+$/)
                .transform(Number)
                .refine((val) => val > 0, { message: "A página precisa ser um número positivo" }),
            limit: z.string()
                .regex(/^\d+$/)
                .transform(Number)
                .refine((val) => val > 0 && val <= 100, { message: "O limite deve estar entre 1 e 100" })
        });

        const { page, limit } = parser.parse(req.query);

        const result = await SaleService.getAllByBranch(req.user as RequestUser, page, limit);

        return res.status(200).json({
            data: result.data,
            pagination: result.pagination
        });
    }
}

export default SaleController;
