import { EntitySchemaColumnOptions } from 'typeorm';

export type StatusType = 'A' | 'I' | 'R';

export const BaseEntity: Record<string, EntitySchemaColumnOptions> = {
    id: {
        type: 'int',
        name: 'id',
        generated: true,
        primary: true,
    },
    createdAt: {
        type: 'timestamp',
        name: 'created_at',
        createDate: true,
    },
    updatedAt: {
        type: 'timestamp',
        name: 'updated_at',
        updateDate: true,
    },
    status: {
        type: 'enum',
        name: 'status',
        enum: ['A', 'I', 'R'] as StatusType[],
        default: 'A',
    },
};
