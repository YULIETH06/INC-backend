import prisma from "../../../config/client.js";

import type {
    CreatePersonnelCandidatePsychotechnicalTestsData,
} from "../../../interfaces/humanTalent/candidateValidation/personnelCandidateValidation.interface.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager,
} from "../../../helpers/humanTalent/candidateSubmission/personnelCandidateManager.helper.js";


// Registra múltiples pruebas psicotécnicas de la Fase 5.
export const createPersonnelCandidatePsychotechnicalTestsService = async (
    data: CreatePersonnelCandidatePsychotechnicalTestsData,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    await validatePersonnelCandidateManager(
        prisma,
        authenticatedUser.id
    );

    if (
        !Array.isArray(data.psychotechnicalTests) ||
        data.psychotechnicalTests.length === 0
    ) {
        throw new Error(
            "Debe registrar por lo menos una prueba psicotécnica"
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

                        psychotechnicalTests: {
                            select: {
                                id: true,
                                appliedTest: true,
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

    if (candidate.validation.completedStep > 4) {
        throw new Error(
            "La Evaluación de Competencias ya fue completada"
        );
    }

    const technicalEvaluation =
        candidate.validation.personnelCandidateTechnicalEvaluation;

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

    if (candidate.validation.competencyEvaluation) {
        throw new Error(
            "La Evaluación de Competencias ya fue finalizada"
        );
    }

    // Normaliza y valida todas las pruebas recibidas.
    const normalizedTests =
        data.psychotechnicalTests.map(
            (test, index) => {
                const appliedTest =
                    typeof test.appliedTest === "string"
                        ? test.appliedTest.trim()
                        : "";

                const evaluationAspects =
                    typeof test.evaluationAspects === "string"
                        ? test.evaluationAspects.trim()
                        : "";

                const resultDescription =
                    typeof test.resultDescription === "string"
                        ? test.resultDescription.trim()
                        : "";

                if (!appliedTest) {
                    throw new Error(
                        `La prueba aplicada es obligatoria en el registro ${index + 1}`
                    );
                }

                if (!evaluationAspects) {
                    throw new Error(
                        `Los aspectos a evaluar son obligatorios en el registro ${index + 1}`
                    );
                }

                if (!resultDescription) {
                    throw new Error(
                        `La descripción de resultados es obligatoria en el registro ${index + 1}`
                    );
                }

                return {
                    appliedTest,
                    evaluationAspects,
                    resultDescription,
                };
            }
        );

    // Valida pruebas repetidas dentro del mismo envío.
    const receivedTestNames = new Set<string>();

    for (const test of normalizedTests) {
        const normalizedName =
            test.appliedTest
                .trim()
                .toLowerCase();

        if (
            receivedTestNames.has(
                normalizedName
            )
        ) {
            throw new Error(
                `La prueba psicotécnica "${test.appliedTest}" está repetida en el formulario`
            );
        }

        receivedTestNames.add(
            normalizedName
        );
    }

    // Valida pruebas que ya estén registradas en la base de datos.
    const existingTestNames =
        new Set(
            candidate.validation.psychotechnicalTests.map(
                (test) =>
                    test.appliedTest
                        .trim()
                        .toLowerCase()
            )
        );

    for (const test of normalizedTests) {
        const normalizedName =
            test.appliedTest
                .trim()
                .toLowerCase();

        if (
            existingTestNames.has(
                normalizedName
            )
        ) {
            throw new Error(
                `La prueba psicotécnica "${test.appliedTest}" ya fue registrada para este candidato`
            );
        }
    }

    const appliedAt = new Date();

    // Guarda todas las pruebas en una única transacción.
    const psychotechnicalTests =
        await prisma.$transaction(
            normalizedTests.map(
                (test) =>
                    prisma.personnelCandidatePsychotechnicalTest.create({
                        data: {
                            candidateValidationId:
                                candidate.validation!.id,

                            appliedTest:
                                test.appliedTest,

                            appliedAt,

                            evaluationAspects:
                                test.evaluationAspects,

                            resultDescription:
                                test.resultDescription,

                            createdById:
                                authenticatedUser.id,
                        },

                        select: {
                            id: true,
                            candidateValidationId: true,
                            appliedTest: true,
                            appliedAt: true,
                            evaluationAspects: true,
                            resultDescription: true,
                            createdById: true,
                            createdAt: true,
                            updatedAt: true,

                            createdBy: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    })
            )
        );

    return psychotechnicalTests;
};