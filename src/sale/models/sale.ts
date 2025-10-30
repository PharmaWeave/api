import { BaseEntity, StatusType } from "@/database/base-entity";
import { BrandUser, CommonUser } from "@/user/models/user";
import { SaleItemColumns } from "@/sale/models/sale-item";

import { EntitySchema } from "typeorm";
import { PromotionColumns } from "@/promotion/models/promotion";

export interface SaleColumns {
    id: number;

    total_amount: number;

    user_id: number;
    employee_id: number;
    promotion_id?: number;

    user: CommonUser;
    employee: BrandUser;
    promotion?: PromotionColumns;
    sale_items: SaleItemColumns[];

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export const Sale = new EntitySchema<SaleColumns>({
    name: "sale",
    tableName: "sale",
    columns: {
        ...BaseEntity,
        total_amount: {
            type: "integer",
            name: "total_amount",
            default: 0,
            nullable: false
        },
        user_id: {
            type: "integer",
            name: "user_id",
            nullable: false
        },
        employee_id: {
            type: "integer",
            name: "employee_id",
            nullable: false
        },
        promotion_id: {
            type: "integer",
            name: "promotion_id",
            nullable: true
        }
    },
    relations: {
        user: {
            type: "many-to-one",
            target: "user",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        },
        employee: {
            type: "many-to-one",
            target: "user",
            joinColumn: {
                name: "employee_id",
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
            nullable: true,
            onDelete: "CASCADE"
        },
        sale_items: {
            type: "one-to-many",
            target: "sale_item",
            inverseSide: "sale"
        }
    }
});
