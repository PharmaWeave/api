import { z } from "zod";

export const AddressValidator = z.object({
    country: z.string().min(1).max(128),
    province: z.string().min(1).max(128),
    city: z.string().min(1).max(128),
    description: z.string().min(1).max(256),
    number: z.number().int()
});

export const BranchValidator = z.object({
    name: z.string().min(1).max(64),
    phone: z.string().optional(),
    address: AddressValidator
});
