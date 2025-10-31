import { vi, describe, it, expect, beforeEach } from "vitest";
import SaleService from "@/modules/sale/services/sale";
import StockService from "@/modules/sale/services/stock";
import SaleRepository from "@/modules/sale/repositories/sale";
import PromotionService from "@/modules/promotion/services/promotion";
import { RequestUser } from "@/middlewares/auth";
import { mockSale, mockTransactionManager, mockUser } from "./__mocks__/sale.mock";

vi.mock("@/database/data-source", () => import("@/tests/unit/sale/__mocks__/sale.mock"));

beforeEach(() => {
    vi.clearAllMocks();
});

const saveTestCases = [
    {
        input: { user_id: 2, sale_items: [{ product_id: 1, quantity: 2 }] },
        user: mockUser,
        expected: mockSale,
        shouldPass: true,
        description: "saves sale successfully"
    },
    {
        input: { user_id: 99, sale_items: [{ product_id: 1, quantity: 2 }] },
        user: mockUser,
        expectedError: "Usuário não encontrado na filial",
        shouldPass: false,
        description: "fails when buyer not found"
    }
];

const calculateTestCases = [
    {
        sale_items: [{ product_id: 1, quantity: 2 }],
        branch_id: 1,
        promotion: undefined,
        shouldPass: true,
        description: "calculates total without promotion"
    },
    {
        sale_items: [{ product_id: 1, quantity: 2 }],
        branch_id: 1,
        promotion: { promotion: {}, products: [] },
        shouldPass: true,
        description: "calculates total with promotion"
    }
];

const rollbackTestCases = [
    {
        sale_id: 1,
        exists: true,
        shouldPass: true,
        description: "rollback existing sale"
    },
    {
        sale_id: 99,
        exists: false,
        shouldPass: false,
        expectedError: "A venda não foi encontrada para dar rollback",
        description: "fails rollback when sale not found"
    }
];

const historyTestCases = [
    { user_id: 2, expected: [mockSale], description: "returns sale history" }
];

describe("SaleService", () => {

    describe("save()", () => {
        it.each(saveTestCases)("$description", async ({ input, user, expected, expectedError, shouldPass }) => {
            if (shouldPass) {
                mockTransactionManager.findOneBy.mockResolvedValue({ id: 2, role: "USER" });
                (StockService.checkAndDeduct as any).mockResolvedValue({ price: 100 });
                (SaleRepository.create as any).mockResolvedValue(mockSale);
                (SaleRepository.createSaleItems as any).mockResolvedValue(undefined);
                (SaleRepository.findById as any).mockResolvedValue(mockSale);

                const result = await SaleService.save(input, user as RequestUser);
                expect(result).toEqual(expected);
            } else {
                mockTransactionManager.findOneBy.mockResolvedValue(null);
                await expect(SaleService.save(input, user as RequestUser)).rejects.toThrow(expectedError);
            }
        });
    });

    describe("calculate()", () => {
        it.each(calculateTestCases)("$description", async ({ sale_items, branch_id, promotion }) => {
            (StockService.checkAndDeduct as any).mockResolvedValue({ price: 100 });
            (PromotionService.apply as any).mockReturnValue(50);

            const { total_amount, product_mapping } = await SaleService.calculate(mockTransactionManager as any, sale_items, branch_id, promotion as any);
            expect(total_amount).toBeGreaterThan(0);
            expect(product_mapping).toHaveLength(sale_items.length);
        });
    });

    describe("rollback()", () => {
        it.each(rollbackTestCases)("$description", async ({ sale_id, exists, shouldPass, expectedError }) => {
            (SaleRepository.findById as any).mockResolvedValue(exists ? mockSale : null);
            (StockService.restore as any).mockResolvedValue(undefined);
            mockTransactionManager.save.mockResolvedValue(mockSale);

            if (shouldPass) {
                await SaleService.rollback(sale_id);
            } else {
                await expect(SaleService.rollback(sale_id)).rejects.toThrow(expectedError);
            }
        });
    });

    describe("history()", () => {
        it.each(historyTestCases)("$description", async ({ user_id, expected }) => {
            (SaleRepository.findByUserId as any).mockResolvedValue(expected);
            const result = await SaleService.history(user_id);
            expect(result).toEqual(expected);
        });
    });

    describe("metrics()", () => {
        it("returns metrics for branch", async () => {
            const result = await SaleService.metrics(mockUser as RequestUser);
            expect(result[0]).toHaveProperty("total_spent");
            expect(result[0]).toHaveProperty("total_purchases");
        });
    });

    describe("getAllByBranch()", () => {
        it("returns paginated sales", async () => {
            const result = await SaleService.getAllByBranch(mockUser as RequestUser, 1, 10);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.total_pages).toBe(1);
        });
    });

});
