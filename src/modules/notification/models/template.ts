import { BaseEntity, StatusType } from "@/database/base-entity";

import { EntitySchema } from "typeorm";

export interface TemplateColumns {
    id: number;

    key: string;
    subject: string;
    template: string;

    createdAt: Date;
    updatedAt: Date;
    status: StatusType;
}

export const Template = new EntitySchema<TemplateColumns>({
    name: "template",
    tableName: "template",
    columns: {
        ...BaseEntity,
        key: {
            name: "key",
            type: "varchar",
            length: 64,
            unique: true,
            nullable: false
        },
        subject: {
            name: "subject",
            type: "varchar",
            length: 64,
            nullable: false
        },
        template: {
            name: "template",
            type: "text",
            nullable: false
        }
    }
});
