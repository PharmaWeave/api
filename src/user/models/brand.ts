import { BaseEntity, StatusType } from "@/database/base-entity";
import { PublicUser, RoleType } from "@/user/models/base-user";

import { EntitySchema } from "typeorm";

export interface BrandColumns {
    id: number;
    createdAt: number;
    updatedAt: number;
    status: StatusType;
    name?: string;
    email?: string;
    role: RoleType;
    cnpj: string;
    legalName: string;
    password: string;
}

export const Brand = new EntitySchema<BrandColumns>({
    name: 'brand',
    tableName: 'user',
    columns: {
        ...BaseEntity,
        ...PublicUser,
        cnpj: {
            name: 'register',
            type: 'varchar',
            length: 14,
            nullable: false,
            unique: true,
        },
        legalName: {
            name: 'legal_name',
            type: 'varchar',
            length: 64,
            nullable: true,
        },
        password: {
            name: 'password',
            type: 'text',
            nullable: true,
        },
    },
});
