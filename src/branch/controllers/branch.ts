import { Request, Response } from "express";

import { z } from "zod";

import { AppDataSource } from "@/database/data-source";

import { Branch, BranchColumns } from "@/branch/models/branch";
import { Address } from "@/branch/models/address";
import { BranchValidator } from "@/branch/validators/branch";

import { RequestUser } from "@/middlewares/auth";

import { NotFound } from "@/utils/errors/not-found";

import { QueryFailedError } from "typeorm";
import { StatusEnum } from "@/database/base-entity";

class BranchController {

    static async save(data: any, user: RequestUser): Promise<BranchColumns> {
        const validated = BranchValidator.parse(data);

        return await AppDataSource.manager.transaction(async (TransactionManager) => {
            const address = TransactionManager.create(Address, validated.address);
            await TransactionManager.save(Address, address);

            const branch = TransactionManager.create(Branch, {
                name: validated.name,
                phone: validated.phone,
                brand_id: user.id,
                address_id: address.id
            });
            await TransactionManager.save(Branch, branch);

            return branch;
        });
    }

    static async create(req: Request, res: Response) {
        try {
            const saved = await this.save(req.body, req.user as RequestUser);

            res.status(201).json({
                data: saved
            });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.constraint === "UQ_branch_name_brand") {
                    return res.status(400).json({
                        error: "A empresa já possui uma filial com o mesmo nome!"
                    });
                }
            }

            throw err;
        }
    }

    static async toggle_status(req: Request, res: Response) {
        const parser = z.object({
            branch_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { branch_id } = parser.parse(req.params);

        const BranchRepository = AppDataSource.getRepository(Branch);

        const branch = await BranchRepository.createQueryBuilder()
            .update(Branch)
            .set({
                status: () => `(
                        CASE 
                            WHEN status = 'A' THEN 'I' 
                            WHEN status = 'I' THEN 'A' 
                            ELSE status 
                        END
                    )::branch_status_enum`
            })
            .where("id = :id", { id: branch_id })
            .returning("*")
            .execute();

        if (!branch.affected) throw new NotFound("Filial não encontrada para sua franquia!");

        return res.status(200).json({
            data: branch.raw[0]
        });
    }

    static async retrieve(req: Request, res: Response) {
        const user = req.user as RequestUser;

        const branches = await AppDataSource.getRepository(Branch)
            .createQueryBuilder("branch")
            .leftJoinAndSelect("branch.brand", "brand")
            .leftJoinAndSelect("branch.address", "address")
            .leftJoinAndMapMany(
                "branch.managers",
                "branch.users",
                "manager",
                "manager.role = :managerRole AND manager.status = :activeStatus",
                { managerRole: "M", activeStatus: StatusEnum.ACTIVE }
            )
            .select([
                "branch.id",
                "branch.name",
                "branch.phone",
                "branch.status",
                "branch.createdAt",
                "branch.updatedAt",
                "brand.id",
                "brand.legal_name",
                "address.id",
                "address.country",
                "address.province",
                "address.city",
                "address.description",
                "address.number",
                "manager.id",
                "manager.name",
                "manager.email",
                "manager.register"
            ])
            .addSelect(subQuery => {
                return subQuery
                    .select("COUNT(u.id)", "employee_count")
                    .from("user", "u")
                    .where(
                        "u.branch_id = branch.id AND u.status = :activeStatus AND u.role IN (:...roles)",
                        { activeStatus: StatusEnum.ACTIVE, roles: ["E", "M"] }
                    );
            }, "employee_count")
            .where("branch.brand_id = :brandId", { brandId: user.brand_id })
            .andWhere("branch.status IN (:...statuses)", { statuses: [StatusEnum.ACTIVE, StatusEnum.INACTIVE] })
            .getRawAndEntities();

        const data = branches.entities.map((branch, i) => ({
            ...branch,
            employee_count: Number(branches.raw[i]["employee_count"])
        }));

        return res.status(200).json({ data });
    }
}

export default BranchController;
