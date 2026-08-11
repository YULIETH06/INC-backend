import { Router } from "express";

import {
    createPersonnelRequisition,
    decidePersonnelRequisition,
    getPersonnelRequisitionByIdController,
    getPersonnelRequisitions,
} from "../../controllers/humanTalent/personnelRequisition.controller.js";

import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

// Obtiene el listado de requisiciones de personal visibles para el usuario autenticado.
router.get(
    "/",
    authMiddleware,
    getPersonnelRequisitions
);

router.get(
    "/:id",
    authMiddleware,
    getPersonnelRequisitionByIdController
);

// Crea una nueva requisición de personal.
router.post(
    "/",
    authMiddleware,
    createPersonnelRequisition
);

// Aprueba, rechaza o cancela el paso actual de una requisición de personal.
router.patch(
    "/:id/decision",
    authMiddleware,
    decidePersonnelRequisition
);

export default router;