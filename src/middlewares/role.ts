import { Request, Response, NextFunction } from "express";

import { RoleType } from "@/modules/user/models/base-user";

export const RoleMiddleware = (allowedRoles: Exclude<RoleType, "U">[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: "Acesso negado" });
        }

        next();
    };
};
