import prisma from "../../../config/client.js";

import type {
    ApprovePersonnelCandidateTechnicalEvaluationData,
    CompletePersonnelCandidateValidationData,
    CreatePersonnelCandidateValidationData,
    SavePersonnelCandidateTechnicalEvaluationData,
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

import {
    notifyCandidateTechnicalEvaluationPendingService,
} from "../../notifications/humanTalent/humanTalentNotification.service.js";

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

    if (candidate.validation.completedStep >= 3) {
        throw new Error(
            "La validación del postulante ya fue completada"
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

// Guarda las calificaciones de la Fase 4 - Evaluación Técnica.
export const savePersonnelCandidateTechnicalEvaluationService = async (
    data: SavePersonnelCandidateTechnicalEvaluationData,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    // Solo el Auxiliar de Talento Humano puede diligenciar las calificaciones.
    await validatePersonnelCandidateManager(
        prisma,
        authenticatedUser.id
    );

    if (
        data.interviewScore === undefined &&
        data.examScore === undefined
    ) {
        throw new Error(
            "Debe diligenciar por lo menos una calificación"
        );
    }

    if (
        data.interviewScore !== undefined &&
        data.interviewScore !== null &&
        (
            !Number.isFinite(data.interviewScore) ||
            data.interviewScore < 0 ||
            data.interviewScore > 5
        )
    ) {
        throw new Error(
            "La calificación de la entrevista debe estar entre 0.0 y 5.0"
        );
    }

    if (
        data.examScore !== undefined &&
        data.examScore !== null &&
        (
            !Number.isFinite(data.examScore) ||
            data.examScore < 0 ||
            data.examScore > 5
        )
    ) {
        throw new Error(
            "La calificación del examen debe estar entre 0.0 y 5.0"
        );
    }

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
                name: true,

                requisition: {
                    select: {
                        id: true,
                        createdById: true,
                        position: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },

                validation: {
                    select: {
                        id: true,
                        completedStep: true,
                        isSuitable: true,

                        technicalEvaluation: {
                            select: {
                                id: true,
                                interviewScore: true,
                                interviewRecordedAt: true,
                                examScore: true,
                                examRecordedAt: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe, no ha sido preseleccionado o no está disponible para evaluación técnica"
        );
    }

    if (!candidate.validation) {
        throw new Error(
            "El candidato todavía no tiene una validación iniciada"
        );
    }

    if (candidate.validation.completedStep < 3) {
        throw new Error(
            "Debe completar primero la validación del postulante"
        );
    }

    if (candidate.validation.completedStep > 3) {
        throw new Error(
            "La Evaluación Técnica ya fue completada"
        );
    }

    // La Fase 3 debe haber determinado que el postulante puede continuar.
    if (candidate.validation.isSuitable !== true) {
        throw new Error(
            "El postulante no fue aprobado en la validación del postulante y no puede continuar a la Evaluación Técnica"
        );
    }

    const existingEvaluation =
        candidate.validation.technicalEvaluation;

    if (
        existingEvaluation?.status ===
        "PENDIENTE_APROBACION"
    ) {
        throw new Error(
            "La Evaluación Técnica ya fue enviada para aprobación y no puede modificarse"
        );
    }

    if (
        existingEvaluation?.status ===
        "APROBADA"
    ) {
        throw new Error(
            "La Evaluación Técnica ya fue completada"
        );
    }

    const now = new Date();

    const finalInterviewScore =
        data.interviewScore !== undefined
            ? data.interviewScore
            : existingEvaluation?.interviewScore ?? null;

    const finalExamScore =
        data.examScore !== undefined
            ? data.examScore
            : existingEvaluation?.examScore ?? null;

    const hasBothScores =
        finalInterviewScore !== null &&
        finalExamScore !== null;

    const evaluation =
        await prisma.personnelCandidateTechnicalEvaluation.upsert({
            where: {
                candidateValidationId:
                    candidate.validation.id,
            },

            create: {
                candidateValidationId:
                    candidate.validation.id,

                interviewScore:
                    data.interviewScore ?? null,

                interviewRecordedAt:
                    data.interviewScore !== undefined &&
                        data.interviewScore !== null
                        ? now
                        : null,

                examScore:
                    data.examScore ?? null,

                examRecordedAt:
                    data.examScore !== undefined &&
                        data.examScore !== null
                        ? now
                        : null,

                enteredById:
                    authenticatedUser.id,

                status:
                    hasBothScores
                        ? "PENDIENTE_APROBACION"
                        : "EN_REGISTRO",
            },

            update: {
                ...(data.interviewScore !== undefined
                    ? {
                        interviewScore:
                            data.interviewScore,

                        // Conserva la primera fecha en que fue diligenciada.
                        interviewRecordedAt:
                            existingEvaluation
                                ?.interviewRecordedAt ??
                            (
                                data.interviewScore !== null
                                    ? now
                                    : null
                            ),
                    }
                    : {}),

                ...(data.examScore !== undefined
                    ? {
                        examScore:
                            data.examScore,

                        // Conserva la primera fecha en que fue diligenciado.
                        examRecordedAt:
                            existingEvaluation
                                ?.examRecordedAt ??
                            (
                                data.examScore !== null
                                    ? now
                                    : null
                            ),
                    }
                    : {}),

                status:
                    hasBothScores
                        ? "PENDIENTE_APROBACION"
                        : "EN_REGISTRO",
            },

            select: {
                id: true,
                candidateValidationId: true,
                interviewScore: true,
                interviewRecordedAt: true,
                examScore: true,
                examRecordedAt: true,
                status: true,
                enteredById: true,
                updatedAt: true,
            },
        });

    // Cuando ambas notas quedan listas, notifica al creador de la requisición.
    if (hasBothScores) {
        await notifyCandidateTechnicalEvaluationPendingService(
            candidate.requisition.createdById,
            candidate.requisition.id,
            candidate.name,
            candidate.requisition.position.name
        );
    }

    return evaluation;
};

// Confirma la Fase 4 - Evaluación Técnica.
export const approvePersonnelCandidateTechnicalEvaluationService = async (
    data: ApprovePersonnelCandidateTechnicalEvaluationData,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    if (typeof data.isSuitable !== "boolean") {
        throw new Error(
            "Debe indicar si el postulante es apto para continuar el proceso"
        );
    }

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
                name: true,

                requisition: {
                    select: {
                        id: true,
                        createdById: true,
                    },
                },

                validation: {
                    select: {
                        id: true,
                        completedStep: true,

                        technicalEvaluation: {
                            select: {
                                id: true,
                                interviewScore: true,
                                examScore: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe o no está disponible para Evaluación Técnica"
        );
    }

    // Solo el usuario que creó la requisición puede confirmar esta fase.
    if (
        candidate.requisition.createdById !==
        authenticatedUser.id
    ) {
        throw new Error(
            "Solo el usuario que creó la requisición puede validar la Evaluación Técnica"
        );
    }

    if (!candidate.validation) {
        throw new Error(
            "El candidato todavía no tiene una validación iniciada"
        );
    }

    if (candidate.validation.completedStep !== 3) {
        throw new Error(
            "La Evaluación Técnica no está disponible en la etapa actual"
        );
    }

    const technicalEvaluation =
        candidate.validation.technicalEvaluation;

    if (!technicalEvaluation) {
        throw new Error(
            "La Evaluación Técnica todavía no ha sido diligenciada"
        );
    }

    if (
        technicalEvaluation.status !==
        "PENDIENTE_APROBACION"
    ) {
        throw new Error(
            "La Evaluación Técnica todavía no está lista para validación"
        );
    }

    if (
        technicalEvaluation.interviewScore === null ||
        technicalEvaluation.examScore === null
    ) {
        throw new Error(
            "La entrevista y el examen deben estar calificados antes de continuar"
        );
    }

    const approvedAt = new Date();

    return prisma.$transaction(
        async (tx) => {
            const evaluation =
                await tx.personnelCandidateTechnicalEvaluation.update({
                    where: {
                        id: technicalEvaluation.id,
                    },
                    data: {
                        isSuitable: data.isSuitable,
                        approvedById:
                            authenticatedUser.id,
                        approvedAt,
                        status: "APROBADA",
                    },
                    select: {
                        id: true,
                        candidateValidationId: true,

                        interviewScore: true,
                        interviewRecordedAt: true,

                        examScore: true,
                        examRecordedAt: true,

                        status: true,
                        isSuitable: true,

                        enteredById: true,
                        approvedById: true,
                        approvedAt: true,

                        approvedBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });

            const validation =
                await tx.personnelCandidateValidation.update({
                    where: {
                        id: candidate.validation!.id,
                    },
                    data: {
                        completedStep: 4,
                    },
                    select: {
                        id: true,
                        completedStep: true,
                    },
                });

            return {
                evaluation,
                validation,
            };
        }
    );
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

                    ...(
                        access.canViewAllValidations
                            ? {}
                            : {
                                createdById:
                                    authenticatedUser.id,
                            }
                    ),
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

                        technicalEvaluation: {
                            select: {
                                status: true,
                                isSuitable: true,
                            },
                        },
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
                const technicalStatus =
                    candidate.validation.technicalEvaluation?.status;

                if (!technicalStatus) {
                    validationStatus =
                        "VALIDACION_COMPLETADA";
                }

                if (technicalStatus === "EN_REGISTRO") {
                    validationStatus =
                        "EVALUACION_TECNICA_EN_REGISTRO";
                }

                if (
                    technicalStatus ===
                    "PENDIENTE_APROBACION"
                ) {
                    validationStatus =
                        "EVALUACION_TECNICA_PENDIENTE_APROBACION";
                }
            }

            if (candidate.validation?.completedStep === 4) {
                validationStatus =
                    "EVALUACION_TECNICA_COMPLETADA";
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

                    ...(
                        access.canViewAllValidations
                            ? {}
                            : {
                                createdById:
                                    authenticatedUser.id,
                            }
                    ),
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
                        createdById: true,

                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
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
                        technicalEvaluation: {
                            select: {
                                id: true,

                                interviewScore: true,
                                interviewRecordedAt: true,

                                examScore: true,
                                examRecordedAt: true,

                                status: true,
                                isSuitable: true,

                                enteredById: true,
                                enteredBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },

                                approvedById: true,
                                approvedBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },

                                approvedAt: true,
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

        canApproveTechnicalEvaluation:
            candidate.requisition.createdById ===
            authenticatedUser.id,
    };
};