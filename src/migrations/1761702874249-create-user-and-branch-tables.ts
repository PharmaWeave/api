import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndBranchTables implements MigrationInterface {
    name = 'CreateUserAndBranchTables1761702874249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('A', 'M', 'E', 'U')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."user_status_enum" NOT NULL DEFAULT 'A', "name" character varying(32), "email" character varying(128), "role" "public"."user_role_enum" NOT NULL DEFAULT 'U', "register" character varying(14) NOT NULL, "legal_name" character varying(64), "password" text, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."branch_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "branch" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."branch_status_enum" NOT NULL DEFAULT 'A', "name" character varying(64) NOT NULL, "phone" character varying, "brand_id" integer NOT NULL, "address_id" integer NOT NULL, CONSTRAINT "UQ_branch_name_brand" UNIQUE ("name", "brand_id"), CONSTRAINT "REL_430511286839d990b8b5ab25a5" UNIQUE ("address_id"), CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."address_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."address_status_enum" NOT NULL DEFAULT 'A', "country" character varying(128) NOT NULL, "province" character varying(128) NOT NULL, "city" character varying(128) NOT NULL, "description" character varying(256) NOT NULL, "number" integer NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "legal_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "legal_name" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "salary" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "branch_id" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_not_null" ON "user" ("register", "branch_id") WHERE "branch_id" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_register_branch_null" ON "user" ("register") WHERE "branch_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_09210cab0384d041d5f3b337e8e" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch" ADD CONSTRAINT "FK_ddcb650b4f303e6aaf798abbcd9" FOREIGN KEY ("brand_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch" ADD CONSTRAINT "FK_430511286839d990b8b5ab25a5c" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch" DROP CONSTRAINT "FK_430511286839d990b8b5ab25a5c"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP CONSTRAINT "FK_ddcb650b4f303e6aaf798abbcd9"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_09210cab0384d041d5f3b337e8e"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_null"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_register_branch_not_null"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "legal_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "legal_name" character varying(64)`);
        await queryRunner.query(`DROP TABLE "address"`);
        await queryRunner.query(`DROP TYPE "public"."address_status_enum"`);
        await queryRunner.query(`DROP TABLE "branch"`);
        await queryRunner.query(`DROP TYPE "public"."branch_status_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }

}
