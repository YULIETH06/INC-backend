import { Router } from "express";
import { getProfile } from "../../controllers/users/profile.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

router.get("/", authMiddleware, getProfile);

export default router;