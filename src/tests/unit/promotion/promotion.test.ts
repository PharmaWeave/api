// tests/unit/promotion.service.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import PromotionService from "@/modules/promotion/services/promotion";
import { NotFound } from "@/utils/errors/not-found";
import { BadRequest } from "@/utils/errors/bad-request";
import { mockTransactionManager, mockRepository } from "@/tests/unit/promotion/__mocks__/promotion.mock";
import { PromotionStyleEnum } from "@/modules/promotion/models/promotion";

beforeEach(() => {
    vi.clearAllMocks();
});

vi.mock("@/database/data-source", () => import("@/tests/unit/promotion/__mocks__/promotion.mock"));

describe("PromotionService", () => {
    const createTestCases = [
        {
            input: {
                title: "Promo 10%",
                description: "Desc",
                type: PromotionStyleEnum.PERCENTAGE,
                value: 10,
                constraint: 2,
                start: new Date().toString(),
                end: new Date().toString(),
                branch_id: 1,
                product_info_ids: [1, 2]
            },
            shouldPass: true,
            description: "creates promotion successfully"
        },
        {
            input: {
                title: "Promo fail",
                description: "Desc",
                type: PromotionStyleEnum.PERCENTAGE,
                value: 10,
                constraint: 2,
                start: new Date().toString(),
                end: new Date().toString(),
                branch_id: 1,
                product_info_ids: [99]
            },
            shouldPass: false,
            description: "fails when product info not found"
        }
    ];

    describe("create()", () => {
        it.each(createTestCases)("$description", async ({ input, shouldPass }) => {
            mockTransactionManager.create.mockImplementation((_entity: any, data: any) => ({ id: 1, ...data }));
            mockTransactionManager.save.mockResolvedValue({ id: 1, ...input });
            mockTransactionManager.findOne.mockImplementation(async (_: any, options: any) => {
                if (options.where.id === 99) return null;
                return { id: options.where.id, stock: 10, product_id: options.where.id };
            });

            if (shouldPass) {
                const result = await PromotionService.create(input);
                expect(result).toHaveProperty("id", 1);
                expect(mockTransactionManager.save).toHaveBeenCalled();
            } else {
                await expect(PromotionService.create(input)).rejects.toThrow(NotFound);
            }
        });
    });

    const applyTestCases = [
        {
            promotion: { type: PromotionStyleEnum.PERCENTAGE, value: 10, constraint: 2 },
            products: [{ id: 1 }],
            mapping: [{ product_info: { price: 100, product_id: 1 }, quantity: 1 }],
            expected: -10,
            description: "applies percentage promotion"
        },
        {
            promotion: { type: PromotionStyleEnum.VALUE, value: 50, constraint: 100 },
            products: [{ id: 1 }],
            mapping: [{ product_info: { price: 100, product_id: 1 }, quantity: 2 }],
            expected: -50,
            description: "applies value promotion"
        },
        {
            promotion: { type: PromotionStyleEnum.VALUE, value: 50, constraint: 100 },
            products: [{ id: 2 }],
            mapping: [{ product_info: { price: 100, product_id: 1 }, quantity: 2 }],
            shouldFail: true,
            description: "fails when promotion cannot be applied"
        }
    ];

    describe("apply()", () => {
        it.each(applyTestCases)("$description", ({ promotion, products, mapping, expected, shouldFail }) => {
            if (shouldFail) {
                expect(() => PromotionService.apply(promotion as any, products as any, mapping as any)).toThrow(BadRequest);
            } else {
                const total = PromotionService.apply(promotion as any, products as any, mapping as any);
                expect(total).toBe(expected);
            }
        });
    });

    describe("validate()", () => {
        it("returns promotion data when valid", async () => {
            mockTransactionManager.findOneBy.mockResolvedValue({ id: 1 });
            mockTransactionManager.findBy.mockResolvedValue([{ id: 1 }]);
            const result = await PromotionService.validate(mockTransactionManager as any, 1);
            expect(result).toHaveProperty("promotion");
            expect(result).toHaveProperty("products");
        });

        it("throws BadRequest when promotion invalid", async () => {
            mockTransactionManager.findOneBy.mockResolvedValue(null);
            await expect(PromotionService.validate(mockTransactionManager as any, 1)).rejects.toThrow(BadRequest);
        });
    });

    describe("getAllByBranch()", () => {
        it("returns promotions from repository", async () => {
            mockRepository.find.mockResolvedValue([{ id: 1 }]);
            const result = await PromotionService.getAllByBranch(1);
            expect(result).toHaveLength(1);
        });
    });
});
