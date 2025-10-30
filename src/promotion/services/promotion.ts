import { AppDataSource } from "@/database/data-source";
import { Promotion, PromotionColumns, PromotionStyleEnum } from "@/promotion/models/promotion";
import { ProductInfo, ProductInfoColumns } from "@/product/models/product-info";
import { StatusEnum } from "@/database/base-entity";
import { NotFound } from "@/utils/errors/not-found";
import { CreatePromotionValidator } from "../validators/promotion";
import { PromotionProduct, PromotionProductColumns } from "../models/promo-product";
import { EntityManager, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { BadRequest } from "@/utils/errors/bad-request";

export interface PromotionData {
    promotion: PromotionColumns;
    products: PromotionProductColumns[];
}

export class PromotionService {

    static async create(data: any) {
        const validated = CreatePromotionValidator.parse(data);

        return AppDataSource.manager.transaction(async (TransactionManager) => {
            const promotion = TransactionManager.create(Promotion, {
                title: validated.title,
                description: validated.description,
                type: validated.type ?? PromotionStyleEnum.PERCENTAGE,
                value: validated.value,
                constraint: validated.constraint,
                start: validated.start,
                end: validated.end,
                branch_id: validated.branch_id
            });

            await TransactionManager.save(Promotion, promotion);

            for (const product_info_id of validated.product_info_ids) {
                const product_info = await TransactionManager.findOne(ProductInfo, {
                    where: { id: product_info_id, status: StatusEnum.ACTIVE }
                });

                if (!product_info) throw new NotFound(`Produto ${product_info_id} não encontrado`);

                const promotionProduct = TransactionManager.create(PromotionProduct, {
                    product_info_id,
                    promotion_id: promotion.id
                });

                await TransactionManager.save(PromotionProduct, promotionProduct);
            }

            return promotion;
        });
    }

    static async delete(promotion_id: number) {
        const promotion = await AppDataSource.getRepository(Promotion).findOne({
            where: { id: promotion_id, status: StatusEnum.ACTIVE }
        });

        if (!promotion) throw new NotFound("Promoção não encontrada");

        promotion.status = StatusEnum.REMOVED;
        await AppDataSource.getRepository(Promotion).save(promotion);
    }

    static async finalize(promotion_id: number) {
        const promotion = await AppDataSource.getRepository(Promotion).findOne({
            where: { id: promotion_id, status: StatusEnum.ACTIVE }
        });

        if (!promotion) throw new NotFound("Promoção não encontrada");

        promotion.end = new Date();
        await AppDataSource.getRepository(Promotion).save(promotion);
    }

    static apply(
        promotion: PromotionColumns,
        promotion_products: PromotionProductColumns[],
        product_mapping: { product_info: ProductInfoColumns; quantity: number }[]
    ) {
        let total = 0;
        let applied = false;

        if (promotion.type === PromotionStyleEnum.PERCENTAGE) {
            product_mapping.sort((a, b) => b.product_info.price - a.product_info.price);

            for (const item of product_mapping) {
                if (promotion_products.some(p => p.id === item.product_info.product_id)) {
                    const count = Math.min(item.quantity, promotion.constraint);
                    if (count <= 0) continue;

                    const discount = Math.floor(
                        count * item.product_info.price * (promotion.value / 100)
                    );

                    total -= discount;
                    promotion.constraint -= count;
                    applied = true;

                    if (promotion.constraint <= 0) break;
                }
            }
        } else {
            const subtotal = product_mapping.reduce(
                (sum, p) => sum + p.product_info.price * p.quantity,
                0
            );

            const eligible = product_mapping.some(p =>
                promotion_products.some(prod => prod.id === p.product_info.product_id)
            );

            if (subtotal > promotion.constraint && eligible) {
                total -= promotion.value;
                applied = true;
            }
        }

        if (!applied) throw new BadRequest("Não foi possível aplicar à promoção");

        return total;
    }

    static async validate(TransactionManager: EntityManager, promotion_id: number) {
        const promotion = await TransactionManager.findOneBy(Promotion, {
            id: promotion_id,
            start: LessThanOrEqual(new Date()),
            end: MoreThanOrEqual(new Date()),
            status: StatusEnum.ACTIVE
        });

        if (!promotion) throw new BadRequest("A promoção escolhida está inválida");

        const products = await TransactionManager.findBy(PromotionProduct, {
            promotion_id
        });

        return { promotion, products } as PromotionData;
    }

    static async getAllByBranch(branch_id: number) {
        return await AppDataSource.getRepository(Promotion).find({
            where: {
                branch_id,
                status: In([StatusEnum.ACTIVE, StatusEnum.INACTIVE])
            },
            order: {
                start: "DESC"
            }
        });
    }
}

export default PromotionService;
