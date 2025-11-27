import express, { Router } from "express";
import AuthController from "./controllers/auth";

const router: Router = express.Router();

router.post("/login", async (req, res) => {
    /* 
      #swagger.tags = ['Auth']
      #swagger.description = 'Login as Admin or Employee'
      #swagger.parameters['login'] = {
          in: 'body',
          description: 'Login data',
          required: true,
          schema: {
              register: 'cpf | cnpj',
              password: '123456'
          }
      }
    */
    await AuthController.login(req, res);
});

router.post("/logout", async (req, res) => {
    /* 
      #swagger.tags = ['Auth']
      #swagger.description = 'Logout - Remove refresh cookie'
    */
    await AuthController.logout(req, res);
});

router.post("/refresh", async (req, res) => {
    /* 
      #swagger.tags = ['Auth']
      #swagger.description = 'Refresh access token'
    */
    await AuthController.refresh(req, res);
});

export default router;
