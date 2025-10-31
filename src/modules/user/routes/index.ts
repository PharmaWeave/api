import express, { Router } from "express";

import BrandController from "@/modules/user/controllers/brand";
import UserController from "@/modules/user/controllers/user";
import { RoleEnum } from "@/modules/user/models/base-user";

import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";

const router: Router = express.Router();

router.post("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Users']
          #swagger.path = '/user'
          #swagger.description = 'Register a new User'
        */
        await UserController.create(req, res);
    }
);

router.patch("/:user_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.EMPLOYEE, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Users']
          #swagger.path = '/user/:user_id'
          #swagger.description = 'Update an User'
        */
        await UserController.update(req, res);
    }
);

router.post("/signup", async (req, res) => {
    /* 
      #swagger.tags = ['Users']
      #swagger.path = '/user/signup'
      #swagger.description = 'Register a new Brand'
      #swagger.parameters['brand'] = {
          in: 'body',
          description: 'Brand data',
          required: true,
          schema: {
              cnpj: '58403919000106',
              password: '123456'
          }
      }
    */
    await BrandController.signup(req, res);
});

export default router;
