import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSaleAndSaleItemTables implements MigrationInterface {
    name = 'CreateSaleAndSaleitemTables1761778510553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_09210cab0384d041d5f3b337e8e"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_not_null"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_null"`);
        await queryRunner.query(`CREATE TYPE "public"."sale_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "sale" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."sale_status_enum" NOT NULL DEFAULT 'A', "total_amount" integer NOT NULL DEFAULT '0', "user_id" integer NOT NULL, "employee_id" integer NOT NULL, CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sale_item_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "sale_item" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."sale_item_status_enum" NOT NULL DEFAULT 'A', "price" integer NOT NULL DEFAULT '0', "quantity" integer NOT NULL DEFAULT '1', "sale_id" integer NOT NULL, "product_info_id" integer NOT NULL, CONSTRAINT "PK_439a57a4a0d130329d3d2e671b6" PRIMARY KEY ("id"))`);
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
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_a3f82cec1dac6638fba3e732530" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_667f785b671873c471e903e8f16" FOREIGN KEY ("employee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_86634f729a5a169e50ab18b98a6" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_058aadcc1a124386fe620ace970" FOREIGN KEY ("product_info_id") REFERENCES "product_info"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_058aadcc1a124386fe620ace970"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_86634f729a5a169e50ab18b98a6"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_667f785b671873c471e903e8f16"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_a3f82cec1dac6638fba3e732530"`);
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
        await queryRunner.query(`DROP TABLE "sale_item"`);
        await queryRunner.query(`DROP TYPE "public"."sale_item_status_enum"`);
        await queryRunner.query(`DROP TABLE "sale"`);
        await queryRunner.query(`DROP TYPE "public"."sale_status_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_null" ON "user" ("register") WHERE (branch_id IS NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_not_null" ON "user" ("register", "branch_id") WHERE (branch_id IS NOT NULL)`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_09210cab0384d041d5f3b337e8e" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
