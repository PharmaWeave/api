import { Request, Response, NextFunction } from "express";

import { RoleType } from "@/user/models/base-user";

import jwt from "jsonwebtoken";

export interface RequestUser {
    id: number;
    brand_id: number;
    branch_id?: number;
    role: Exclude<RoleType, "U">;
}

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as RequestUser;
        req.user = payload;
        next();
    } catch (_err) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
};
