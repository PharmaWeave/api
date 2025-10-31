// tests/mocks/promotion.mocks.ts
import { vi } from "vitest";

export const mockTransactionManager = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    findBy: vi.fn()
};

export const mockRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
    find: vi.fn()
};

export const AppDataSource = {
    manager: {
        transaction: vi.fn(async (cb: any) => cb(mockTransactionManager))
    },
    getRepository: vi.fn(() => mockRepository)
};

export default { AppDataSource };
