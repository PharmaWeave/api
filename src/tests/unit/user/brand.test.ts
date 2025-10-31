import { describe, it, expect, vi, beforeEach } from "vitest";
import BrandService from "@/modules/user/services/brand";
import { RoleEnum } from "@/modules/user/models/base-user";
import { AppDataSource } from "@/database/data-source";
import { User } from "@/modules/user/models/user";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => import("@/tests/unit/user/__mocks__/brand/bcryptjs.mock"));
vi.mock("@/database/data-source", () => import("@/tests/unit/user/__mocks__/data-source.mock"));

const repository = AppDataSource.getRepository(User);

describe("BrandService.save", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const testCases = [
        // Sucessos
        {
            input: { register: "55516575000153", legal_name: "Brand A", password: "pass1234" },
            expected: { register: "55516575000153", legal_name: "Brand A", role: "A" },
            shouldPass: true
        },
        {
            input: { register: "49238774000144", legal_name: "Brand B", password: "password" },
            expected: { register: "49238774000144", legal_name: "Brand B", role: "A" },
            shouldPass: true
        },
        {
            input: { register: "11444777000161", legal_name: "Brand C", password: "123456" },
            expected: { register: "11444777000161", legal_name: "Brand C", role: "A" },
            shouldPass: true
        },
        // Falhas
        {
            input: { register: "12345678901234", legal_name: "Brand D", password: "pass1234" },
            expectedError: "CNPJ Inválido",
            shouldPass: false
        },
        {
            input: { register: "55516575000153", legal_name: "", password: "123456" },
            expectedError: "Razão social é obrigatória",
            shouldPass: false
        },
        {
            input: { register: "55516575000153", legal_name: "Brand E", password: "123" },
            expectedError: "Senha deve ter no mínimo 6 caracteres",
            shouldPass: false
        }
    ];

    it.each(testCases)("BrandService.save with input %o", async ({ input, expected, expectedError, shouldPass }) => {
        if (shouldPass) {
            (bcrypt.hash as any).mockResolvedValue("hashedPassword");

            const result = await BrandService.save(input);

            expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);
            expect(repository.create).toHaveBeenCalledWith({
                ...input,
                password: "hashedPassword",
                role: RoleEnum.ADMIN
            });
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                ...input,
                password: "hashedPassword",
                role: RoleEnum.ADMIN
            }));

            if (expected) {
                expect(result).toMatchObject(expected);
            }
            expect(result).toHaveProperty("id");
            expect(result).toHaveProperty("createdAt");
            expect(result).toHaveProperty("updatedAt");
            expect(result).toHaveProperty("status");

        } else {
            await expect(async () => {
                await BrandService.save(input);
            }).rejects.toThrow(expectedError);
        }
    });
});
