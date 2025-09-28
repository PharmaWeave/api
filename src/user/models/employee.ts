import { BaseEntity, StatusType } from "@/database/base-entity";
import { PublicUser, RoleType } from "@/user/models/base-user";

import { EntitySchema } from "typeorm";

export interface EmployeeColumns {
    id: number;
    createdAt: number;
    updatedAt: number;
    status: StatusType;
    name?: string;
    email?: string;
    role: RoleType;
    cpf: string;
    salary: number;
    password: string;
}

export const Employee = new EntitySchema<EmployeeColumns>({
    name: 'employee',
    tableName: 'user',
    columns: {
        ...BaseEntity,
        ...PublicUser,
        cpf: {
            name: 'register',
            type: 'varchar',
            length: 14,
            nullable: false,
            unique: true,
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
    },
});
