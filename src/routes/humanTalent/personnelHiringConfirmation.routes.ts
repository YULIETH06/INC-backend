import { Router } from "express";

import {
    createPersonnelHiringConfirmation,
    decidePersonnelHiringConfirmation,
} from "../../controllers/humanTalent/personnelHiringConfirmation.controller.js";

import { authMiddleware } from "../../middlewares/index.js";


const router = Router();

// Registra la confirmación final de contratación de una requisición.
router.post(
    "/requisitions/:id/hiring-confirmation",
    authMiddleware,
    createPersonnelHiringConfirmation
);

// Aprueba, rechaza o cancela una confirmación de contratación.
router.patch(
    "/hiring-confirmations/:id/decision",
    authMiddleware,
    decidePersonnelHiringConfirmation
);

export default router;