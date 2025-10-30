import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";

export const UserValidator = z.object({
    register: z
        .string()
        .length(11, "O CPF deve ter 11 dígitos")
        .refine((val) => cpf.isValid(val), { message: "CPF Inválido" }),
    name: z.string().min(1, "Nome do usuário é obrigatório"),
    email: z.email({ message: "Formato de email inválido" }).optional()
});

export const UserPatchValidator = z.object({
    register: z
        .string()
        .length(11, "O CPF deve ter 11 dígitos")
        .refine((val) => cpf.isValid(val), { message: "CPF Inválido" })
        .optional(),
    name: z.string().optional(),
    email: z.email({ message: "Formato de email inválido" }).optional()
});
