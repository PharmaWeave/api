import { Request, Response } from "express";
import { BranchService } from "@/modules/branch/services/branch";
import { RequestUser } from "@/middlewares/auth";
import { QueryFailedError } from "typeorm";
import { BadRequest } from "@/utils/errors/bad-request";
import z from "zod";

class BranchController {

    static async create(req: Request, res: Response) {
        try {
            const saved = await BranchService.save(req.body, req.user as RequestUser);
            return res.status(201).json({ data: saved });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.constraint === "UQ_branch_name_brand") {
                    throw new BadRequest("A empresa já possui uma filial com o mesmo nome!");
                }
            }
            throw err;
        }
    }

    static async update(req: Request, res: Response) {
        const parser = z.object({
            branch_id: z.string().regex(/^\d+$/).transform(Number)
        });

        const { branch_id } = parser.parse(req.params);

        try {
            const updated = await BranchService.update(branch_id, req.body, req.user as RequestUser);
            res.status(200).json({ data: updated });
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.constraint === "UQ_branch_name_brand") {
                    throw new BadRequest("A empresa já possui uma filial com o mesmo nome!");
                }
            }
            throw err;
        }
    }

    static async toggle_status(req: Request, res: Response) {
        const branch_id = BranchService.parse_branch_id(req.params);
        const updated = await BranchService.toggle_status(branch_id);

        return res.status(200).json({ data: updated });
    }

    static async retrieve(req: Request, res: Response) {
        const user = req.user as RequestUser;
        const data = await BranchService.retrieve(user);

        return res.status(200).json({ data });
    }
}

export default BranchController;
