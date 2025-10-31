import { z } from "zod";

export interface SaleItemInterface {
    product_id: number;
    quantity: number;
}

export const SaleValidator = z.object({
    user_id: z.number().int().positive(),
    sale_items: z
        .object({
            product_id: z.number().int().positive(),
            quantity: z.number().int().positive()
        })
        .array()
        .refine(
            (items) => {
                const ids = items.map((i) => i.product_id);
                return new Set(ids).size === ids.length;
            },
            { message: "Os produtos devem ser únicos." }
        ),
    promotion_id: z.int().positive().optional()
});
