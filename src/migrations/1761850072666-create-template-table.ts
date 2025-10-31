import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTemplateTable implements MigrationInterface {
    name = 'CreateTemplateTable1761850072666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."template_status_enum" AS ENUM('A', 'I', 'R')`);
        await queryRunner.query(`CREATE TABLE "template" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."template_status_enum" NOT NULL DEFAULT 'A', "key" character varying(64) NOT NULL, "subject" character varying(64) NOT NULL, "template" text NOT NULL, CONSTRAINT "UQ_3fb8e92c49ada5cc11bde081f9e" UNIQUE ("key"), CONSTRAINT "PK_fbae2ac36bd9b5e1e793b957b7f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "template"`);
        await queryRunner.query(`DROP TYPE "public"."template_status_enum"`);
    }

}
