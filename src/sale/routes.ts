import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";
import { RoleEnum } from "@/user/models/base-user";

import express, { Router } from "express";
import SaleController from "./controllers/sale";

const router: Router = express.Router();

router.post("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.MANAGER, RoleEnum.EMPLOYEE]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Sale']
          #swagger.path = '/sale'
          #swagger.description = 'Register a new Sale for some User and updates Product stock'
        */
        await SaleController.create(req, res);
    }
);

router.get("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.MANAGER, RoleEnum.EMPLOYEE]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Sale']
          #swagger.path = '/sale/branch'
          #swagger.description = 'Retrieve all sales from the branch with pagination'
        */
        await SaleController.retrieve(req, res);
    }
);

router.delete("/:sale_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Sale']
          #swagger.path = '/sale/:sale_id'
          #swagger.description = 'Delete some sale and rollback all purchase Products'
        */
        await SaleController.delete(req, res);
    }
);

router.get("/user/metrics",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Sale']
          #swagger.path = '/sale/user/metrics'
          #swagger.description = 'Retrieve metrics for all branch users'
        */
        await SaleController.metrics(req, res);
    }
);

router.get("/user/:user_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Sale']
          #swagger.path = '/sale/user/:user_id'
          #swagger.description = 'Retrieve all purchases made by some user'
        */
        await SaleController.history(req, res);
    }
);

export default router;
