import { BaseEntity, StatusType } from "@/database/base-entity";

import { ProductInfoColumns } from "@/modules/product/models/product-info";
import { PromotionColumns } from "@/modules/promotion/models/promotion";

import { EntitySchema } from "typeorm";

export interface PromotionProductColumns {
    id: number;

    product_info: ProductInfoColumns;
    promotion: PromotionColumns;

    product_info_id: number;
    promotion_id: number;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export const PromotionProduct = new EntitySchema<PromotionProductColumns>({
    name: "promotion_product",
    tableName: "promotion_product",
    columns: {
        ...BaseEntity,
        product_info_id: {
            type: "integer",
            name: "product_info_id",
            nullable: false
        },
        promotion_id: {
            type: "integer",
            name: "promotion_id",
            nullable: false
        }
    },
    relations: {
        product_info: {
            type: "many-to-one",
            target: "product_info",
            joinColumn: {
                name: "product_info_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        },
        promotion: {
            type: "many-to-one",
            target: "promotion",
            joinColumn: {
                name: "promotion_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        }
    },
    uniques: [
        {
            name: "UQ_product_info_promotion",
            columns: ["product_info_id", "promotion_id"]
        }
    ]
});
