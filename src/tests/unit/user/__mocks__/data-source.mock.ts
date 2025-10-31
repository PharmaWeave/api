import { StatusEnum } from "@/database/base-entity";
import { vi } from "vitest";

export const RepositoryMock = {
    create: vi.fn((data) => ({
        id: 1,
        status: StatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
    })),
    save: vi.fn(async (user) => user),
    findOneBy: vi.fn(),
    merge: vi.fn((target, data) => Object.assign(target, data))
};

export const AppDataSource = {
    getRepository: vi.fn(() => RepositoryMock)
};

export default AppDataSource;
