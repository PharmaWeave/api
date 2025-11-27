import express, { Router } from "express";

import MetricsController from "./controllers/metrics";

import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";
import { RoleEnum } from "@/modules/user/models/base-user";

const router: Router = express.Router();

router.get("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN, RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Metrics']
          #swagger.path = '/metrics'
          #swagger.description = 'Retrieve dashboard metrics for each user role'
        */
        await MetricsController.retrieve(req, res);
    }
);

export default router;