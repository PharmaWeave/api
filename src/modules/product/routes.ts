import express, { Router } from "express";

import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";

import { RoleEnum } from "@/modules/user/models/base-user";
import ProductController from "./controllers/product";

const router: Router = express.Router();

router.post("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Product']
          #swagger.path = '/product'
          #swagger.description = 'Register a new Product into some Brand'
          #swagger.parameters['product'] = {
              in: 'body',
              description: 'Product data',
              required: true,
              schema: {
                    name: 'string',
                    description: 'string',
                    info: {
                        price: 'number',
                        stock: 'number'
                    }
              }
          }
        */
        return await ProductController.create(req, res);
    }
);

router.get("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Product']
          #swagger.path = '/product'
          #swagger.description = 'Retrieve all product infos of the Employee/Manager Branch'
        */
        return await ProductController.get_all(req, res);
    }
);

router.patch("/:product_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Product']
          #swagger.path = '/product/:product_id'
          #swagger.description = 'Update any field of some Product that exists in your Branch'
        */
        return await ProductController.update(req, res);
    }
);

router.patch("/status/:product_info_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Product']
          #swagger.path = '/product/:product_id'
          #swagger.description = 'Toggle the status of a Product Info of a Branch'
        */
        return await ProductController.toggle_status(req, res);
    }
);

export default router;
