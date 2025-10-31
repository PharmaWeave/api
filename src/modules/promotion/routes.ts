import express, { Router } from "express";

import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";

import { RoleEnum } from "@/modules/user/models/base-user";
import PromotionController from "./controllers/promotion";

const router: Router = express.Router();

router.post("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Promotion']
          #swagger.path = '/promotion'
          #swagger.description = 'Register a new Promotion and link it to products'
          #swagger.parameters['promotion'] = {
              in: 'body',
              description: 'Promotion data',
              required: true,
              schema: {
                  title: 'Black Friday',
                  description: 'Special discount',
                  type: 'P',
                  value: 20,
                  constraint: 100,
                  start: '2025-11-01T00:00:00Z',
                  end: '2025-11-30T23:59:59Z',
                  branch_id: 1,
                  product_info_ids: [1, 2, 3]
              }
          }
        */
        return await PromotionController.create(req, res);
    }
);

router.get("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.MANAGER, RoleEnum.EMPLOYEE]), // quem pode acessar
    async (req, res) => {
        /* 
          #swagger.tags = ['Promotion']
          #swagger.path = '/promotion'
          #swagger.description = 'Get all promotions for the user branch'
        */
        return await PromotionController.retrieve(req, res);
    }
);

router.delete("/:promotion_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Promotion']
          #swagger.path = '/promotion/:promotion_id'
          #swagger.description = 'Delete a promotion by ID'
        */
        return await PromotionController.delete(req, res);
    }
);

router.patch("/:promotion_id/finalize",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Promotion']
          #swagger.path = '/promotion/:promotion_id/finalize'
          #swagger.description = 'Finalize a promotion by setting its end date to now'
        */
        return await PromotionController.finalize(req, res);
    }
);

export default router;
