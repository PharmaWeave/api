import { BaseEntity, StatusType } from "@/database/base-entity";

import { AddressColumns } from "@/branch/models/address";
import { BrandUser, UserColumns } from "@/user/models/user";

import { EntitySchema } from "typeorm";

export interface BranchColumns {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
    name: string;
    phone: string;

    brand: BrandUser;
    address: AddressColumns;
    users: UserColumns;

    brand_id: number;
    address_id: number;
}

export const Branch = new EntitySchema<BranchColumns>({
    name: "branch",
    tableName: "branch",
    columns: {
        ...BaseEntity,
        name: {
            name: "name",
            type: "varchar",
            length: 64,
            nullable: false
        },
        phone: {
            name: "phone",
            type: "varchar",
            nullable: true
        },
        brand_id: {
            type: "integer",
            name: "brand_id",
            nullable: false
        },
        address_id: {
            type: "integer",
            name: "address_id",
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
        address: {
            type: "one-to-one",
            target: "address",
            joinColumn: {
                name: "address_id",
                referencedColumnName: "id"
            },
            nullable: false,
            onDelete: "CASCADE"
        },
        users: {
            type: "one-to-many",
            target: "user",
            inverseSide: "branch"
        }
    },
    uniques: [
        {
            name: "UQ_branch_name_brand",
            columns: ["name", "brand_id"]
        }
    ]
});
