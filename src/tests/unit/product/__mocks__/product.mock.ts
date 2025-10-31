import { Product } from "@/modules/product/models/product";
import { ProductInfo } from "@/modules/product/models/product-info";
import { vi } from "vitest";

export const mockProduct = {
    id: 1,
    name: "Produto A",
    description: "Descrição do Produto A",
    brand_id: 1,
    status: "A",
    createdAt: new Date(),
    updatedAt: new Date(),
    product_info: []
};

export const mockProductInfo = {
    id: 1,
    price: 100,
    stock: 50,
    product_id: 1,
    branch_id: 1,
    status: "A",
    createdAt: new Date(),
    updatedAt: new Date(),
    product: mockProduct,
    branch: { id: 1, name: "Filial", brand_id: 1 }
};

export const mockTransactionManager = {
    create: vi.fn((entity: any, data: any) => ({ ...data, id: 1 })),
    save: vi.fn(async (_entity: any, data: any) => data),
    findOne: vi.fn(
        async (entity: any, options: any): Promise<typeof mockProduct | null> => {
            if (entity === Product && options.where.id !== 1) return null;
            if (entity === ProductInfo && options.where.product_id !== 1) return null;
            return mockProduct;
        }
    ),
    merge: vi.fn()
};

export const AppDataSource = {
    manager: {
        transaction: vi.fn(async (fn: any) => fn(mockTransactionManager))
    },
    getRepository: vi.fn(() => ({
        find: vi.fn(async () => [mockProductInfo])
    }))
};

export const mockUser = { brand_id: 1, branch_id: 1 };

export default { AppDataSource };
