import { CommonUser, User } from "@/modules/user/models/user";
import { UserPatchValidator, UserValidator } from "@/modules/user/validators/user";
import { AppDataSource } from "@/database/data-source";
import { RoleEnum } from "@/modules/user/models/base-user";
import { StatusEnum } from "@/database/base-entity";
import { RequestUser } from "@/middlewares/auth";
import { NotFound } from "@/utils/errors/not-found";
import { In, QueryFailedError } from "typeorm";
import { BadRequest } from "@/utils/errors/bad-request";

class UserService {

    static async save(data: any, user: RequestUser): Promise<CommonUser> {
        const validated = UserValidator.parse(data);

        const UserRepository = AppDataSource.getRepository(User);
        const created = UserRepository.create({
            ...validated,
            branch_id: user.branch_id,
            role: RoleEnum.USER,
            status: StatusEnum.ACTIVE
        }) as CommonUser;

        await UserRepository.save(created);

        return created;
    }

    static async retrieve(user: RequestUser) {
        const UserRepository = AppDataSource.getRepository(User);

        const result = await UserRepository.find({
            where: {
                branch_id: user.branch_id,
                role: RoleEnum.USER,
                status: In([StatusEnum.ACTIVE, StatusEnum.INACTIVE])
            },
            relations: ["sales"]
        });

        return result.map(user => {
            return {
                id: user.id,
                name: user.name,
                register: user.register,
                email: user.email,
                sales: user.sales,

                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                status: user.status
            };
        });
    }

    static async update(user_id: number, data: any) {
        const validated = UserPatchValidator.parse(data);

        const UserRepository = AppDataSource.getRepository(User);
        const user = await UserRepository.findOneBy({
            id: user_id,
            role: RoleEnum.USER
        });

        if (!user) throw new NotFound("Usuário não encontrado");

        UserRepository.merge(user, {
            register: validated.register,
            name: validated.name,
            email: validated.email
        });

        try {
            return await UserRepository.save(user);
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === "23505") {
                    throw new BadRequest("Um usuário com esse CPF já existe nessa filial");
                }
            }

            throw err;
        }
    }
}

export default UserService;
