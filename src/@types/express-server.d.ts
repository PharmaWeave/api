import { RequestUser } from "@/middlewares/auth";

import "express-serve-static-core";

declare module "express-serve-static-core" {
    interface Request {
        user?: RequestUser
    }
}
