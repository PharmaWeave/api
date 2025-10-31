import { AppDataSource } from "@/database/data-source";

export const InitializeDatabase = async () => {
    if (!AppDataSource || !AppDataSource.isInitialized) await AppDataSource.initialize();
    await AppDataSource.query(`SELECT pg_advisory_lock(hashtext('vitest_global_lock'));`);
};
