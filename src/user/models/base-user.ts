import { BaseEntity } from "@/database/base-entity";

import { EntitySchemaColumnOptions, EntitySchema } from 'typeorm';

export type RoleType = 'A' | 'M' | 'E' | 'U';

export const PublicUser: Record<string, EntitySchemaColumnOptions> = {
    name: {
        name: 'name',
        type: 'varchar',
        length: 32,
        nullable: true,
    },
    email: {
        name: 'email',
        type: 'varchar',
        length: 128,
        nullable: true,
    },
    role: {
        name: 'role',
        type: 'enum',
        enum: ['A', 'M', 'E', 'U'] as RoleType[],
        default: 'U',
        nullable: false,
    }
};

export const BaseUser = new EntitySchema({
    name: 'base_user',
    tableName: 'user',
    columns: {
        ...BaseEntity,
        ...PublicUser,
        register: {
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
        salary: {
            name: 'salary',
            type: 'int',
            nullable: true,
        },
        password: {
            name: 'password',
            type: 'text',
            nullable: true,
        },
    }
});
