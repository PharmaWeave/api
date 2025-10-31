import { describe, it, expect, vi, beforeEach } from "vitest";
import UserService from "@/modules/user/services/user";
import { AppDataSource } from "@/database/data-source";
import { User } from "@/modules/user/models/user";
import { RoleEnum } from "@/modules/user/models/base-user";
import { StatusEnum } from "@/database/base-entity";
import { QueryFailedError } from "typeorm";
import { RequestUser } from "@/middlewares/auth";

vi.mock("@/database/data-source", () => import("@/tests/unit/user/__mocks__/data-source.mock"));

const repository = AppDataSource.getRepository(User);
const mockUserContext = { branch_id: 1 } as RequestUser;

describe("UserService.save", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const saveTestCases = [
        // Sucesso
        {
            input: { register: "62757452070", name: "User A", email: "a@test.com" },
            shouldPass: true
        },
        {
            input: { register: "45518555024", name: "User B" },
            shouldPass: true
        },
        // Falhas
        {
            input: { register: "123", name: "User C" },
            expectedError: "O CPF deve ter 11 dígitos",
            shouldPass: false
        },
        {
            input: { register: "11111111111", name: "" },
            expectedError: "Nome do usuário é obrigatório",
            shouldPass: false
        },
        {
            input: { register: "80449804070", name: "User D", email: "invalid" },
            expectedError: "Formato de email inválido",
            shouldPass: false
        }
    ];

    it.each(saveTestCases)("UserService.save with input %o", async ({ input, expectedError, shouldPass }) => {
        if (shouldPass) {
            const result = await UserService.save(input, mockUserContext);

            expect(repository.create).toHaveBeenCalledWith({
                ...input,
                branch_id: mockUserContext.branch_id,
                role: RoleEnum.USER,
                status: StatusEnum.ACTIVE
            });

            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                ...input,
                branch_id: mockUserContext.branch_id,
                role: RoleEnum.USER,
                status: StatusEnum.ACTIVE
            }));

            expect(result).toHaveProperty("id");
            expect(result).toHaveProperty("name", input.name);
            expect(result).toHaveProperty("register", input.register);
            expect(result).toHaveProperty("status");
        } else {
            await expect(async () => {
                await UserService.save(input, mockUserContext);
            }).rejects.toThrow(expectedError);
        }
    });
});

describe("UserService.update", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const updateTestCases = [
        // Sucesso
        {
            user_id: 1,
            input: { name: "Updated User", email: "updated@test.com" },
            existingUser: { id: 1, role: RoleEnum.USER, register: "62757452070" },
            shouldPass: true
        },
        // Falha: usuário não encontrado
        {
            user_id: 99,
            input: { name: "No User" },
            existingUser: null,
            expectedError: "Usuário não encontrado",
            shouldPass: false
        },
        // Falha: CPF duplicado
        {
            user_id: 2,
            input: { register: "62757452070" },
            existingUser: { id: 2, role: RoleEnum.USER, register: "45518555024" },
            shouldPass: false,
            mockSaveError: (() => {
                const err = new QueryFailedError("", [], new Error()) as any;
                err.driverError = { code: "23505" };
                return err;
            })(),
            expectedError: "Um usuário com esse CPF já existe nessa filial"
        }
    ];

    it.each(updateTestCases)("UserService.update user_id %o", async ({ user_id, input, existingUser, shouldPass, mockSaveError, expectedError }) => {
        (repository.findOneBy as any).mockResolvedValue(existingUser);

        if (mockSaveError) {
            (repository.save as any).mockRejectedValue(mockSaveError);
        }

        if (shouldPass) {
            const result = await UserService.update(user_id, input);

            expect(repository.findOneBy).toHaveBeenCalledWith({ id: user_id, role: RoleEnum.USER });
            expect(repository.merge).toHaveBeenCalled();
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(input));
            expect(result).toMatchObject(expect.objectContaining(input));
        } else {
            await expect(async () => {
                await UserService.update(user_id, input);
            }).rejects.toThrow(expectedError);
        }
    });
});
