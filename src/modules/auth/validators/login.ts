import { z } from "zod";
import { cnpj, cpf } from "cpf-cnpj-validator";

export const LoginValidator = z.object({
    register: z.string().refine((val) => cnpj.isValid(val) || cpf.isValid(val), {
        message: "CNPJ ou CPF inválido"
    }),
    password: z.string().min(6, "Senha inválida")
});
