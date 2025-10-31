import { BranchColumns } from "@/modules/branch/models/branch";
import { BaseEntity, StatusType } from "@/database/base-entity";

import { ProductColumns } from "@/modules/product/models/product";

import { EntitySchema } from "typeorm";

export interface ProductInfoColumns {
    id: number;

    price: number;
    stock: number;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;

    product: ProductColumns;
    branch: BranchColumns

    product_id: number;
    branch_id: number;
}

export const ProductInfo = new EntitySchema<ProductInfoColumns>({
    name: "product_info",
    tableName: "product_info",
    columns: {
        ...BaseEntity,
        price: {
            name: "price",
            type: "integer",
            default: 0,
            nullable: false
        },
        stock: {
            name: "stock",
            type: "integer",
            default: 0,
            nullable: false
        },
        product_id: {
            type: "integer",
            name: "product_id",
            nullable: false
        },
        branch_id: {
            type: "integer",
            name: "branch_id",
            nullable: false
        }
    },
    relations: {
        branch: {
            type: "many-to-one",
            target: "branch",
            joinColumn: {
                name: "branch_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        },
        product: {
            type: "many-to-one",
            target: "product",
            joinColumn: {
                name: "product_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        }
    }
});
