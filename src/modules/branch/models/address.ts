import { BaseEntity, StatusType } from "@/database/base-entity";

import { EntitySchema } from "typeorm";

export interface AddressColumns {
    id: number;
    country: string;
    province: string;
    city: string;
    description: string;
    number: number;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export const Address = new EntitySchema<AddressColumns>({
    name: "address",
    tableName: "address",
    columns: {
        ...BaseEntity,
        country: {
            type: "varchar",
            length: 128,
            name: "country",
            nullable: false
        },
        province: {
            type: "varchar",
            length: 128,
            name: "province",
            nullable: false
        },
        city: {
            type: "varchar",
            length: 128,
            name: "city",
            nullable: false
        },
        description: {
            type: "varchar",
            length: 256,
            name: "description",
            nullable: false
        },
        number: {
            type: "int",
            name: "number",
            nullable: false
        }
    }
});
