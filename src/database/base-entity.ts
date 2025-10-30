import { EntitySchemaColumnOptions } from "typeorm";

export const StatusEnum = {
    ACTIVE: "A",
    INACTIVE: "I",
    REMOVED: "R"
} as const;

export type StatusType = typeof StatusEnum[keyof typeof StatusEnum];

export const BaseEntity: Record<string, EntitySchemaColumnOptions> = {
    id: {
        type: "int",
        name: "id",
        generated: true,
        primary: true
    },
    createdAt: {
        type: "timestamp",
        name: "created_at",
        createDate: true
    },
    updatedAt: {
        type: "timestamp",
        name: "updated_at",
        updateDate: true
    },
    status: {
        type: "enum",
        name: "status",
        enum: Object.values(StatusEnum),
        default: StatusEnum.ACTIVE
    }
};
