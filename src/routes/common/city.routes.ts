import { Router } from "express";
import { getActiveCities } from "../../controllers/common/city.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

router.get("/", authMiddleware, getActiveCities);

export default router;