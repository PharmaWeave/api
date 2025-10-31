import { vi } from "vitest";
import { User } from "@/modules/user/models/user";
import { Branch } from "@/modules/branch/models/branch";
import { StatusEnum } from "@/database/base-entity";

const mockBranchRepo = { findOneBy: vi.fn() };
const mockUserRepo = {
    findOneBy: vi.fn(),
    create: vi.fn((data) => ({
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.INACTIVE,
        ...data
    })),
    save: vi.fn(async (obj) => obj)
};

const mockManager = {
    getRepository: vi.fn((entity) => {
        if (entity === Branch) return mockBranchRepo;
        if (entity === User) return mockUserRepo;
        return {};
    })
};

const mockQueryRunner = {
    connect: vi.fn(),
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
    release: vi.fn(),
    manager: mockManager
};

export const __mocks = { mockBranchRepo, mockUserRepo, mockManager, mockQueryRunner };

export const AppDataSource = {
    manager: mockManager,
    createQueryRunner: vi.fn(() => mockQueryRunner)
};

export default { AppDataSource, __mocks };
