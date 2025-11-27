import { StatusEnum } from "@/database/base-entity";
import { AppDataSource } from "@/database/data-source";
import { RequestUser } from "@/middlewares/auth";
import { Branch } from "@/modules/branch/models/branch";
import { Sale } from "@/modules/sale/models/sale";
import { RoleEnum } from "@/modules/user/models/base-user";
import { Between, In } from "typeorm";

export class MetricsService {

    static async retrieve(user: RequestUser) {
        const BranchRepository = AppDataSource.getRepository(Branch);
        const SaleRepository = AppDataSource.getRepository(Sale);

        if (user.role === RoleEnum.ADMIN) {
            const branches = await BranchRepository.find({
                where: {
                    brand_id: user.brand_id,
                    status: In([StatusEnum.ACTIVE, StatusEnum.INACTIVE])
                }
            });

            const branch_count = branches.length;
            const ids = branches.map(branch => branch.id);

            const currentMonthResult = await SaleRepository
                .createQueryBuilder("sale")
                .innerJoin("sale.user", "user")
                .where("user.branch_id IN (:...branchIds)", { branchIds: ids })
                .andWhere("sale.created_at >= CURRENT_DATE - INTERVAL '30 days'")
                .andWhere("sale.created_at < CURRENT_DATE + INTERVAL '1 day'")
                .andWhere("sale.status = 'A'")
                .select("SUM(sale.total_amount)", "totalRevenue")
                .getRawOne<{ totalRevenue: number }>() ?? { totalRevenue: 0 };

            const currentRevenue = Number(currentMonthResult.totalRevenue) || 0;

            const previousMonthResult = await SaleRepository
                .createQueryBuilder("sale")
                .innerJoin("sale.user", "user")
                .where("user.branch_id IN (:...branchIds)", { branchIds: ids })
                .andWhere("sale.created_at >= CURRENT_DATE - INTERVAL '60 days'")
                .andWhere("sale.created_at < CURRENT_DATE - INTERVAL '30 days'")
                .andWhere("sale.status = 'A'")
                .select("SUM(sale.total_amount)", "totalRevenue")
                .getRawOne<{ totalRevenue: number }>() ?? { totalRevenue: 0 };

            const previousRevenue = Number(previousMonthResult.totalRevenue) || 0;

            const growth = (previousRevenue === currentRevenue)
                ? 0 : previousRevenue === 0
                    ? 100
                    : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

            return { branch_count, month_revenue: currentRevenue, growth_percentage: growth };
        } else if (user.role === RoleEnum.EMPLOYEE) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            const todaySales = await AppDataSource.getRepository(Sale).count({
                where: {
                    employee_id: user.id,
                    status: StatusEnum.ACTIVE,
                    createdAt: Between(startOfToday, endOfToday)
                }
            });

            const todayResult = await SaleRepository
                .createQueryBuilder("sale")
                .innerJoin("sale.employee", "employee")
                .where("employee.id = :id", { id: user.id })
                .andWhere("sale.created_at >= CURRENT_DATE")
                .andWhere("sale.created_at < CURRENT_DATE + INTERVAL '1 day'")
                .andWhere("sale.status = 'A'")
                .select("SUM(sale.total_amount)", "totalRevenue")
                .getRawOne<{ totalRevenue: number }>() ?? { totalRevenue: 0 };

            const todayRevenue = Number(todayResult.totalRevenue) || 0;

            const yesterdayResult = await SaleRepository
                .createQueryBuilder("sale")
                .innerJoin("sale.employee", "employee")
                .where("employee.id = :id", { id: user.id })
                .andWhere("sale.created_at >= CURRENT_DATE - INTERVAL '1 day'")
                .andWhere("sale.created_at < CURRENT_DATE")
                .andWhere("sale.status = 'A'")
                .select("SUM(sale.total_amount)", "totalRevenue")
                .getRawOne<{ totalRevenue: number }>() ?? { totalRevenue: 0 };

            const yesterdayRevenue = Number(yesterdayResult.totalRevenue) || 0;

            const growth = (yesterdayRevenue === todayRevenue)
                ? 0 : yesterdayRevenue === 0
                    ? 100
                    : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

            return { today_sales: todaySales, today_revenue: todayRevenue, growth_percentage: growth };
        } else if (user.role === RoleEnum.MANAGER) {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            const todaySales = await AppDataSource.getRepository(Sale).count({
                where: {
                    status: StatusEnum.ACTIVE,
                    createdAt: Between(startOfToday, endOfToday)
                }
            });

            const todayResult = await SaleRepository
                .createQueryBuilder("sale")
                .andWhere("sale.created_at >= CURRENT_DATE")
                .andWhere("sale.created_at < CURRENT_DATE + INTERVAL '1 day'")
                .andWhere("sale.status = 'A'")
                .select("SUM(sale.total_amount)", "totalRevenue")
                .getRawOne<{ totalRevenue: number }>() ?? { totalRevenue: 0 };

            const todayRevenue = Number(todayResult.totalRevenue) || 0;

            const yesterdayResult = await SaleRepository
                .createQueryBuilder("sale")
                .andWhere("sale.created_at >= CURRENT_DATE - INTERVAL '1 day'")
                .andWhere("sale.created_at < CURRENT_DATE")
                .andWhere("sale.status = 'A'")
                .select("SUM(sale.total_amount)", "totalRevenue")
                .getRawOne<{ totalRevenue: number }>() ?? { totalRevenue: 0 };

            const yesterdayRevenue = Number(yesterdayResult.totalRevenue) || 0;

            const growth = (yesterdayRevenue === todayRevenue)
                ? 0 : yesterdayRevenue === 0
                    ? 100
                    : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

            return { today_sales: todaySales, today_revenue: todayRevenue, growth_percentage: growth };
        }

        return {};
    }
}

