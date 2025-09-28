import express, { Router } from "express";
import AuthController from "./controllers/auth";

const router: Router = express.Router();

router.post("/login", async (req, res) => await AuthController.login(req, res));

export default router;
