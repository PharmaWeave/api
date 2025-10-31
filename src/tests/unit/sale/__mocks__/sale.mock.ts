import { vi } from "vitest";
import { StatusEnum } from "@/database/base-entity";

export const mockTransactionManager = {
    findOneBy: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn()
};

export const mockUser = { id: 1, branch_id: 1 };

export const mockSale = {
    id: 1,
    total_amount: 200,
    user_id: 2,
    employee_id: 1,
    sale_items: [],
    status: StatusEnum.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date()
};

export const AppDataSource = {
    manager: { transaction: vi.fn((fn) => fn(mockTransactionManager)) },
    getRepository: vi.fn(() => ({
        createQueryBuilder: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            addSelect: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValue([[mockSale], 1]),
            groupBy: vi.fn().mockReturnThis(),
            addGroupBy: vi.fn().mockReturnThis(),
            getRawMany: vi.fn().mockResolvedValue([
                {
                    user_id: 2,
                    user_name: "User A",
                    user_email: "usera@test.com",
                    user_register: "123",
                    total_spent: 200,
                    total_purchases: 1,
                    last_purchase: new Date(),
                    user_status: StatusEnum.ACTIVE
                }
            ])
        }))
    }))
};

vi.mock("@/modules/sale/services/stock");
vi.mock("@/modules/sale/repositories/sale");
vi.mock("@/modules/promotion/services/promotion");

export default { AppDataSource };
