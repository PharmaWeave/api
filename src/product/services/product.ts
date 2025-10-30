import { AppDataSource } from "@/database/data-source";

import { ProductPatchValidator, ProductValidator } from "@/product/validators/product";
import { Product } from "@/product/models/product";

import { RequestUser } from "@/middlewares/auth";
import { ProductInfo } from "@/product/models/product-info";
import { NotFound } from "@/utils/errors/not-found";
import { StatusEnum } from "@/database/base-entity";

import { In } from "typeorm";

class ProductService {

    static async save(data: any, user: RequestUser) {
        const validated = ProductValidator.parse(data);

        return await AppDataSource.manager.transaction(async (TransactionManager) => {
            const product = TransactionManager.create(Product, {
                name: validated.name,
                description: validated.description,
                brand_id: user.brand_id
            });
            await TransactionManager.save(Product, product);

            const product_info = TransactionManager.create(ProductInfo, {
                ...validated.info,
                product_id: product.id,
                branch_id: user.branch_id
            });
            await TransactionManager.save(ProductInfo, product_info);

            const result = await TransactionManager.findOne(Product, {
                where: { id: product.id },
                relations: ["product_info"]
            });

            return result;
        });
    }

    static async retrieve(user: RequestUser) {
        const ProductInfoRepository = AppDataSource.getRepository(ProductInfo);

        const result = await ProductInfoRepository.find({
            where: {
                branch_id: user.branch_id,
                status: In([StatusEnum.ACTIVE, StatusEnum.INACTIVE])
            },
            relations: ["product"]
        });

        return result.map(product => {
            return {
                id: product.product.id,
                name: product.product.name,
                description: product.product.description,
                brand_id: product.product.brand_id,
                info: {
                    price: product.price,
                    stock: product.stock,
                    branch_id: product.branch_id,
                    product_id: product.product_id,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                    status: product.status
                },
                createdAt: product.product.createdAt,
                updatedAt: product.product.updatedAt,
                status: product.product.status
            };
        });
    }

    static async update(product_id: number, data: any, user: RequestUser) {
        const validated = ProductPatchValidator.parse(data);

        return await AppDataSource.manager.transaction(async (TransactionManager) => {
            const product = await TransactionManager.findOne(Product, {
                where: {
                    id: product_id,
                    brand_id: user.brand_id
                }
            });

            if (!product) throw new NotFound("Produto não encontrado");

            TransactionManager.merge(Product, product, {
                name: validated.name,
                description: validated.description
            });
            await TransactionManager.save(Product, product);

            const product_info = await TransactionManager.findOne(ProductInfo, {
                where: {
                    product_id: product.id,
                    branch_id: user.branch_id
                }
            });

            if (!product_info) throw new NotFound("Informações do produto não encontradas");

            TransactionManager.merge(ProductInfo, product_info, {
                ...validated.info
            });
            await TransactionManager.save(ProductInfo, product_info);

            return await TransactionManager.findOne(Product, {
                where: { id: product.id },
                relations: ["product_info"]
            });
        });
    }
}

export default ProductService;