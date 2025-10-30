import { MigrationInterface, QueryRunner } from "typeorm";

export class PromotionPerSaleCanBeNull implements MigrationInterface {
    name = 'PromotionPerSaleCanBeNull1761822630018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_2ceb9c6987863c50d3d86cf9c72"`);
        await queryRunner.query(`ALTER TABLE "sale" ALTER COLUMN "promotion_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_2ceb9c6987863c50d3d86cf9c72" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_2ceb9c6987863c50d3d86cf9c72"`);
        await queryRunner.query(`ALTER TABLE "sale" ALTER COLUMN "promotion_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_2ceb9c6987863c50d3d86cf9c72" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
