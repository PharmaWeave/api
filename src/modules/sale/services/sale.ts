import { AppDataSource } from "@/database/data-source";
import { RequestUser } from "@/middlewares/auth";
import { Sale } from "@/modules/sale/models/sale";
import { BadRequest } from "@/utils/errors/bad-request";
import { NotFound } from "@/utils/errors/not-found";
import { User } from "@/modules/user/models/user";
import { RoleEnum } from "@/modules/user/models/base-user";
import { StatusEnum } from "@/database/base-entity";
import { SaleItemInterface, SaleValidator } from "../validators/sale";
import StockService from "@/modules/sale/services/stock";
import SaleRepository from "@/modules/sale/repositories/sale";
import { EntityManager } from "typeorm";
import PromotionService, { PromotionData } from "@/modules/promotion/services/promotion";

export class SaleService {

    static async save(data: any, user: RequestUser) {
        const validated = SaleValidator.parse(data);

        return await AppDataSource.manager.transaction(async (TransactionManager) => {
            const buyer = await TransactionManager.findOneBy(User, {
                id: validated.user_id,
                branch_id: user.branch_id
            });

            if (!buyer) throw new NotFound("Usuário não encontrado na filial");
            if (buyer.role === RoleEnum.ADMIN) throw new BadRequest("Usuário inválido para realizar compras");

            let promotion_data: PromotionData | undefined;
            if (validated.promotion_id) {
                promotion_data = await PromotionService.validate(
                    TransactionManager,
                    validated.promotion_id
                ) as PromotionData;
            }

            const { total_amount, product_mapping } = await SaleService.calculate(
                TransactionManager,
                validated.sale_items,
                user.branch_id!,
                promotion_data
            );

            const sale = await SaleRepository.create(TransactionManager, total_amount, validated.user_id, user.id, validated.promotion_id);
            await SaleRepository.createSaleItems(TransactionManager, sale.id, product_mapping);

            return await SaleRepository.findById(sale.id, TransactionManager);
        });
    }

    static async calculate(
        TransactionManager: EntityManager,
        sale_items: SaleItemInterface[],
        branch_id: number,
        promotion_data?: PromotionData
    ) {
        const product_mapping = [];
        let total_amount = 0;

        for (const item of sale_items) {
            const product_info = await StockService.checkAndDeduct(
                TransactionManager,
                item.product_id,
                branch_id,
                item.quantity
            );

            total_amount += product_info.price * item.quantity;
            product_mapping.push({ product_info, quantity: item.quantity });
        }

        if (promotion_data) {
            total_amount += PromotionService.apply(
                promotion_data.promotion,
                promotion_data.products,
                product_mapping
            );
        }

        return { total_amount, product_mapping };
    }

    static async history(user_id: number) {
        const sales = await SaleRepository.findByUserId(user_id);

        return sales;
    }

    static async rollback(sale_id: number) {
        const sale = await SaleRepository.findById(sale_id);

        if (!sale) throw new NotFound("A venda não foi encontrada para dar rollback");

        await AppDataSource.manager.transaction(async (TransactionManager) => {
            await StockService.restore(TransactionManager, sale.sale_items);

            sale.status = StatusEnum.REMOVED;
            await TransactionManager.save(Sale, sale);
        });
    }

    static async metrics(user: RequestUser) {
        const UserRepository = AppDataSource.getRepository(User);

        const result = await UserRepository.createQueryBuilder("user")
            .select("user.id", "user_id")
            .addSelect("user.name", "user_name")
            .addSelect("user.email", "user_email")
            .addSelect("user.register", "user_register")
            .addSelect("user.role", "user_role")
            .addSelect("user.status", "user_status")
            .addSelect("SUM(sale.total_amount)", "total_spent")
            .addSelect("COUNT(sale.id)", "total_purchases")
            .addSelect("MAX(sale.created_at)", "last_purchase")
            .leftJoin("sale", "sale", "sale.user_id = user.id AND sale.status = :saleStatus", {
                saleStatus: StatusEnum.ACTIVE
            })
            .where("user.branch_id = :branch_id", { branch_id: user.branch_id })
            .andWhere("user.status IN (:...userStatus)", { userStatus: [StatusEnum.ACTIVE, StatusEnum.INACTIVE] })
            .andWhere("user.role IN (:...userAllowedRoles)", {
                userAllowedRoles: [RoleEnum.USER, RoleEnum.EMPLOYEE, RoleEnum.MANAGER]
            })
            .andWhere("user.id != :user_current_id", { user_current_id: user.id })
            .groupBy("user.id")
            .addGroupBy("user.name")
            .addGroupBy("user.email")
            .addGroupBy("user.register")
            .addGroupBy("user.status")
            .orderBy("user_name", "ASC")
            .orderBy("total_spent", "ASC")
            .getRawMany();

        return result.map((r) => ({
            user_id: Number(r.user_id),
            user_name: r.user_name,
            user_email: r.user_email,
            user_register: r.user_register,
            user_role: r.user_role,
            total_spent: Number(r.total_spent),
            total_purchases: Number(r.total_purchases),
            last_purchase: r.last_purchase,
            user_status: r.user_status
        }));
    }

    static async getAllByBranch(user: RequestUser, page: number, limit: number) {
        const SaleRepository = AppDataSource.getRepository(Sale);

        const sales = await SaleRepository.createQueryBuilder("sale")
            .select([
                "sale.id",
                "sale.createdAt",
                "sale.updatedAt",
                "sale.status",
                "sale.total_amount",
                "sale.promotion_id"
            ])
            .innerJoin("sale.user", "user")
            .addSelect(["user.id", "user.name", "user.register"])
            .innerJoin("sale.employee", "employee")
            .addSelect(["employee.id", "employee.name", "employee.register"])
            .leftJoin("sale.promotion", "promotion")
            .addSelect(["promotion.id", "promotion.title"])
            .leftJoin("sale.sale_items", "sale_item")
            .addSelect("SUM(sale_item.quantity)", "sale_total_items")
            .where("user.branch_id = :branch_id", { branch_id: user.branch_id })
            .andWhere("sale.status = :saleStatus", { saleStatus: StatusEnum.ACTIVE })
            .andWhere("user.status IN (:...userStatus)", { userStatus: [StatusEnum.ACTIVE, StatusEnum.INACTIVE] })
            .groupBy("sale.id")
            .addGroupBy("user.id")
            .addGroupBy("employee.id")
            .addGroupBy("promotion.id")
            .orderBy("sale.createdAt", "DESC")
            .getRawMany();

        const total = sales.length;

        return {
            data: sales.slice((page - 1) * limit, limit * page),
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        };
    }
}

export default SaleService;