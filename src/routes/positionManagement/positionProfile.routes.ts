import { Router } from "express";
import { getActivePositionProfiles } from "../../controllers/positionManagement/positionProfile.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

router.get("/", authMiddleware, getActivePositionProfiles);

export default router;