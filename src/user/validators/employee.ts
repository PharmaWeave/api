import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";

export const EmployeeValidator = z.object({
    register: z
        .string()
        .length(11, "O CPF deve ter 11 dígitos")
        .refine((val) => cpf.isValid(val), { message: "CPF Inválido" }),
    salary: z.int().positive(),
    name: z.string().min(1, "Nome do empregado é obrigatório"),
    email: z.email({ message: "Formato de email inválido" }).optional(),
    branch_id: z.int().positive()
});

export const EmployeePasswordValidator = z.object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});
