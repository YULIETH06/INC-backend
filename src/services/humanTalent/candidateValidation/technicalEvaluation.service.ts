import prisma from "../../../config/client.js";

import type {
    ApprovePersonnelCandidateTechnicalEvaluationData,
    SavePersonnelCandidateTechnicalEvaluationData,
} from "../../../interfaces/humanTalent/candidateValidation/personnelCandidateValidation.interface.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager,
} from "../../../helpers/humanTalent/candidateSubmission/personnelCandidateManager.helper.js";

import {
    notifyCandidateTechnicalEvaluationConfirmedService,
    notifyCandidateTechnicalEvaluationPendingService,
} from "../../notifications/humanTalent/humanTalentNotification.service.js";

// Guarda las calificaciones de la Fase 4 - Evaluación Técnica.
export const savePersonnelCandidateTechnicalEvaluationService = async (
    data: SavePersonnelCandidateTechnicalEvaluationData,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
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

                        personnelCandidateTechnicalEvaluation: {
                            select: {
                                id: true,
                                interviewScore: true,
                                interviewRecordedAt: true,
                                examScore: true,
                                examRecordedAt: true,

                                examEvidenceOriginalName: true,
                                examEvidenceFileName: true,
                                examEvidenceFileUrl: true,
                                examEvidenceMimeType: true,
                                examEvidenceFileSize: true,
                                examEvidenceUploadedAt: true,

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
        candidate.validation.personnelCandidateTechnicalEvaluation;

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

    const finalExamEvidenceFileUrl =
        data.examEvidence?.fileUrl ??
        existingEvaluation?.examEvidenceFileUrl ??
        null;

    if (
        data.examScore !== undefined &&
        data.examScore !== null &&
        !data.examEvidence
    ) {
        throw new Error(
            "Debe adjuntar la evidencia PDF del examen"
        );
    }

    if (
        data.examEvidence &&
        (
            data.examScore === undefined ||
            data.examScore === null
        )
    ) {
        throw new Error(
            "Debe registrar la calificación del examen para adjuntar su evidencia"
        );
    }

    const isEvaluationComplete =
        finalInterviewScore !== null &&
        finalExamScore !== null &&
        finalExamEvidenceFileUrl !== null;

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

                examEvidenceOriginalName:
                    data.examEvidence?.originalName ?? null,

                examEvidenceFileName:
                    data.examEvidence?.fileName ?? null,

                examEvidenceFileUrl:
                    data.examEvidence?.fileUrl ?? null,

                examEvidenceMimeType:
                    data.examEvidence?.mimeType ?? null,

                examEvidenceFileSize:
                    data.examEvidence?.fileSize ?? null,

                examEvidenceUploadedAt:
                    data.examEvidence
                        ? now
                        : null,

                enteredById:
                    authenticatedUser.id,

                status:
                    isEvaluationComplete
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

                ...(data.examEvidence
                    ? {
                        examEvidenceOriginalName:
                            data.examEvidence.originalName,

                        examEvidenceFileName:
                            data.examEvidence.fileName,

                        examEvidenceFileUrl:
                            data.examEvidence.fileUrl,

                        examEvidenceMimeType:
                            data.examEvidence.mimeType,

                        examEvidenceFileSize:
                            data.examEvidence.fileSize,

                        examEvidenceUploadedAt: now,
                    }
                    : {}),

                status:
                    isEvaluationComplete
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

                examEvidenceOriginalName: true,
                examEvidenceFileName: true,
                examEvidenceFileUrl: true,
                examEvidenceMimeType: true,
                examEvidenceFileSize: true,
                examEvidenceUploadedAt: true,

                status: true,
                enteredById: true,
                updatedAt: true,
            },
        });

    // Cuando ambas notas quedan listas, notifica al creador de la requisición.
    if (isEvaluationComplete) {
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

                        personnelCandidateTechnicalEvaluation: {
                            select: {
                                id: true,
                                interviewScore: true,
                                interviewRecordedAt: true,
                                examScore: true,
                                examRecordedAt: true,

                                examEvidenceOriginalName: true,
                                examEvidenceFileName: true,
                                examEvidenceFileUrl: true,
                                examEvidenceMimeType: true,
                                examEvidenceFileSize: true,
                                examEvidenceUploadedAt: true,

                                status: true,
                                enteredById: true,
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
        candidate.validation.personnelCandidateTechnicalEvaluation;

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
        technicalEvaluation.examScore === null ||
        technicalEvaluation.examEvidenceFileUrl === null
    ) {
        throw new Error(
            "La entrevista, el examen y la evidencia PDF del examen deben estar completos antes de continuar"
        );
    }

    const approvedAt = new Date();

    const result = await prisma.$transaction(
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

    // Notifica al Analista de Talento Humano que registró las calificaciones.
    await notifyCandidateTechnicalEvaluationConfirmedService(
        technicalEvaluation.enteredById,
        candidate.requisition.id,
        candidate.name,
        candidate.requisition.position.name,
        data.isSuitable
    );

    return result;
};