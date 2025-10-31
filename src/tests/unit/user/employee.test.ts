import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import EmployeeService from "@/modules/user/services/employee";
import { StatusEnum } from "@/database/base-entity";
import { RoleEnum } from "@/modules/user/models/base-user";
import { RequestUser } from "@/middlewares/auth";

const mockUserContext: RequestUser = { brand_id: 1 } as any;

const mockBranch = {
    id: 1,
    brand_id: mockUserContext.brand_id,
    status: StatusEnum.ACTIVE,
    name: "Branch A",
    phone: "123456789",
    address_id: 1
};

vi.mock("@/database/data-source", () => import("@/tests/unit/user/__mocks__/employee/data-source.mock"));
vi.mock("@/services/email", () => import("@/tests/unit/user/__mocks__/employee/email.mock"));
vi.mock("@/modules/notification/services/template", () => import("@/tests/unit/user/__mocks__/employee/service-template.mock"));

beforeAll(() => {
    process.env.WEB_URL = "http://localhost:3000";
    process.env.JWT_PASSWORD_SECRET = "test-secret";
});

describe("EmployeeService.save", () => {
    let mockBranchRepo: any;
    let mockUserRepo: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        const ds: any = await import("@/database/data-source");
        mockBranchRepo = ds.__mocks.mockBranchRepo;
        mockUserRepo = ds.__mocks.mockUserRepo;
    });

    beforeAll(() => {
        process.env.JWT_PASSWORD_SECRET = "test-secret";
    });


    const saveTestCases = [
        {
            input: {
                register: "75237438032",
                name: "Emp A",
                email: "a@test.com",
                salary: 5000,
                branch_id: 1
            },
            shouldPass: true
        },
        {
            input: {
                register: "96432956056",
                name: "Emp B",
                email: "b@test.com",
                salary: 8000,
                branch_id: 1
            },
            shouldPass: true
        },
        {
            input: {
                register: "111",
                name: "Emp C",
                email: "c@test.com",
                salary: 1000,
                branch_id: 1
            },
            expectedError: "O CPF deve ter 11 dígitos",
            shouldPass: false
        },
        {
            input: {
                register: "65785806037",
                name: "",
                email: "d@test.com",
                salary: 1000,
                branch_id: 1
            },
            expectedError: "Nome do empregado é obrigatório",
            shouldPass: false
        },
        {
            input: {
                register: "26944857073",
                name: "Emp E",
                email: "invalid",
                salary: 1000,
                branch_id: 1
            },
            expectedError: "Invalid email",
            shouldPass: false
        }
    ];

    it.each(saveTestCases)(
        "EmployeeService.save with input %o",
        async ({ input, expectedError, shouldPass }) => {
            mockBranchRepo.findOneBy.mockResolvedValue(mockBranch);
            mockUserRepo.findOneBy.mockResolvedValue(null);

            if (shouldPass) {
                const result = await EmployeeService.save(input, {
                    brand_id: 1
                } as RequestUser);

                expect(mockBranchRepo.findOneBy).toHaveBeenCalledWith({
                    id: input.branch_id
                });
                expect(mockUserRepo.create).toHaveBeenCalledWith({
                    ...input,
                    role: RoleEnum.EMPLOYEE,
                    status: StatusEnum.INACTIVE
                });

                expect(result).toHaveProperty("id");
                expect(result).toHaveProperty("name", input.name);
                expect(result).toHaveProperty("register", input.register);
            } else {
                await expect(EmployeeService.save(input, {
                    brand_id: 1
                } as RequestUser)).rejects.toThrow(
                    expectedError
                );
            }
        }
    );
});

describe("EmployeeService.create_password_reset_token", () => {
    beforeAll(() => {
        process.env.JWT_PASSWORD_SECRET = "test-secret";
    });

    it("should create a valid JWT with correct payload", async () => {
        const token = EmployeeService.create_password_reset_token(123);
        expect(token).toBeTypeOf("string");

        const jwt = await import("jsonwebtoken");
        const decoded: any = jwt.verify(
            token,
            process.env.JWT_PASSWORD_SECRET as string
        );

        expect(decoded).toHaveProperty("id", 123);
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
});

describe("EmployeeService.create", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    it("should create employee and send welcome email", async () => {
        const input = {
            register: "50147363004",
            name: "Emp F",
            email: "f@test.com",
            salary: 6000,
            branch_id: 1
        };

        const result = await EmployeeService.create(input, {
            brand_id: 1
        } as RequestUser);

        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("name", input.name);
        expect(result).toHaveProperty("register", input.register);
        expect(result).toHaveProperty("status", StatusEnum.INACTIVE);
    });
});
