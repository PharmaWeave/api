import { BaseEntity, StatusType } from "@/database/base-entity";
import { BranchColumns } from "@/modules/branch/models/branch";
import { SaleColumns } from "@/modules/sale/models/sale";
import { PublicUser, RoleType } from "@/modules/user/models/base-user";

import { EntitySchema } from "typeorm";

export interface UserColumns {
    id: number;
    name?: string;
    email?: string;
    role: RoleType;
    register: string;
    legal_name?: string;
    salary?: number;
    password?: string;

    branch?: BranchColumns;
    sales?: SaleColumns;

    branch_id?: number;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export type BrandUser = Omit<UserColumns, "salary" | "branch_id" | "branch"> & {
    role: "A"
};

export type EmployeeUser = Omit<UserColumns, "legal_name"> & {
    role: "E" | "M",
    email: string,
    branch: BranchColumns,
    branch_id: number
};

export type CommonUser = Omit<UserColumns, "salary" | "legal_name" | "password"> & {
    role: "U"
};

export const User = new EntitySchema<UserColumns>({
    name: "user",
    tableName: "user",
    columns: {
        ...BaseEntity,
        ...PublicUser,
        register: {
            name: "register",
            type: "varchar",
            length: 14,
            nullable: false
        },
        legal_name: {
            name: "legal_name",
            type: "varchar",
            length: 64,
            nullable: true
        },
        salary: {
            name: "salary",
            type: "int",
            nullable: true
        },
        password: {
            name: "password",
            type: "text",
            nullable: true
        },
        branch_id: {
            type: "integer",
            name: "branch_id",
            nullable: true
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
            nullable: true,
            onDelete: "CASCADE"
        },
        sales: {
            type: "one-to-many",
            target: "sale",
            inverseSide: "user"
        }
    },
    indices: [
        {
            name: "UQ_user_register_branch_not_null",
            columns: ["register", "branch_id"],
            unique: true,
            where: `"branch_id" IS NOT NULL`
        },
        {
            name: "UQ_user_register_branch_null",
            columns: ["register"],
            unique: true,
            where: `"branch_id" IS NULL`
        }
    ]
});
