import prisma from "../../../config/client.js";

import type {
    CompletePersonnelCandidateCompetencyEvaluationData,
} from "../../../interfaces/humanTalent/candidateValidation/personnelCandidateValidation.interface.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager,
} from "../../../helpers/humanTalent/candidateSubmission/personnelCandidateManager.helper.js";

// Completa la Fase 5 - Evaluación de Competencias.
// Registra las pruebas psicotécnicas, las competencias evaluadas
// y el concepto general en una sola transacción.
export const completePersonnelCandidateCompetencyEvaluationService = async (
    data: CompletePersonnelCandidateCompetencyEvaluationData,
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
                                positionCompetencyDescriptions: {
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

                        personnelCandidateTechnicalEvaluation: {
                            select: {
                                status: true,
                                isSuitable: true,
                            },
                        },

                        competencyEvaluation: {
                            select: {
                                id: true,
                            },
                        },

                        _count: {
                            select: {
                                psychotechnicalTests: true,
                                competencyValidations: true,
                            },
                        },
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe, no ha sido preseleccionado o no está disponible para Evaluación de Competencias"
        );
    }

    if (!candidate.validation) {
        throw new Error(
            "El candidato todavía no tiene una validación iniciada"
        );
    }

    if (candidate.validation.completedStep < 4) {
        throw new Error(
            "Debe completar primero la Evaluación Técnica"
        );
    }

    if (
        candidate.validation.completedStep > 4 ||
        candidate.validation.competencyEvaluation
    ) {
        throw new Error(
            "La Evaluación de Competencias ya fue completada"
        );
    }

    const technicalEvaluation =
        candidate.validation
            .personnelCandidateTechnicalEvaluation;

    if (!technicalEvaluation) {
        throw new Error(
            "El candidato todavía no tiene una Evaluación Técnica"
        );
    }

    if (technicalEvaluation.status !== "APROBADA") {
        throw new Error(
            "La Evaluación Técnica todavía no ha sido confirmada"
        );
    }

    if (technicalEvaluation.isSuitable !== true) {
        throw new Error(
            "El postulante no fue aprobado en la Evaluación Técnica y no puede continuar a la Evaluación de Competencias"
        );
    }

    // Evita conflictos con registros guardados por el flujo anterior.
    if (
        candidate.validation._count.psychotechnicalTests > 0 ||
        candidate.validation._count.competencyValidations > 0
    ) {
        throw new Error(
            "El candidato tiene registros previos de la Evaluación de Competencias sin finalizar"
        );
    }

    // Valida pruebas repetidas sin distinguir mayúsculas y minúsculas.
    const receivedTestNames = new Set<string>();

    for (const test of data.psychotechnicalTests) {
        const normalizedName =
            test.appliedTest.toLowerCase();

        if (receivedTestNames.has(normalizedName)) {
            throw new Error(
                `La prueba psicotécnica "${test.appliedTest}" está repetida en el formulario`
            );
        }

        receivedTestNames.add(normalizedName);
    }

    // Valida las competencias contra la revisión del cargo de la requisición.
    const requiredCompetencyIds =
        candidate.requisition.positionRevision
            .positionCompetencyDescriptions
            .map((competency) => competency.id);

    if (requiredCompetencyIds.length === 0) {
        throw new Error(
            "La revisión del cargo no tiene competencias configuradas"
        );
    }

    const submittedCompetencyIds =
        data.competencyValidations.map(
            (competency) =>
                competency.competencyDescriptionId
        );

    if (
        new Set(submittedCompetencyIds).size !==
        submittedCompetencyIds.length
    ) {
        throw new Error(
            "No se puede evaluar una misma competencia más de una vez"
        );
    }

    const requiredCompetencyIdSet =
        new Set(requiredCompetencyIds);

    const hasInvalidCompetency =
        submittedCompetencyIds.some(
            (competencyId) =>
                !requiredCompetencyIdSet.has(competencyId)
        );

    if (hasInvalidCompetency) {
        throw new Error(
            "Una o más competencias no pertenecen a la revisión del cargo de esta requisición"
        );
    }

    if (
        submittedCompetencyIds.length !==
        requiredCompetencyIds.length
    ) {
        throw new Error(
            "Debe evaluar todas las competencias del perfil de cargo"
        );
    }

    const candidateValidationId =
        candidate.validation.id;

    const validatedAt = new Date();

    const result = await prisma.$transaction(
        async (tx) => {
            await tx.personnelCandidatePsychotechnicalTest.createMany({
                data: data.psychotechnicalTests.map((test) => ({
                    candidateValidationId,
                    appliedTest: test.appliedTest,
                    appliedAt: validatedAt,
                    evaluationAspects:
                        test.evaluationAspects,
                    resultDescription:
                        test.resultDescription,
                    createdById:
                        authenticatedUser.id,
                })),
            });

            await tx.personnelCandidateCompetencyValidation.createMany({
                data: data.competencyValidations.map(
                    (competency) => ({
                        candidateValidationId,
                        competencyDescriptionId:
                            competency.competencyDescriptionId,
                        result: competency.result,
                    })
                ),
            });

            const competencyEvaluation =
                await tx.personnelCandidateCompetencyEvaluation.create({
                    data: {
                        candidateValidationId,
                        generalConcept:
                            data.generalConcept,
                        isSuitable: data.isSuitable,
                        validatedAt,
                        performedById:
                            authenticatedUser.id,
                    },

                    select: {
                        id: true,
                        candidateValidationId: true,
                        generalConcept: true,
                        isSuitable: true,
                        validatedAt: true,
                        performedById: true,
                        createdAt: true,
                        updatedAt: true,

                        performedBy: {
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
                        id: candidateValidationId,
                    },

                    data: {
                        completedStep: 5,
                    },

                    select: {
                        id: true,
                        completedStep: true,
                    },
                });

            return {
                competencyEvaluation,
                validation,
            };
        }
    );

    return result;
};