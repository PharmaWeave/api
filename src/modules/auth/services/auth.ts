import jwt from "jsonwebtoken";

import { RoleEnum, RoleType } from "@/modules/user/models/base-user";
import { BrandUser, EmployeeUser, User } from "@/modules/user/models/user";
import { Forbidden } from "@/utils/errors/forbidden";
import { RefreshPayloadValidator } from "../validators/refresh";
import { AppDataSource } from "@/database/data-source";
import { StatusEnum } from "@/database/base-entity";
import { BadRequest } from "@/utils/errors/bad-request";

class AuthService {

    static generate_tokens(
        account: BrandUser | EmployeeUser,
        role: RoleType
    ) {
        const access_token = jwt.sign(
            {
                id: account.id,
                brand_id: role === RoleEnum.ADMIN ? account.id : (account as EmployeeUser).branch.brand_id,
                branch_id: role === RoleEnum.ADMIN ? undefined : (account as EmployeeUser).branch_id,
                role: role
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );

        const refresh_token = jwt.sign(
            {
                id: account.id,
                brand_id: role === RoleEnum.ADMIN ? account.id : (account as EmployeeUser).branch.brand_id,
                branch_id: role === RoleEnum.ADMIN ? undefined : (account as EmployeeUser).branch_id,
                role: role
            },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: "30d" }
        );

        return { access_token, refresh_token };
    }

    static async refresh_tokens(token: string) {
        let validated;
        try {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload;
            validated = RefreshPayloadValidator.parse(payload);
        } catch {
            throw new Forbidden("Invalid refresh token!");
        }

        const UserRepository = AppDataSource.getRepository(User);
        const account = await UserRepository.findOne({
            where: {
                id: validated.id,
                status: StatusEnum.ACTIVE
            },
            relations: ["branch"]
        });

        if (!account) throw new BadRequest("Invalid user!");

        let role = account.role;
        const new_payload = {
            id: account.id,
            brand_id: role === RoleEnum.ADMIN ? account.id : (account as EmployeeUser).branch.brand_id,
            branch_id: role === RoleEnum.ADMIN ? undefined : (account as EmployeeUser).branch_id,
            role: role
        };

        const access = jwt.sign(new_payload, process.env.JWT_SECRET as string, { expiresIn: "15m" });
        const refresh = jwt.sign(new_payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "30d" });

        return { access_token: access, refresh_token: refresh };
    }
}

export default AuthService;