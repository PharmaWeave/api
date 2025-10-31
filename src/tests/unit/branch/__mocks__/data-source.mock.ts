import { vi } from "vitest";
import { mockQueryBuilder } from "./query-builder.mock";

export const mockTransaction = vi.fn();
export const mockManager = {
    transaction: mockTransaction,
    create: vi.fn(),
    save: vi.fn()
};

export const mockRepository = {
    createQueryBuilder: vi.fn(() => {
        return mockQueryBuilder;
    })
};

export const AppDataSource = {
    manager: mockManager,
    getRepository: vi.fn(() => mockRepository)
};

export default { AppDataSource, mockManager };
