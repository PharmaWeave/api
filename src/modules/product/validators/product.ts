import { z } from "zod";

export const InfoValidator = z.object({
    price: z.int().positive(),
    stock: z.int().positive().optional().default(0)
});

export const ProductValidator = z.object({
    name: z.string().min(1).max(64),
    description: z.string().max(256).optional(),
    info: InfoValidator
});

export const ProductPatchValidator = z.object({
    name: z.string().min(1).max(64).optional(),
    description: z.string().max(256).optional(),
    info: InfoValidator.optional()
});
