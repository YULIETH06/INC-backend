import prisma from "../../../config/client.js";

import type {
    CompletePersonnelCandidateValidationData,
    CreatePersonnelCandidateValidationData,
    UpdatePersonnelCandidatePositionValidationData,
} from "../../../interfaces/humanTalent/candidateValidation/personnelCandidateValidation.interface.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager,
} from "../../../helpers/humanTalent/candidateSubmission/personnelCandidateManager.helper.js";

import {
    validatePersonnelCandidateValidationAccess,
} from "../../../helpers/humanTalent/candidateValidation/personnelCandidateValidationAccess.helper.js";

// Inicia la validación de cargo y postulante.
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

// Guarda la Fase 2 de validación de cargo.
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

    if (candidate.validation.completedStep === 3) {
        throw new Error(
            "La validación del candidato ya fue completada"
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

// Completa la Fase 3 de validación del postulante.
export const completePersonnelCandidateValidationService = async (
    data: CompletePersonnelCandidateValidationData,
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
                        positionRevision: {
                            select: {
                                requirementDescriptions: {
                                    where: {
                                        deletedAt: null,
                                    },
                                    select: {
                                        id: true,
                                    },
                                },
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

    if (candidate.validation.completedStep < 2) {
        throw new Error(
            "Debe completar primero la validación de cargo"
        );
    }

    if (candidate.validation.completedStep === 3) {
        throw new Error(
            "La validación del candidato ya fue completada"
        );
    }

    const requiredDescriptionIds =
        candidate.requisition.positionRevision.requirementDescriptions.map(
            (description) => description.id
        );

    const submittedDescriptionIds =
        data.requirementValidations.map(
            (validation) =>
                validation.requirementDescriptionId
        );

    const uniqueSubmittedDescriptionIds =
        new Set(submittedDescriptionIds);

    if (
        uniqueSubmittedDescriptionIds.size !==
        submittedDescriptionIds.length
    ) {
        throw new Error(
            "No se puede evaluar una misma descripción de requisito más de una vez"
        );
    }

    if (
        submittedDescriptionIds.length !==
        requiredDescriptionIds.length
    ) {
        throw new Error(
            "Debe evaluar todos los requisitos del perfil de cargo"
        );
    }

    const requiredDescriptionIdSet =
        new Set(requiredDescriptionIds);

    const hasInvalidDescription =
        submittedDescriptionIds.some(
            (descriptionId) =>
                !requiredDescriptionIdSet.has(
                    descriptionId
                )
        );

    if (hasInvalidDescription) {
        throw new Error(
            "Uno o más requisitos no pertenecen a la revisión del cargo de esta requisición"
        );
    }

    const normalizedRequirementValidations =
        data.requirementValidations.map(
            (validation) => {
                const evidence =
                    validation.evidence?.trim() || null;

                const gapClosure =
                    validation.gapClosure?.trim() || null;

                if (
                    validation.complies &&
                    !evidence
                ) {
                    throw new Error(
                        "La evidencia es obligatoria cuando el postulante cumple el requisito"
                    );
                }

                if (
                    !validation.complies &&
                    !gapClosure
                ) {
                    throw new Error(
                        "El cierre de brecha es obligatorio cuando el postulante no cumple el requisito"
                    );
                }

                if (
                    evidence &&
                    evidence.length > 1000
                ) {
                    throw new Error(
                        "La evidencia no puede superar los 1000 caracteres"
                    );
                }

                if (
                    gapClosure &&
                    gapClosure.length > 1000
                ) {
                    throw new Error(
                        "El cierre de brecha no puede superar los 1000 caracteres"
                    );
                }

                return {
                    candidateValidationId:
                        candidate.validation!.id,
                    requirementDescriptionId:
                        validation.requirementDescriptionId,
                    complies: validation.complies,
                    evidence:
                        validation.complies
                            ? evidence
                            : null,
                    gapClosure:
                        validation.complies
                            ? null
                            : gapClosure,
                };
            }
        );

    const validation = await prisma.$transaction(
        async (tx) => {
            await tx.personnelCandidateRequirementValidation.createMany({
                data: normalizedRequirementValidations,
            });

            return tx.personnelCandidateValidation.update({
                where: {
                    id: candidate.validation!.id,
                },
                data: {
                    isSuitable: data.isSuitable,
                    performedById:
                        authenticatedUser.id,
                    validatedAt: new Date(),
                    completedStep: 3,
                },
                select: {
                    id: true,
                    candidateId: true,
                    applicationConcept: true,
                    positionType: true,
                    changeControlCode: true,
                    isPositionProfileCurrent: true,
                    isSuitable: true,
                    performedById: true,
                    completedStep: true,
                    validatedAt: true,
                    requirementValidations: {
                        select: {
                            id: true,
                            requirementDescriptionId: true,
                            complies: true,
                            evidence: true,
                            gapClosure: true,
                        },
                    },
                    updatedAt: true,
                },
            });
        }
    );

    return validation;
};

// Obtiene los candidatos preseleccionados disponibles para validación de cargo y postulante.
export const getPersonnelCandidateValidationsService = async (
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    const access =
        await validatePersonnelCandidateValidationAccess(
            prisma,
            authenticatedUser.id,
            authenticatedUser.role
        );

    const candidates =
        await prisma.personnelRequisitionCandidate.findMany({
            where: {
                isPreselected: true,
                requisition: {
                    status: "APROBADA",
                },
            },
            select: {
                id: true,
                requisitionId: true,
                identificationNumber: true,
                name: true,
                createdAt: true,
                identificationType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                requisition: {
                    select: {
                        id: true,
                        candidateSubmissionStatus: true,
                        department: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                        position: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                    },
                },
                validation: {
                    select: {
                        id: true,
                        applicationConcept: true,
                        positionType: true,
                        isPositionProfileCurrent: true,
                        isSuitable: true,
                        completedStep: true,
                        validatedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    const formattedCandidates = candidates.map(
        (candidate) => {
            let validationStatus =
                "SIN_INICIAR";

            if (candidate.validation?.completedStep === 1) {
                validationStatus =
                    "CONCEPTO_APLICACION_COMPLETADO";
            }

            if (candidate.validation?.completedStep === 2) {
                validationStatus =
                    "VALIDACION_CARGO_COMPLETADA";
            }

            if (candidate.validation?.completedStep === 3) {
                validationStatus =
                    "VALIDACION_COMPLETADA";
            }

            return {
                ...candidate,
                validationStatus,
            };
        }
    );

    return {
        candidates: formattedCandidates,
        canManageValidation:
            access.canManageValidation,
    };
};

// Obtiene el detalle de la validación de un candidato preseleccionado.
export const getPersonnelCandidateValidationDetailService = async (
    candidateId: number,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    const access =
        await validatePersonnelCandidateValidationAccess(
            prisma,
            authenticatedUser.id,
            authenticatedUser.role
        );

    const candidate =
        await prisma.personnelRequisitionCandidate.findFirst({
            where: {
                id: candidateId,
                isPreselected: true,
                requisition: {
                    status: "APROBADA",
                },
            },
            select: {
                id: true,
                requisitionId: true,
                identificationNumber: true,
                name: true,
                identificationType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                requisition: {
                    select: {
                        id: true,
                        candidateSubmissionStatus: true,
                        positionRevisionId: true,
                        department: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                        position: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                        positionRevision: {
                            select: {
                                id: true,
                                revisionNumber: true,
                                status: true,
                                requirementDescriptions: {
                                    where: {
                                        deletedAt: null,
                                    },
                                    select: {
                                        id: true,
                                        description: true,
                                        requirement: {
                                            select: {
                                                id: true,
                                                name: true,
                                            },
                                        },
                                    },
                                    orderBy: {
                                        id: "asc",
                                    },
                                },
                            },
                        },
                    },
                },
                validation: {
                    select: {
                        id: true,
                        applicationConcept: true,
                        positionType: true,
                        changeControlCode: true,
                        isPositionProfileCurrent: true,
                        isSuitable: true,
                        completedStep: true,
                        validatedAt: true,
                        performedBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        requirementValidations: {
                            select: {
                                id: true,
                                requirementDescriptionId: true,
                                complies: true,
                                evidence: true,
                                gapClosure: true,
                            },
                        },
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe, no ha sido preseleccionado o no está disponible para validación"
        );
    }

    return {
        candidate,
        canManageValidation:
            access.canManageValidation,
    };
};