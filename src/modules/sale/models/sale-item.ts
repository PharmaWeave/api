import { BaseEntity, StatusType } from "@/database/base-entity";
import { ProductInfoColumns } from "@/modules/product/models/product-info";
import { SaleColumns } from "@/modules/sale/models/sale";
import { EntitySchema } from "typeorm";

export interface SaleItemColumns {
    id: number;

    price: number;
    quantity: number;

    sale_id: number;
    product_info_id: number;

    sale: SaleColumns;
    product_info: ProductInfoColumns;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export const SaleItem = new EntitySchema<SaleItemColumns>({
    name: "sale_item",
    tableName: "sale_item",
    columns: {
        ...BaseEntity,
        price: {
            type: "integer",
            name: "price",
            default: 0,
            nullable: false
        },
        quantity: {
            type: "integer",
            name: "quantity",
            default: 1,
            nullable: false
        },
        sale_id: {
            type: "integer",
            name: "sale_id",
            nullable: false
        },
        product_info_id: {
            type: "integer",
            name: "product_info_id",
            nullable: false
        }
    },
    relations: {
        sale: {
            type: "many-to-one",
            target: "sale",
            joinColumn: {
                name: "sale_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        },
        product_info: {
            type: "many-to-one",
            target: "product_info",
            joinColumn: {
                name: "product_info_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        }
    }
});
