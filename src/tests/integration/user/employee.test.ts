import request from "supertest";
import express from "express";
import { afterAll, vi } from "vitest";
import EmployeeRouter from "@/modules/user/routes/employee";
import { StatusEnum } from "@/database/base-entity";
import { User, UserColumns } from "@/modules/user/models/user";
import { beforeAll, describe, expect, it } from "vitest";
import { RoleEnum } from "@/modules/user/models/base-user";
import { Branch, BranchColumns } from "@/modules/branch/models/branch";
import { Address } from "@/modules/branch/models/address";
import AuthService from "@/modules/auth/services/auth";
import EmployeeService from "@/modules/user/services/employee";
import { AppDataSource } from "@/database/data-source";
import { TruncateDatabase } from "@/tests/database/truncate";
import { InitializeDatabase } from "@/tests/database/initialize";

vi.mock("@/services/email", () => {
    return {
        default: class {
            queue = {
                add: vi.fn(async (_name: string, _data: any) => Promise.resolve())
            };
            send = vi.fn(async (_data: { to: string; subject: string; html: string }) => {
                await Promise.resolve();
            });
        }
    };
});

vi.mock("@/modules/notification/services/template", () => {
    return {
        default: {
            getByKey: vi.fn(async (_key: string) => {
                return {
                    subject: "Welcome!",
                    template: "Hello ${welcome_link}"
                };
            }),
            format: vi.fn((template: string, params: { key: string; value: string }[]) => {
                params.forEach(param => {
                    template = template.replace("${" + param.key + "}", param.value);
                });
                return template;
            })
        }
    };
});

let app: express.Express;
let adminUser: UserColumns;
let branchEntity: BranchColumns;
let employeeUser: UserColumns;

beforeAll(async () => {
    await InitializeDatabase();

    app = express();
    app.use(express.json());
    app.use("/user/employee", EmployeeRouter);

    const userRepo = AppDataSource.getRepository(User);
    adminUser = userRepo.create({
        legal_name: "Admin Test",
        register: "00000000001",
        role: RoleEnum.ADMIN,
        status: StatusEnum.ACTIVE,
        password: "password123"
    });
    await userRepo.save(adminUser);

    const addressRepo = AppDataSource.getRepository(Address);
    const address = addressRepo.create({
        country: "Brasil",
        city: "Brasilia",
        province: "DF",
        description: "Asa Sul, 114",
        number: 21
    });
    await addressRepo.save(address);

    const branchRepo = AppDataSource.getRepository(Branch);
    branchEntity = branchRepo.create({
        name: "Test Branch",
        brand_id: adminUser.id,
        address_id: address.id
    });
    await branchRepo.save(branchEntity);

    const employee = userRepo.create({
        name: "Employee Test",
        register: "00000000002",
        role: RoleEnum.EMPLOYEE,
        branch_id: branchEntity.id,
        status: StatusEnum.INACTIVE
    });
    await userRepo.save(employee);

    employeeUser = await userRepo.findOne({
        where: {
            id: employee.id
        },
        relations: ["branch"]
    }) as UserColumns;
});

afterAll(async () => await TruncateDatabase());

describe("Employee Routes Integration", () => {

    const createCases = [
        {
            description: "creates a new employee successfully",
            payload: { name: "Mateus Vieira", register: "94533301088", email: "example@email.com", salary: 8000 },
            expectedStatus: 201
        },
        {
            description: "fails if register already exists",
            payload: { name: "Mateus Vieira", register: "94533301088", email: "example@email.com", salary: 8000 },
            expectedStatus: 400
        }
    ];

    it.each(createCases)("$description", async ({ payload, expectedStatus }) => {
        const { access_token } = AuthService.generate_tokens(adminUser as any, adminUser.role);

        const res = await request(app)
            .post("/user/employee")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                ...payload,
                branch_id: branchEntity.id
            });

        expect(res.status).toBe(expectedStatus);

        if (expectedStatus === 201) expect(res.body.data.name).toBe(payload.name);
    });

    it("retrieves employees for admin", async () => {
        const { access_token } = AuthService.generate_tokens(adminUser as any, adminUser.role);

        const res = await request(app)
            .get("/user/employee")
            .set("Authorization", `Bearer ${access_token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("forbids manager from retrieving managers", async () => {
        const manager = { ...employeeUser, role: RoleEnum.MANAGER, status: StatusEnum.ACTIVE };
        await AppDataSource.getRepository(User).save(manager);

        const { access_token } = AuthService.generate_tokens(employeeUser as any, employeeUser.role);

        const res = await request(app)
            .get("/user/employee?role=M")
            .set("Authorization", `Bearer ${access_token}`);

        expect(res.status).toBe(403);
    });

    it("activates an employee with valid token", async () => {
        const inactive = { ...employeeUser, role: RoleEnum.EMPLOYEE, status: StatusEnum.INACTIVE };
        await AppDataSource.getRepository(User).save(inactive);

        const token = EmployeeService.create_password_reset_token(inactive.id);

        const res = await request(app)
            .patch("/user/employee/activate?token=" + token)
            .send({ password: "newpass123" });

        expect(res.status).toBe(204);
    });

    it("fails to activate with invalid token", async () => {
        const res = await request(app)
            .patch("/user/employee/activate?token=invalidtoken")
            .send({ password: "newpass123" });

        expect(res.status).toBe(400);
    });

    it("toggles employee status successfully", async () => {
        const { access_token } = AuthService.generate_tokens(adminUser as any, adminUser.role);

        const res = await request(app)
            .patch(`/user/employee/status/${employeeUser.id}`)
            .set("Authorization", `Bearer ${access_token}`);

        expect(res.status).toBe(200);
        expect(["A", "I"]).toContain(res.body.data.status);
    });

    it("fails to toggle manager status by non-admin", async () => {
        const manager = { ...employeeUser, role: RoleEnum.MANAGER, status: StatusEnum.ACTIVE };
        await AppDataSource.getRepository(User).save(manager);

        const { access_token } = AuthService.generate_tokens(employeeUser as any, employeeUser.role);

        const res = await request(app)
            .patch(`/user/employee/status/${manager.id}`)
            .set("Authorization", `Bearer ${access_token}`);

        expect(res.status).toBe(403);
    });

    it("promotes employee to manager successfully", async () => {
        const { access_token } = AuthService.generate_tokens(adminUser as any, adminUser.role);

        const res = await request(app)
            .patch(`/user/employee/promote/${employeeUser.id}`)
            .set("Authorization", `Bearer ${access_token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.role).toBe(RoleEnum.MANAGER);
    });

    it("fails to promote non-existent employee", async () => {
        const { access_token } = AuthService.generate_tokens(adminUser as any, adminUser.role);

        const res = await request(app)
            .patch(`/user/employee/promote/999999`)
            .set("Authorization", `Bearer ${access_token}`);

        expect(res.status).toBe(404);
    });
});
