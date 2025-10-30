import express, { Router } from "express";

import employee from "@/user/routes/employee";
import standard from "@/user/routes/index";

const router: Router = express.Router();

router.use(standard);
router.use("/employee", employee);

export default router;
