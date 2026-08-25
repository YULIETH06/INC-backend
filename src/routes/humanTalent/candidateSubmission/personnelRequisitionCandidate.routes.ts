import { Router } from "express";

import {
    closePersonnelRequisitionCandidates,
    createPersonnelRequisitionCandidate,
    deletePersonnelRequisitionCandidate,
    getPersonnelCandidateSubmissionBatches,
    getPersonnelCandidateSubmissionHistory,
    getPersonnelRequisitionCandidates,
    preselectPersonnelRequisitionCandidates,
    reopenPersonnelRequisitionCandidates,
    updatePersonnelRequisitionCandidate,
} from "../../../controllers/humanTalent/candidateSubmission/personnelRequisitionCandidate.controller.js";

import {
    authMiddleware,
    uploadPersonnelCandidateResume,
} from "../../../middlewares/index.js";

const router = Router();

// Registra un candidato con su hoja de vida.
router.post(
    "/:id/candidates",
    authMiddleware,
    uploadPersonnelCandidateResume,
    createPersonnelRequisitionCandidate
);

// Obtiene los candidatos registrados en una requisición.
router.get(
    "/:id/candidates",
    authMiddleware,
    getPersonnelRequisitionCandidates
);

// Obtiene el historial de reaperturas y cierres posteriores.
router.get(
    "/:id/candidates/history",
    authMiddleware,
    getPersonnelCandidateSubmissionHistory
);

// Obtiene las fotografías históricas de los diferentes cargues.
router.get(
    "/:id/candidates/batches",
    authMiddleware,
    getPersonnelCandidateSubmissionBatches
);

// Cierra el proceso de cargue de candidatos.
router.patch(
    "/:id/candidates/close",
    authMiddleware,
    closePersonnelRequisitionCandidates
);

// Reabre el proceso de cargue de candidatos.
router.patch(
    "/:id/candidates/reopen",
    authMiddleware,
    reopenPersonnelRequisitionCandidates
);

// Confirma la preselección de uno o varios candidatos.
router.patch(
    "/:id/candidates/preselect",
    authMiddleware,
    preselectPersonnelRequisitionCandidates
);

// Actualiza los datos o la hoja de vida de un candidato.
router.patch(
    "/:id/candidates/:candidateId",
    authMiddleware,
    uploadPersonnelCandidateResume,
    updatePersonnelRequisitionCandidate
);

// Elimina un candidato y su hoja de vida.
router.delete(
    "/:id/candidates/:candidateId",
    authMiddleware,
    deletePersonnelRequisitionCandidate
);

export default router;