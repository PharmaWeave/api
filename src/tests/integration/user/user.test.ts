import request from "supertest";
import express from "express";
import UserRouter from "@/modules/user/routes/index";
import { StatusEnum } from "@/database/base-entity";
import { User, UserColumns } from "@/modules/user/models/user";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RoleEnum } from "@/modules/user/models/base-user";
import AuthService from "@/modules/auth/services/auth";
import { Address } from "@/modules/branch/models/address";
import { Branch } from "@/modules/branch/models/branch";
import { AppDataSource } from "@/database/data-source";
import { TruncateDatabase } from "@/tests/database/truncate";
import { InitializeDatabase } from "@/tests/database/initialize";

let app: express.Express;
let commonUser: UserColumns;
let adminUser: UserColumns;
let employeeUser: UserColumns;

beforeAll(async () => {
    await InitializeDatabase();

    app = express();
    app.use(express.json());
    app.use("/user", UserRouter);

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
    const branch = branchRepo.create({
        name: "Test Branch",
        brand_id: adminUser.id,
        address_id: address.id
    });
    await branchRepo.save(branch);

    const employee = userRepo.create({
        legal_name: "Employee Test",
        register: "00000000002",
        role: RoleEnum.EMPLOYEE,
        branch_id: branch.id,
        status: StatusEnum.ACTIVE,
        password: "password123"
    });
    await userRepo.save(employee);

    employeeUser = await userRepo.findOne({
        where: {
            id: employee.id
        },
        relations: ["branch"]
    }) as UserColumns;

    commonUser = userRepo.create({
        legal_name: "User Test",
        register: "00000000003",
        role: RoleEnum.USER,
        branch_id: branch.id,
        status: StatusEnum.ACTIVE,
        password: "password123"
    });
    await userRepo.save(commonUser);
});

afterAll(async () => await TruncateDatabase());

describe("User Routes Integration", () => {

    it("registers a new user successfully", async () => {
        const { access_token } = AuthService.generate_tokens(employeeUser as any, employeeUser.role);

        const res = await request(app)
            .post("/user")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                name: "Mateus Vieira",
                register: "94533301088",
                email: "mateus@email.com"
            });

        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe("Mateus Vieira");
    });

    it("updates an existing user successfully", async () => {
        const { access_token } = AuthService.generate_tokens(employeeUser as any, employeeUser.role);

        const res = await request(app)
            .patch(`/user/${commonUser.id}`)
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                name: "Updated Name"
            });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Updated Name");
    });

    it("registers a new brand successfully", async () => {
        const res = await request(app)
            .post("/user/signup")
            .send({
                register: "20832587000102",
                legal_name: "Legal Name",
                password: "123456"
            });

        expect(res.status).toBe(201);
        expect(res.body.data.register).toBe("20832587000102");
    });

    it("fails to register brand if CNPJ already exists", async () => {
        const res = await request(app)
            .post("/user/signup")
            .send({
                register: "20832587000102",
                legal_name: "Other Name",
                password: "123456"
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Empresa com CNPJ já cadastrado!");
    });
});
