import { StatusEnum } from "@/database/base-entity";
import { AppDataSource } from "@/database/data-source";
import { ProductInfoColumns } from "@/product/models/product-info";
import { Sale } from "@/sale/models/sale";
import { SaleItem } from "@/sale/models/sale-item";
import { EntityManager, In } from "typeorm";

class SaleRepository {

    static async create(
        TransactionManager: EntityManager,
        total_amount: number,
        user_id: number,
        employee_id: number,
        promotion_id?: number
    ) {
        const sale = TransactionManager.create(Sale, {
            total_amount,
            user_id,
            employee_id,
            promotion_id
        });
        await TransactionManager.save(Sale, sale);
        return sale;
    }

    static async createSaleItems(
        TransactionManager: EntityManager,
        sale_id: number,
        items: {
            product_info: ProductInfoColumns,
            quantity: number
        }[]
    ) {
        for (const { product_info, quantity } of items) {
            const sale_item = TransactionManager.create(SaleItem, {
                price: product_info.price,
                quantity,
                sale_id,
                product_info_id: product_info.id
            });
            await TransactionManager.save(SaleItem, sale_item);
        }
    }

    static async findById(
        sale_id: number,
        TransactionManager?: EntityManager
    ) {
        const query = {
            where: {
                id: sale_id
            },
            relations: ["sale_items"]
        };

        if (TransactionManager) return await TransactionManager.findOne(Sale, query);
        return await AppDataSource.getRepository(Sale).findOne(query);
    }

    static async findByUserId(
        user_id: number
    ) {
        return await AppDataSource.getRepository(Sale).find({
            where: {
                user_id: user_id,
                status: In([StatusEnum.ACTIVE, StatusEnum.INACTIVE])
            },
            relations: ["sale_items"]
        });
    }
}

export default SaleRepository;
