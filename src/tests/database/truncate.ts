import { AppDataSource } from "@/database/data-source";

export const TruncateDatabase = async () => {
    const entities = AppDataSource.entityMetadatas;

    for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
    }

    await AppDataSource.query(`SELECT pg_advisory_unlock(hashtext('vitest_global_lock'));`);
};
