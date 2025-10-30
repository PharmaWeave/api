import { BranchColumns } from "@/branch/models/branch";
import { BaseEntity, StatusType } from "@/database/base-entity";

import { EntitySchema } from "typeorm";

export const PromotionStyleEnum = {
    VALUE: "V",
    PERCENTAGE: "P"
} as const;

export type PromotionStyleType = typeof PromotionStyleEnum[keyof typeof PromotionStyleEnum];

export interface PromotionColumns {
    id: number;

    title: string;
    description: string;
    type: PromotionStyleType;
    value: number;
    constraint: number;

    start: Date;
    end: Date;

    branch: BranchColumns;

    branch_id: number;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export const Promotion = new EntitySchema<PromotionColumns>({
    name: "promotion",
    tableName: "promotion",
    columns: {
        ...BaseEntity,
        title: {
            type: "varchar",
            length: 64,
            nullable: false
        },
        description: {
            type: "varchar",
            length: 256,
            nullable: true
        },
        type: {
            type: "enum",
            enum: PromotionStyleEnum,
            default: PromotionStyleEnum.PERCENTAGE,
            nullable: false
        },
        value: {
            type: "integer",
            default: 0,
            nullable: false
        },
        constraint: {
            type: "integer",
            default: 0,
            nullable: false
        },
        start: {
            type: "timestamp",
            nullable: false
        },
        end: {
            type: "timestamp",
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
        }
    }
});

