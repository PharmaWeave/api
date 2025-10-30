import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductAndInfoTables implements MigrationInterface {
    name = 'CreateProductAndInfoTables1761703072036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_09210cab0384d041d5f3b337e8e"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_not_null"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_null"`);
        await queryRunner.query(`CREATE TYPE "public"."product_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."product_status_enum" NOT NULL DEFAULT 'A', "name" character varying(64) NOT NULL, "description" character varying(256), "brand_id" integer NOT NULL, CONSTRAINT "UQ_product_name_brand" UNIQUE ("name", "brand_id"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_info_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "product_info" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."product_info_status_enum" NOT NULL DEFAULT 'A', "price" integer NOT NULL DEFAULT '0', "stock" integer NOT NULL DEFAULT '0', "product_id" integer NOT NULL, "branch_id" integer NOT NULL, CONSTRAINT "PK_ad6df2f64860f13fcf2cbe38dc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "legal_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "legal_name" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "salary" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "branch_id" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_not_null" ON "user" ("register", "branch_id") WHERE "branch_id" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_null" ON "user" ("register") WHERE "branch_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_09210cab0384d041d5f3b337e8e" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_2eb5ce4324613b4b457c364f4a2" FOREIGN KEY ("brand_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_info" ADD CONSTRAINT "FK_717cf76367e3550276d69e0dc65" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_info" ADD CONSTRAINT "FK_02ce187434ddca10b5015d74978" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_info" DROP CONSTRAINT "FK_02ce187434ddca10b5015d74978"`);
        await queryRunner.query(`ALTER TABLE "product_info" DROP CONSTRAINT "FK_717cf76367e3550276d69e0dc65"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_2eb5ce4324613b4b457c364f4a2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_09210cab0384d041d5f3b337e8e"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_null"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_not_null"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "legal_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "legal_name" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "branch_id" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "salary" integer`);
        await queryRunner.query(`DROP TABLE "product_info"`);
        await queryRunner.query(`DROP TYPE "public"."product_info_status_enum"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_null" ON "user" ("register") WHERE (branch_id IS NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_not_null" ON "user" ("register", "branch_id") WHERE (branch_id IS NOT NULL)`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_09210cab0384d041d5f3b337e8e" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
