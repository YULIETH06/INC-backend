import { Router } from "express";

import {
    approvePersonnelCandidateTechnicalEvaluation,
    completePersonnelCandidateValidation,
    createPersonnelCandidateValidation,
    getPersonnelCandidateValidationDetail,
    getPersonnelCandidateValidations,
    savePersonnelCandidateTechnicalEvaluation,
    updatePersonnelCandidatePositionValidation,
} from "../../../controllers/humanTalent/candidateValidation/personnelCandidateValidation.controller.js";

import {
    authMiddleware,
} from "../../../middlewares/index.js";

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

// Guarda las calificaciones de la Fase 4 - Evaluación Técnica.
router.patch(
    "/:candidateId/technical-evaluation",
    authMiddleware,
    savePersonnelCandidateTechnicalEvaluation
);

// Confirma la Fase 4 - Evaluación Técnica.
router.patch(
    "/:candidateId/technical-evaluation/approve",
    authMiddleware,
    approvePersonnelCandidateTechnicalEvaluation
);

export default router;