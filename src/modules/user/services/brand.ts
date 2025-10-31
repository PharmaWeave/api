import bcrypt from "bcryptjs";

import { AppDataSource } from "@/database/data-source";

import { RoleEnum } from "@/modules/user/models/base-user";
import { BrandValidator } from "@/modules/user/validators/brand";
import { BrandUser, User } from "@/modules/user/models/user";

class BrandService {

    static async save(data: any): Promise<Omit<BrandUser, "password">> {
        const validated = BrandValidator.parse(data);

        const hashed = await bcrypt.hash(validated.password, 10);

        const repository = AppDataSource.getRepository(User);
        const brand = repository.create({
            ...validated,
            password: hashed,
            role: RoleEnum.ADMIN
        });

        await repository.save(brand);

        const saved = {
            id: brand.id,
            role: brand.role as "A",
            register: brand.register,
            legal_name: brand.legal_name,

            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
            status: brand.status
        };

        return saved;
    }
}

export default BrandService;