import { Response, Request } from "express";

import { z } from "zod";

import ProductService from "@/modules/product/services/product";

import { RequestUser } from "@/middlewares/auth";

import { BadRequest } from "@/utils/errors/bad-request";

import { QueryFailedError } from "typeorm";
import { NotFound } from "@/utils/errors/not-found";
import { ProductInfo } from "../models/product-info";
import { Forbidden } from "@/utils/errors/forbidden";
import { AppDataSource } from "@/database/data-source";

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

    static async toggle_status(req: Request, res: Response) {
        const parser = z.object({
            product_info_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { product_info_id } = parser.parse(req.params);

        const ProductInfoRepository = AppDataSource.getRepository(ProductInfo);

        const currentUser = req.user as RequestUser;
        const productInfo = await ProductInfoRepository.findOne({
            where: {
                id: product_info_id
            },
            relations: ["branch"],
            select: ["id", "status", "branch_id"]
        });

        if (!productInfo) throw new NotFound("As informações do produto não foram encontradas");

        if (currentUser.branch_id !== productInfo.branch_id) throw new Forbidden("Você não possui permissão para modificar produtos de outra filial");

        const result = await ProductInfoRepository.createQueryBuilder()
            .update(ProductInfo)
            .set({
                status: () => `(
                CASE 
                    WHEN status = 'A' THEN 'I'
                    WHEN status = 'I' THEN 'A'
                    ELSE status
                END
            )::product_info_status_enum`
            })
            .where("id = :id", { id: product_info_id })
            .returning("*")
            .execute();

        if (!result.affected) throw new NotFound("As informações do produto não foram encontradas");

        const { product: _p, branch: _b, ...data } = result.raw[0];

        return res.status(200).json({
            data
        });
    }
}

export default ProductController;
