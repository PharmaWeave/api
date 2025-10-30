import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePromotionAndPromoProductTables implements MigrationInterface {
    name = 'CreatePromotionAndPromoproductTables1761794158032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."promotion_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TYPE "public"."promotion_type_enum" AS ENUM('V', 'P')`);
        await queryRunner.query(`CREATE TABLE "promotion" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."promotion_status_enum" NOT NULL DEFAULT 'A', "title" character varying(64) NOT NULL, "description" character varying(256), "type" "public"."promotion_type_enum" NOT NULL DEFAULT 'P', "value" integer NOT NULL DEFAULT '0', "constraint" integer NOT NULL DEFAULT '0', "start" TIMESTAMP NOT NULL, "end" TIMESTAMP NOT NULL, "branch_id" integer NOT NULL, CONSTRAINT "PK_fab3630e0789a2002f1cadb7d38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."promotion_product_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "promotion_product" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."promotion_product_status_enum" NOT NULL DEFAULT 'A', "product_info_id" integer NOT NULL, "promotion_id" integer NOT NULL, CONSTRAINT "UQ_product_info_promotion" UNIQUE ("product_info_id", "promotion_id"), CONSTRAINT "PK_63567e833c47688b0d2a1e40ceb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "promotion" ADD CONSTRAINT "FK_f4bcb0da74674d86807e5f5e584" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_product" ADD CONSTRAINT "FK_74945a238259e1444f1ff07a3a1" FOREIGN KEY ("product_info_id") REFERENCES "product_info"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promotion_product" ADD CONSTRAINT "FK_f0dd6457938a3adabdb3c9b95f3" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotion_product" DROP CONSTRAINT "FK_f0dd6457938a3adabdb3c9b95f3"`);
        await queryRunner.query(`ALTER TABLE "promotion_product" DROP CONSTRAINT "FK_74945a238259e1444f1ff07a3a1"`);
        await queryRunner.query(`ALTER TABLE "promotion" DROP CONSTRAINT "FK_f4bcb0da74674d86807e5f5e584"`);
        await queryRunner.query(`DROP TABLE "promotion_product"`);
        await queryRunner.query(`DROP TYPE "public"."promotion_product_status_enum"`);
        await queryRunner.query(`DROP TABLE "promotion"`);
        await queryRunner.query(`DROP TYPE "public"."promotion_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."promotion_status_enum"`);
    }

}
