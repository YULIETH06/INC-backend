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

    const validation =
        await prisma.personnelCandidateValidation.create({
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

    return validation;
};