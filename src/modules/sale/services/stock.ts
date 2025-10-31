import { BadRequest } from "@/utils/errors/bad-request";
import { NotFound } from "@/utils/errors/not-found";
import { Product, ProductColumns } from "@/modules/product/models/product";
import { SaleItemColumns } from "@/modules/sale/models/sale-item";
import { StatusEnum } from "@/database/base-entity";
import { ProductInfo, ProductInfoColumns } from "@/modules/product/models/product-info";

class StockService {

    static async checkAndDeduct(
        TransactionManager: any,
        product_id: number,
        branch_id: number,
        quantity: number
    ): Promise<ProductInfoColumns> {
        const product_info = await TransactionManager.findOne(ProductInfo, {
            where: { product_id, branch_id },
            lock: { mode: "pessimistic_write" }
        });

        if (!product_info) throw new NotFound(`O produto ${product_id} não foi encontrado na filial!`);

        const product = await TransactionManager.findOneBy(Product, { id: product_info.product_id }) as ProductColumns;

        if (product_info.stock < quantity)
            throw new BadRequest(`O produto ${product.name} não tem estoque suficiente`);

        product_info.stock -= quantity;
        await TransactionManager.save(ProductInfo, product_info);

        return product_info;
    }

    static async restore(TransactionManager: any, sale_items: SaleItemColumns[]) {
        for (const item of sale_items) {
            const product_info = await TransactionManager.findOne(ProductInfo, {
                where: { id: item.product_info_id, status: StatusEnum.ACTIVE }
            });

            if (!product_info) continue;

            product_info.stock += item.quantity;
            await TransactionManager.save(ProductInfo, product_info);
        }
    }
}

export default StockService;
