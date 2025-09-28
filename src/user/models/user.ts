import { BaseEntity } from "@/database/base-entity";
import { PublicUser } from "@/user/models/base-user";

import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
    name: 'user',
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
    },
});
