import express, { Router } from "express";

import BranchController from "@/modules/branch/controllers/branch";

import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";
import { RoleEnum } from "@/modules/user/models/base-user";

const router: Router = express.Router();

router.post("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Branches']
          #swagger.path = '/branch'
          #swagger.description = 'Register a new Branch for some Brand'
          #swagger.parameters['branch'] = {
              in: 'body',
              description: 'Branch data',
              required: true,
              schema: {
                    name: 'string',
                    brand_id: 'number',
                    address: {
                        country: 'string',
                        province: 'string',
                        city: 'string',
                        description: 'string',
                        number: 'number',
                    },
                    phone: 'string | undefined',
              }
          }
        */
        await BranchController.create(req, res);
    }
);

router.get("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Branches']
          #swagger.path = '/branch'
          #swagger.description = 'Retrieve all branches of the brand'
        */
        await BranchController.retrieve(req, res);
    }
);

router.patch("/status/:branch_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Branches']
          #swagger.path = '/branch/status/:branch_id'
          #swagger.description = 'Toggle the status of some Branch between 'A' and 'I''
          #swagger.parameters['branch_id'] = {
              in: 'path',
              required: true,
              type: 'integer',
              description: 'ID of the Branch'
          }
        */
        await BranchController.toggle_status(req, res);
    }
);

export default router;
