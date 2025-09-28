import { CreateUserTable } from "@/migrations"
import { BaseUser } from "@/user/models/base-user"
import { Brand } from "@/user/models/brand"
import { Employee } from "@/user/models/employee"
import { User } from "@/user/models/user"

import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOSTNAME,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,

    migrationsRun: true,
    entities: [BaseUser, Brand, Employee, User],
    migrations: [CreateUserTable],
})


export async function connect() {
    try {
        await AppDataSource.initialize()
        console.log("Database Connected!")
    } catch (error) {
        console.error("Starting Database Connection: ", error)
    }
}
