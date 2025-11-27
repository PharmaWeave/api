import { RequestUser } from "@/middlewares/auth";
import { Request, Response } from "express";
import { MetricsService } from "@/modules/metrics/services/metrics";

class MetricsController {

    static async retrieve(req: Request, res: Response) {
        const user = req.user as RequestUser;
        const data = await MetricsService.retrieve(user);

        return res.status(200).json({ data });
    }
}

export default MetricsController;