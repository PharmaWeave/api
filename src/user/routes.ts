import express, { Router } from "express";
import BrandController from "./controllers/brand";

const router: Router = express.Router();

router.post("/signup", async (req, res) => await BrandController.signup(req, res));

export default router;
