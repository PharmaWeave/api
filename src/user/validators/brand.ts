import { z } from "zod";
import { cnpj } from "cpf-cnpj-validator";

export const BrandValidator = z.object({
    register: z
        .string()
        .length(14, "O CNPJ deve ter 14 dígitos")
        .refine((val) => cnpj.isValid(val), { message: "CNPJ Inválido" }),
    legal_name: z.string().min(1, "Razão social é obrigatória"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    name: z.string().optional(),
    email: z.email({ message: "Formato de email inválido" }).optional()
});

