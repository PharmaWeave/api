import { MigrationInterface, QueryRunner } from "typeorm";

export class SetPromotionPerSale implements MigrationInterface {
    name = 'SetPromotionPerSale1761822078692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale" ADD "promotion_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_2ceb9c6987863c50d3d86cf9c72" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_2ceb9c6987863c50d3d86cf9c72"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP COLUMN "promotion_id"`);
    }

}
