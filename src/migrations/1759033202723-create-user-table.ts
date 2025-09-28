import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable implements MigrationInterface {
    name = 'CreateUserTable1759033202723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('A', 'M', 'E', 'U')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."user_status_enum" NOT NULL DEFAULT 'A', "name" character varying(32), "email" character varying(128), "role" "public"."user_role_enum" NOT NULL DEFAULT 'U', "register" character varying(14) NOT NULL, "legal_name" character varying(64), "salary" integer, "password" text, CONSTRAINT "UQ_1890a95a3c19f3161c3b63df8f3" UNIQUE ("register"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "legal_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "legal_name" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "salary" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "legal_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "legal_name" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "salary" integer`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    }

}
