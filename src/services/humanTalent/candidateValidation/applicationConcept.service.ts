import type { CandidateApplicationConcept } from "@prisma/client";

import prisma from "../../../config/client.js";

import type {
    CreatePersonnelCandidateValidationData,
} from "../../../interfaces/humanTalent/candidateValidation/personnelCandidateValidation.interface.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager,
} from "../../../helpers/humanTalent/candidateSubmission/personnelCandidateManager.helper.js";

import {
    createAuditLog,
    toAuditActor,
} from "../../../helpers/audit/auditLog.helper.js";

import {
    AUDIT_ACTIONS,
    AUDIT_MODULES,
} from "../../../constants/audit/auditLog.constants.js";

// Nombre legible del concepto de aplicación para la auditoría.
const APPLICATION_CONCEPT_LABELS: Record<CandidateApplicationConcept, string> = {
    INGRESO: "Ingreso",
    MODIFICACION_CARGO: "Modificación de cargo",
};

// Inicia la Fase 1 - Concepto de aplicación.
export const createPersonnelCandidateValidationService = async (
    data: CreatePersonnelCandidateValidationData,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    await validatePersonnelCandidateManager(
        prisma,
        authenticatedUser.id
    );

    const candidate =
        await prisma.personnelRequisitionCandidate.findFirst({
            where: {
                id: data.candidateId,
                isPreselected: true,
                requisition: {
                    status: "APROBADA",
                },
            },
            select: {
                id: true,
                requisitionId: true,
                name: true,

                validation: {
                    select: {
                        id: true,
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe, no ha sido preseleccionado o no está disponible para validación"
        );
    }

    if (candidate.validation) {
        throw new Error(
            "El candidato ya tiene una validación iniciada"
        );
    }

    const validation = await prisma.$transaction(async (tx) => {
        const createdValidation =
            await tx.personnelCandidateValidation.create({
                data: {
                    candidateId: candidate.id,
                    applicationConcept:
                        data.applicationConcept,
                    completedStep: 1,
                },
                select: {
                    id: true,
                    candidateId: true,
                    applicationConcept: true,
                    completedStep: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        // Registra el inicio de la validación en la auditoría.
        await createAuditLog(tx, {
            actor: toAuditActor(authenticatedUser),
            module: AUDIT_MODULES.HUMAN_TALENT,
            action: AUDIT_ACTIONS.CANDIDATE_VALIDATION_STARTED,
            entityType: "PersonnelRequisitionCandidate",
            entityId: candidate.id,
            description: `${candidate.name} – Requisición #${candidate.requisitionId}: concepto de aplicación ${APPLICATION_CONCEPT_LABELS[data.applicationConcept]}`,
        });

        return createdValidation;
    });

    return validation;
};