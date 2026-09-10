import prisma from "../../../config/client.js";

import type {
    UpdatePersonnelCandidatePositionValidationData,
} from "../../../interfaces/humanTalent/candidateValidation/personnelCandidateValidation.interface.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager,
} from "../../../helpers/humanTalent/candidateSubmission/personnelCandidateManager.helper.js";

// Guarda la Fase 2 - Validación de cargo.
export const updatePersonnelCandidatePositionValidationService = async (
    data: UpdatePersonnelCandidatePositionValidationData,
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
                requisition: {
                    select: {
                        positionRevisionId: true,
                        positionRevision: {
                            select: {
                                positionProfileId: true,
                            },
                        },
                    },
                },
                validation: {
                    select: {
                        id: true,
                        completedStep: true,
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe, no ha sido preseleccionado o no está disponible para validación"
        );
    }

    if (!candidate.validation) {
        throw new Error(
            "Debe completar primero el concepto de aplicación"
        );
    }

    if (candidate.validation.completedStep >= 3) {
        throw new Error(
            "La validación de cargo ya fue completada y el proceso avanzó a una etapa posterior"
        );
    }

    if (
        data.positionType === "NUEVO_CARGO" &&
        !data.changeControlCode?.trim()
    ) {
        throw new Error(
            "El código de control de cambio es obligatorio para un nuevo cargo"
        );
    }

    const currentRevision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                positionProfileId:
                    candidate.requisition.positionRevision.positionProfileId,
                status: "VIGENTE",
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

    const isPositionProfileCurrent =
        currentRevision?.id ===
        candidate.requisition.positionRevisionId;

    if (!isPositionProfileCurrent) {
        throw new Error(
            "El perfil de cargo asociado a esta requisición ya no se encuentra vigente. No es posible guardar la validación de cargo."
        );
    }

    const validation =
        await prisma.personnelCandidateValidation.update({
            where: {
                id: candidate.validation.id,
            },
            data: {
                positionType: data.positionType,
                changeControlCode:
                    data.positionType === "NUEVO_CARGO"
                        ? data.changeControlCode?.trim() || null
                        : null,
                isPositionProfileCurrent,
                completedStep: 2,
            },
            select: {
                id: true,
                candidateId: true,
                applicationConcept: true,
                positionType: true,
                changeControlCode: true,
                isPositionProfileCurrent: true,
                completedStep: true,
                updatedAt: true,
            },
        });

    return validation;
};