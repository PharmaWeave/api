import { AppDataSource } from "@/database/data-source";
import { Branch, BranchColumns } from "@/modules/branch/models/branch";
import { Address } from "@/modules/branch/models/address";
import { BranchValidator } from "@/modules/branch/validators/branch";
import { RequestUser } from "@/middlewares/auth";
import { StatusEnum } from "@/database/base-entity";
import { NotFound } from "@/utils/errors/not-found";
import { z } from "zod";
import { Sale } from "@/modules/sale/models/sale";

export class BranchService {

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

    static async toggle_status(branch_id: number) {
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

        return branch.raw[0];
    }

    static async retrieve(user: RequestUser) {
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

        return await Promise.all(
            branches.entities.map(async (branch, i) => {
                const month_revenue = await AppDataSource.getRepository(Sale)
                    .createQueryBuilder("sale")
                    .select("SUM(sale.total_amount)", "month_revenue")
                    .innerJoin("sale.employee", "employee")
                    .where("employee.branch_id = :branchId", { branchId: branch.id })
                    .andWhere("sale.status = :saleStatus", { saleStatus: StatusEnum.ACTIVE })
                    .andWhere(
                        `DATE_TRUNC('month', sale.createdAt AT TIME ZONE 'America/Sao_Paulo') = 
                 DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Sao_Paulo')`
                    )
                    .getRawOne();

                return {
                    ...branch,
                    employee_count: Number(branches.raw[i]["employee_count"]),
                    month_revenue: Number(month_revenue?.month_revenue ?? 0)
                };
            })
        );
    }

    static parse_branch_id(params: any): number {
        const parser = z.object({
            branch_id: z.string().regex(/^\d+$/).transform(Number)
        });

        return parser.parse(params).branch_id;
    }
}
