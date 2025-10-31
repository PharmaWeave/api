import { RoleEnum, RoleType } from "@/modules/user/models/base-user";
import { BrandUser, EmployeeUser } from "@/modules/user/models/user";
import jwt from "jsonwebtoken";

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
}

export default AuthService;