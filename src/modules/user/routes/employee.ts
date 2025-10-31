import express, { Router } from "express";

import { AuthMiddleware } from "@/middlewares/auth";
import { RoleMiddleware } from "@/middlewares/role";

import EmployeeController from "@/modules/user/controllers/employee";

import { RoleEnum } from "@/modules/user/models/base-user";

const router: Router = express.Router();

router.post("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Employee']
          #swagger.path = '/user/employee'
          #swagger.description = 'Register a new Employee'
          #swagger.parameters['employee'] = {
              in: 'body',
              description: 'Employee data',
              required: true,
              schema: {
                  cpf: '04476272010',
                  name: 'Mateus Vieira',
                  salary: 8000,
                  branch_id: 1
              }
          }
        */
        await EmployeeController.create(req, res);
    }
);

router.get("/",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Employee']
          #swagger.path = '/user/employee'
          #swagger.description = 'Retrieve Employees of your Brand if your are Admin and of your Branch if you are Manager'
        */
        await EmployeeController.retrieve(req, res);
    }
);

router.patch("/activate",
    async (req, res) => {
        /* 
          #swagger.tags = ['Employee']
          #swagger.path = '/user/employee/activate'
          #swagger.description = 'Activate an Employee creating a password'
        */
        await EmployeeController.activate(req, res);
    }
);

router.patch("/status/:employee_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN, RoleEnum.MANAGER]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Employee']
          #swagger.path = '/user/employee/status/:employee_id'
          #swagger.description = 'Toggle the status of an Employee'
        */
        await EmployeeController.toggle_status(req, res);
    }
);

router.patch("/promote/:employee_id",
    AuthMiddleware,
    RoleMiddleware([RoleEnum.ADMIN]),
    async (req, res) => {
        /* 
          #swagger.tags = ['Employee']
          #swagger.path = '/user/employee/promote/:employee_id'
          #swagger.description = 'Promote an Employee to be a Brand manager'
        */
        await EmployeeController.promote_to_manager(req, res);
    }
);

export default router;
