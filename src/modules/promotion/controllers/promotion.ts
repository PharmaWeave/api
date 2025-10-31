import { Response, Request } from "express";
import { z } from "zod";
import { QueryFailedError } from "typeorm";

import PromotionService from "@/modules/promotion/services/promotion";
import { BadRequest } from "@/utils/errors/bad-request";
import { RequestUser } from "@/middlewares/auth";

class PromotionController {

    static async create(req: Request, res: Response) {
        try {
            const saved = await PromotionService.create(req.body);

            res.status(201).json({
                data: saved
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.constraint === "UQ_product_info_promotion") {
                    throw new BadRequest("Essa promoção já está vinculada a algum produto!");
                }
            }

            throw err;
        }
    }

    static async delete(req: Request, res: Response) {
        const parser = z.object({
            promotion_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { promotion_id } = parser.parse(req.params);

        await PromotionService.delete(promotion_id);

        res.status(200).json({
            message: "Promoção deletada com sucesso"
        });
    }

    static async finalize(req: Request, res: Response) {
        const parser = z.object({
            promotion_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { promotion_id } = parser.parse(req.params);

        await PromotionService.finalize(promotion_id);

        res.status(200).json({
            message: "Promoção finalizada com sucesso"
        });
    }

    static async retrieve(req: Request, res: Response) {
        const data = await PromotionService.getAllByBranch((req.user as RequestUser).branch_id!);

        res.status(200).json({
            data: data
        });
    }
}

export default PromotionController;
