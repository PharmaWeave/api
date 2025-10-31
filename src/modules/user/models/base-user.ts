import { EntitySchemaColumnOptions } from "typeorm";

export const RoleEnum = {
    ADMIN: "A",
    MANAGER: "M",
    EMPLOYEE: "E",
    USER: "U"
} as const;

export type RoleType = typeof RoleEnum[keyof typeof RoleEnum];

export const PublicUser: Record<string, EntitySchemaColumnOptions> = {
    name: {
        name: "name",
        type: "varchar",
        length: 32,
        nullable: true
    },
    email: {
        name: "email",
        type: "varchar",
        length: 128,
        nullable: true
    },
    role: {
        name: "role",
        type: "enum",
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER,
        nullable: false
    }
};
