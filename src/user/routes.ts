import express, { Router } from "express";
import BrandController from "./controllers/brand";

const router: Router = express.Router();

router.post("/signup", async (req, res) => {
    /* 
      #swagger.tags = ['Users']
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
