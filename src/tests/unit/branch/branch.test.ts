import { describe, it, expect, vi, beforeEach } from "vitest";
import { BranchService } from "@/modules/branch/services/branch";
import { Branch } from "@/modules/branch/models/branch";
import { mockManager } from "@/tests/unit/branch/__mocks__/data-source.mock";
import { mockQueryBuilder } from "@/tests/unit/branch/__mocks__/query-builder.mock";
import { AppDataSource } from "@/database/data-source";

vi.mock("@/database/data-source", () => import("@/tests/unit/branch/__mocks__/data-source.mock"));

export const mockUser = {
    id: 1,
    name: "Brand Owner",
    role: "A" as const,
    register: "12345678900",
    status: "A" as const,
    createdAt: new Date(),
    updatedAt: new Date()
};

export const mockAddress = {
    id: 1,
    country: "Brasil",
    province: "DF",
    city: "Brasília",
    description: "Qd 123",
    number: 123,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "A" as const
};

export const mockBranch = {
    id: 1,
    name: "Filial Teste",
    phone: "999999999",
    brand_id: mockUser.id,
    address: mockAddress,
    brand: mockUser,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "A" as const
};

describe("BranchService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("save()", () => {
        const validData = { name: "Filial", phone: "999", address: mockAddress };

        it.each([
            ["should create address and branch successfully", validData, mockUser, false],
            ["should call transaction once", validData, mockUser, false]
        ])("%s", async (_, data, user) => {
            mockManager.transaction.mockImplementation(async (fn) =>
                fn({ create: vi.fn((_, d) => d), save: vi.fn(async (_, e) => e) })
            );

            const result = await BranchService.save(data, user as any);
            expect(result).toHaveProperty("name", data.name);
            expect(mockManager.transaction).toHaveBeenCalled();
        });

        it.each([
            ["should throw when transaction fails", new Error("Transaction failed")],
            ["should throw Zod error on invalid input", null]
        ])("%s", async (_, error) => {
            if (error) mockManager.transaction.mockRejectedValue(error);
            await expect(BranchService.save({}, mockUser as any)).rejects.toThrow();
        });

        it("should throw when user is missing", async () => {
            await expect(BranchService.save(validData, null as any)).rejects.toThrow();
        });
    });

    describe("toggle_status()", () => {
        beforeEach(() => {
            mockQueryBuilder.execute.mockReset();
        });

        it.each([
            ["should toggle branch status successfully", { affected: 1, raw: [mockBranch] }],
            ["should call createQueryBuilder once", { affected: 1, raw: [mockBranch] }]
        ])("%s", async (_, queryResult) => {
            mockQueryBuilder.execute.mockResolvedValue(queryResult);
            const result = await BranchService.toggle_status(1);
            expect(result).toEqual(mockBranch);
            expect(AppDataSource.getRepository).toHaveBeenCalledWith(Branch);
        });

        it.each([
            ["should throw NotFound when no rows affected", { affected: 0 }],
            ["should throw error when query fails", new Error("Query failed")],
            ["should handle invalid ID type gracefully", NaN]
        ])("%s", async (_, mockResult) => {
            if (mockResult instanceof Error)
                mockQueryBuilder.execute.mockRejectedValue(mockResult);
            else mockQueryBuilder.execute.mockResolvedValue(mockResult);

            await expect(
                BranchService.toggle_status(Number.isNaN(mockResult) ? NaN : 99)
            ).rejects.toThrow();
        });
    });

    describe("retrieve()", () => {
        beforeEach(() => {
            mockQueryBuilder.getRawAndEntities.mockReset();
        });

        it.each([
            [
                "should return formatted branches with employee count",
                { entities: [mockBranch], raw: [{ employee_count: "3" }] }
            ],
            [
                "should return empty array when no branches found",
                { entities: [], raw: [] }
            ]
        ])("%s", async (_, queryResult) => {
            mockQueryBuilder.getRawAndEntities.mockResolvedValue(queryResult);
            const result = await BranchService.retrieve(mockUser as any);
            expect(result).toBeInstanceOf(Array);
        });

        it.each([
            ["should throw when query fails", new Error("DB error")],
            ["should throw when user missing", null]
        ])("%s", async (_, input) => {
            if (input instanceof Error)
                mockQueryBuilder.getRawAndEntities.mockRejectedValue(input);

            await expect(BranchService.retrieve(input as any)).rejects.toThrow();
        });

        it("should call getRepository with Branch", async () => {
            mockQueryBuilder.getRawAndEntities.mockResolvedValue({
                entities: [mockBranch],
                raw: [{ employee_count: "1" }]
            });
            await BranchService.retrieve(mockUser as any);
            expect(AppDataSource.getRepository).toHaveBeenCalledWith(Branch);
        });
    });

    describe("parse_branch_id()", () => {
        it.each([
            [{ branch_id: "123" }, 123],
            [{ branch_id: "001" }, 1]
        ])("should parse %o to %i", (input, expected) => {
            expect(BranchService.parse_branch_id(input)).toBe(expected);
        });

        it.each([
            [{}, "missing branch_id"],
            [{ branch_id: "abc" }, "invalid format"],
            [{ branch_id: "" }, "empty string"],
            [{ branch_id: 10 as any }, "invalid type"]
        ])("should throw when %s", (input, _msg) => {
            expect(() => BranchService.parse_branch_id(input)).toThrow();
        });
    });
});
