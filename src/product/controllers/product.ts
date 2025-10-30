import { Response, Request } from "express";

import { z } from "zod";

import ProductService from "@/product/services/product";

import { RequestUser } from "@/middlewares/auth";

import { BadRequest } from "@/utils/errors/bad-request";

import { QueryFailedError } from "typeorm";

class ProductController {

    static async create(req: Request, res: Response) {
        try {
            const saved = await ProductService.save(req.body, req.user as RequestUser);

            res.status(201).json({
                data: saved
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.constraint === "UQ_product_name_brand") {
                    throw new BadRequest("Um produto com o mesmo nome já existe nessa franquia!");
                }
            }

            throw err;
        }
    }

    static async get_all(req: Request, res: Response) {
        const products = await ProductService.retrieve(req.user as RequestUser);

        res.status(200).json({
            data: products
        });
    }

    static async update(req: Request, res: Response) {
        const parser = z.object({
            product_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { product_id } = parser.parse(req.params);

        try {
            const updated = await ProductService.update(product_id, req.body, req.user as RequestUser);

            res.status(200).json({
                data: updated
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.constraint === "UQ_product_name_brand") {
                    throw new BadRequest("Um produto com o mesmo nome já existe nessa franquia!");
                }
            }

            throw err;
        }
    }
}

export default ProductController;
