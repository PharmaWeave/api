import { z } from "zod";
import { PromotionStyleEnum } from "../models/promotion";

export const CreatePromotionValidator = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.enum([PromotionStyleEnum.VALUE, PromotionStyleEnum.PERCENTAGE]).optional(),
    value: z.number().nonnegative(),
    constraint: z.number().nonnegative(),
    start: z.string().transform((s) => new Date(s)),
    end: z.string().transform((s) => new Date(s)),
    branch_id: z.number().int().positive(),
    product_info_ids: z.array(z.number().int().positive()).nonempty()
});