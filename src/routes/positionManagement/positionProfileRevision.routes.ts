import { Router } from "express";

import {
    createPositionProfileRevision,
    createPositionRequirementDescription,
    deletePositionProfileRevision,
    deletePositionRequirementDescription,
    getCurrentPositionProfileRevision,
    getPositionProfileRevisionDetail,
    getPositionProfileRevisions,
    publishPositionProfileRevision,
    updatePositionProfileRevision,
    updatePositionRequirementDescription,
} from "../../controllers/positionManagement/positionProfileRevision.controller.js";

import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

// Obtiene la revisión vigente de un perfil de cargo.
router.get(
    "/:positionProfileId/current-revision",
    authMiddleware,
    getCurrentPositionProfileRevision
);

// Crea una nueva revisión para un perfil de cargo.
router.post(
    "/:positionProfileId/revisions",
    authMiddleware,
    createPositionProfileRevision
);

// Agrega una descripción a un requisito de una revisión.
router.post(
    "/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions",
    authMiddleware,
    createPositionRequirementDescription
);

// Elimina lógicamente una descripción de una revisión.
router.delete(
    "/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions/:descriptionId",
    authMiddleware,
    deletePositionRequirementDescription
);

// Obtiene el detalle de una revisión con sus requisitos.
router.get(
    "/:positionProfileId/revisions/:revisionId",
    authMiddleware,
    getPositionProfileRevisionDetail
);

// Obtiene las revisiones de un perfil de cargo.
router.get(
    "/:positionProfileId/revisions",
    authMiddleware,
    getPositionProfileRevisions
);

// Publica una revisión y la convierte en la revisión vigente del cargo.
router.patch(
    "/:positionProfileId/revisions/:revisionId/publish",
    authMiddleware,
    publishPositionProfileRevision
);

// Actualiza la observación de una revisión.
router.patch(
    "/:positionProfileId/revisions/:revisionId",
    authMiddleware,
    updatePositionProfileRevision
);

// Actualiza una descripción de un requisito de una revisión.
router.patch(
    "/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions/:descriptionId",
    authMiddleware,
    updatePositionRequirementDescription
);

// Elimina lógicamente una revisión en estado borrador.
router.delete(
    "/:positionProfileId/revisions/:revisionId",
    authMiddleware,
    deletePositionProfileRevision
);

export default router;