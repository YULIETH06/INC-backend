import { Router } from "express";

import {
    completePersonnelCandidateValidation,
    createPersonnelCandidateValidation,
    getPersonnelCandidateValidationDetail,
    getPersonnelCandidateValidations,
    updatePersonnelCandidatePositionValidation,
} from "../../controllers/humanTalent/personnelCandidateValidation.controller.js";

import {
    authMiddleware,
} from "../../middlewares/index.js";

const router = Router();

// Obtiene los candidatos disponibles para validación.
router.get(
    "/",
    authMiddleware,
    getPersonnelCandidateValidations
);

// Obtiene el detalle de la validación de un candidato.
router.get(
    "/:candidateId",
    authMiddleware,
    getPersonnelCandidateValidationDetail
);

// Guarda la Fase 1 e inicia la validación del candidato.
router.post(
    "/:candidateId",
    authMiddleware,
    createPersonnelCandidateValidation
);

// Guarda la Fase 2 de validación de cargo.
router.patch(
    "/:candidateId/position",
    authMiddleware,
    updatePersonnelCandidatePositionValidation
);

// Completa la Fase 3 de validación del postulante.
router.patch(
    "/:candidateId/candidate",
    authMiddleware,
    completePersonnelCandidateValidation
);

export default router;