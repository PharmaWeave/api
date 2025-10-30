import { BaseEntity, StatusType } from "@/database/base-entity";

import { ProductInfoColumns } from "@/product/models/product-info";
import { BrandUser } from "@/user/models/user";

import { EntitySchema } from "typeorm";

export interface ProductColumns {
    id: number;

    name: string;
    description: string;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;

    brand: BrandUser;
    product_info: ProductInfoColumns

    brand_id: number;
}

export const Product = new EntitySchema<ProductColumns>({
    name: "product",
    tableName: "product",
    columns: {
        ...BaseEntity,
        name: {
            name: "name",
            type: "varchar",
            length: 64,
            nullable: false
        },
        description: {
            name: "description",
            type: "varchar",
            length: 256,
            nullable: true
        },
        brand_id: {
            type: "integer",
            name: "brand_id",
            nullable: false
        }
    },
    relations: {
        brand: {
            type: "many-to-one",
            target: "user",
            joinColumn: {
                name: "brand_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        },
        product_info: {
            type: "one-to-many",
            target: "product_info",
            inverseSide: "product"
        }
    },
    uniques: [
        {
            name: "UQ_product_name_brand",
            columns: ["name", "brand_id"]
        }
    ]
});
