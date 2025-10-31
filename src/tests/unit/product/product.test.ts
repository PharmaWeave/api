import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductService from "@/modules/product/services/product";
import { mockTransactionManager, mockProduct, mockProductInfo, mockUser } from "./__mocks__/product.mock";
import { RequestUser } from "@/middlewares/auth";
import { AppDataSource } from "@/database/data-source";
import { Product } from "@/modules/product/models/product";
import { ProductInfo } from "@/modules/product/models/product-info";
import { ZodError } from "zod";

vi.mock("@/database/data-source", () => import("@/tests/unit/product/__mocks__/product.mock"));

describe("ProductService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const saveTestCases = [
        {
            input: { name: "Produto A", description: "Desc", info: { price: 100, stock: 50 } },
            user: mockUser,
            expected: mockProduct,
            shouldPass: true,
            description: "saves product and product info successfully"
        },
        {
            input: { name: "", description: "Desc", info: { price: 100, stock: 50 } },
            user: mockUser,
            shouldPass: false,
            description: "fails validation when name is empty",
            expectedIssues: [
                expect.objectContaining({
                    path: ["name"],
                    code: "too_small",
                    message: expect.stringContaining("Too small")
                })
            ]
        }
    ];

    describe("ProductService.save", () => {
        it.each(saveTestCases)("$description", async ({ input, user, expected, shouldPass, expectedIssues }) => {
            if (shouldPass) {
                const result = await ProductService.save(input, user as RequestUser);
                expect(AppDataSource.manager.transaction).toHaveBeenCalled();
                expect(mockTransactionManager.create).toHaveBeenCalled();
                expect(result).toEqual(expected);
            } else {
                await expect(ProductService.save(input, user as RequestUser)).rejects.toBeInstanceOf(ZodError);
                await expect(ProductService.save(input, user as RequestUser))
                    .rejects.toMatchObject({ issues: expectedIssues });
            }
        });
    });

    const retrieveTestCases = [
        {
            user: mockUser,
            expected: [mockProductInfo],
            shouldPass: true,
            description: "retrieves product info successfully"
        },
        {
            user: null,
            expectedError: "Cannot read",
            shouldPass: false,
            description: "fails when user is missing"
        }
    ];

    describe("retrieve()", () => {
        it.each(retrieveTestCases)("$description", async ({ user, expectedError, shouldPass }) => {
            if (shouldPass) {
                const result = await ProductService.retrieve(user as RequestUser);
                expect(AppDataSource.getRepository).toHaveBeenCalled();
                expect(result[0].id).toBe(mockProductInfo.product.id);
            } else {
                await expect(ProductService.retrieve(user as any)).rejects.toThrow(expectedError);
            }
        });
    });

    const updateTestCases = [
        {
            product_id: 1,
            input: { name: "Produto B", description: "Nova desc", info: { price: 150, stock: 10 } },
            user: mockUser,
            expected: mockProduct,
            shouldPass: true,
            description: "updates product and product info successfully"
        },
        {
            product_id: 999,
            input: { name: "Produto B", description: "Nova desc", info: { price: 150, stock: 10 } },
            user: mockUser,
            expectedError: "Produto não encontrado",
            shouldPass: false,
            description: "fails when product not found"
        }
    ];

    describe("update()", () => {
        it.each(updateTestCases)("$description", async ({ product_id, input, user, expected, expectedError, shouldPass }) => {
            // Ajusta o findOne do mock para simular produto não encontrado
            mockTransactionManager.findOne.mockImplementation(async (entity, options) => {
                if (entity === Product && options.where.id !== 1) return null;
                if (entity === ProductInfo && options.where.product_id !== 1) return null;
                return mockProduct;
            });

            if (shouldPass) {
                const result = await ProductService.update(product_id, input, user as RequestUser);
                expect(AppDataSource.manager.transaction).toHaveBeenCalled();
                expect(mockTransactionManager.merge).toHaveBeenCalled();
                expect(result).toEqual(expected);
            } else {
                await expect(ProductService.update(product_id, input, user as any)).rejects.toThrow(expectedError);
            }
        });
    });
});
