import { Router } from "express";

import {
    approvePersonnelCandidateTechnicalEvaluation,
    completePersonnelCandidateCompetencyEvaluation,
    completePersonnelCandidateValidation,
    createPersonnelCandidatePsychotechnicalTests,
    createPersonnelCandidateValidation,
    getPersonnelCandidateValidationDetail,
    getPersonnelCandidateValidations,
    savePersonnelCandidateCompetencyValidations,
    savePersonnelCandidateTechnicalEvaluation,
    updatePersonnelCandidatePositionValidation,
} from "../../../controllers/humanTalent/candidateValidation/personnelCandidateValidation.controller.js";

import {
    authMiddleware,
    uploadCandidateTechnicalExam,
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
    uploadCandidateTechnicalExam,
    savePersonnelCandidateTechnicalEvaluation
);

// Confirma la Fase 4 - Evaluación Técnica.
router.patch(
    "/:candidateId/technical-evaluation/approve",
    authMiddleware,
    approvePersonnelCandidateTechnicalEvaluation
);

// Registra una prueba psicotécnica - Fase 5.
router.post(
    "/:candidateId/psychotechnical-tests",
    authMiddleware,
    createPersonnelCandidatePsychotechnicalTests
);

// Guarda las competencias evaluadas - Fase 5.
router.post(
    "/:candidateId/competency-validations",
    authMiddleware,
    savePersonnelCandidateCompetencyValidations
);

// Finaliza la Fase 5 - Evaluación de Competencias.
router.patch(
    "/:candidateId/competency-evaluation",
    authMiddleware,
    completePersonnelCandidateCompetencyEvaluation
);

export default router;