import express, { Router } from "express";

import employee from "@/modules/user/routes/employee";
import standard from "@/modules/user/routes/index";

const router: Router = express.Router();

router.use(standard);
router.use("/employee", employee);

export default router;
