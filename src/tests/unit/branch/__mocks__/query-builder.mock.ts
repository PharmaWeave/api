import { vi } from "vitest";

export const mockQueryBuilder = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    execute: vi.fn(),
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    leftJoinAndMapMany: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getRawAndEntities: vi.fn()
};
