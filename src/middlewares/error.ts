import { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";

import { ApiError } from "@/utils/errors/api-error";

export function ErrorMiddleware(
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof ZodError) {
        const issues: any = [];

        err.issues.forEach(issue => {
            issues.push({
                fields: issue.path.map(p => p.toString()),
                code: issue.code,
                message: issue.message
            });
        });

        return res.status(400).json({
            error: issues
        });
    }

    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: err.message
        });
    }

    console.log(err);

    return res.status(500).json({
        error: "Internal Server Error"
    });
}
