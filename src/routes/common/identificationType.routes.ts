import { Router } from "express";

import {
    getActiveIdentificationTypes
} from "../../controllers/common/identificationType.controller.js";

import {
    authMiddleware
} from "../../middlewares/index.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    getActiveIdentificationTypes
);

export default router;