import request from "supertest";
import express from "express";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import AuthRouter from "@/modules/auth/routes";
import { AppDataSource } from "@/database/data-source";
import { User, UserColumns } from "@/modules/user/models/user";
import { Address } from "@/modules/branch/models/address";
import { Branch, BranchColumns } from "@/modules/branch/models/branch";
import { RoleEnum } from "@/modules/user/models/base-user";
import { StatusEnum } from "@/database/base-entity";
import { TruncateDatabase } from "@/tests/database/truncate";
import bcrypt from "bcryptjs";
import { InitializeDatabase } from "@/tests/database/initialize";

let app: express.Express;
let adminUser: UserColumns;
let employeeUser: UserColumns;
let branchEntity: BranchColumns;

beforeAll(async () => {
    await InitializeDatabase();

    app = express();
    app.use(express.json());
    app.use("/auth", AuthRouter);

    const userRepo = AppDataSource.getRepository(User);
    const passwordHash = await bcrypt.hash("password123", 10);

    adminUser = userRepo.create({
        legal_name: "Admin Test",
        register: "31732589000146",
        role: RoleEnum.ADMIN,
        status: StatusEnum.ACTIVE,
        password: passwordHash
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
        legal_name: "Employee Test",
        register: "23320020064",
        role: RoleEnum.EMPLOYEE,
        branch_id: branchEntity.id,
        status: StatusEnum.ACTIVE,
        password: passwordHash
    });
    await userRepo.save(employee);

    employeeUser = await userRepo.findOne({
        where: { id: employee.id },
        relations: ["branch"]
    }) as UserColumns;
});

afterAll(async () => await TruncateDatabase());

describe("Auth Routes Integration", () => {

    it("logs in as admin successfully", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ register: adminUser.register, password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body.data.access_token).toBeDefined();
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refresh_token")])
        );
    });

    it("logs in as employee successfully", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ register: employeeUser.register, password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body.data.access_token).toBeDefined();
        expect(res.headers["set-cookie"]).toEqual(
            expect.arrayContaining([expect.stringContaining("refresh_token")])
        );
    });

    it("fails login with invalid register", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ register: "99501905000102", password: "password123" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Credenciais inválidas");
    });

    it("fails login with wrong password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ register: employeeUser.register, password: "wrongpass" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Credenciais inválidas");
    });

});
