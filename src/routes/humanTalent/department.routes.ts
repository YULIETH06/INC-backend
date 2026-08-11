import { Router } from "express";
import { getActiveDepartments } from "../../controllers/humanTalent/department.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

router.get("/", authMiddleware, getActiveDepartments);

export default router;