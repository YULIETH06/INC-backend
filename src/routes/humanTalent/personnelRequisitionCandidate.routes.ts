import { Router } from "express";

import {
    closePersonnelRequisitionCandidates,
    createPersonnelRequisitionCandidate,
    deletePersonnelRequisitionCandidate,
    getPersonnelRequisitionCandidates,
    reopenPersonnelRequisitionCandidates,
    updatePersonnelRequisitionCandidate,
} from "../../controllers/humanTalent/personnelRequisitionCandidate.controller.js";

import {
    authMiddleware,
    uploadPersonnelCandidateResume,
} from "../../middlewares/index.js";

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