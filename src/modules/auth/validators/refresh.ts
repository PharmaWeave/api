import { z } from "zod";

export const RefreshValidator = z.object({
    refresh_token: z.string()
});

export const RefreshPayloadValidator = z.object({
    id: z.number().positive(),
    brand_id: z.number().positive(),
    branch_id: z.number().positive().optional(),
    role: z.string()
});