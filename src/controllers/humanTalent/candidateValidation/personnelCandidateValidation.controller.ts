import type { Response } from "express";
import {
    CandidateApplicationConcept,
    CandidatePositionType,
} from "@prisma/client";

import type { AuthRequest } from "../../../interfaces/auth/auth.interface.js";

import {
    approvePersonnelCandidateTechnicalEvaluationService,
    completePersonnelCandidateValidationService,
    createPersonnelCandidateValidationService,
    getPersonnelCandidateValidationDetailService,
    getPersonnelCandidateValidationsService,
    savePersonnelCandidateTechnicalEvaluationService,
    updatePersonnelCandidatePositionValidationService,
} from "../../../services/humanTalent/candidateValidation/index.js";

// Inicia la validación de cargo y postulante.
export const createPersonnelCandidateValidation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { candidateId } = req.params;
        const { applicationConcept } = req.body;

        const allowedApplicationConcepts: CandidateApplicationConcept[] = [
            "INGRESO",
            "MODIFICACION_CARGO",
        ];

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (
            Number.isNaN(Number(candidateId)) ||
            Number(candidateId) <= 0
        ) {
            return res.status(400).json({
                message: "El candidato no es válido",
            });
        }

        if (!applicationConcept) {
            return res.status(400).json({
                message: "El concepto de aplicación es obligatorio",
            });
        }

        if (
            !allowedApplicationConcepts.includes(
                applicationConcept
            )
        ) {
            return res.status(400).json({
                message: "Concepto de aplicación no válido",
                allowedApplicationConcepts,
            });
        }

        const validation =
            await createPersonnelCandidateValidationService(
                {
                    candidateId: Number(candidateId),
                    applicationConcept,
                },
                req.user
            );

        return res.status(201).json({
            message: "Validación de candidato iniciada correctamente",
            validation,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al iniciar la validación del candidato",
        });
    }
};

// Guarda la Fase 2 de validación de cargo.
export const updatePersonnelCandidatePositionValidation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { candidateId } = req.params;
        const {
            positionType,
            changeControlCode,
        } = req.body;

        const allowedPositionTypes: CandidatePositionType[] = [
            "NUEVO_CARGO",
            "CARGO_EXISTENTE",
        ];

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (
            Number.isNaN(Number(candidateId)) ||
            Number(candidateId) <= 0
        ) {
            return res.status(400).json({
                message: "El candidato no es válido",
            });
        }

        if (!positionType) {
            return res.status(400).json({
                message: "El tipo de cargo es obligatorio",
            });
        }

        if (!allowedPositionTypes.includes(positionType)) {
            return res.status(400).json({
                message: "Tipo de cargo no válido",
                allowedPositionTypes,
            });
        }

        const normalizedChangeControlCode =
            typeof changeControlCode === "string"
                ? changeControlCode.trim()
                : "";

        if (
            positionType === "NUEVO_CARGO" &&
            !normalizedChangeControlCode
        ) {
            return res.status(400).json({
                message:
                    "El código de control de cambio es obligatorio para un nuevo cargo",
            });
        }

        if (normalizedChangeControlCode.length > 100) {
            return res.status(400).json({
                message:
                    "El código de control de cambio no puede superar los 100 caracteres",
            });
        }

        const validation =
            await updatePersonnelCandidatePositionValidationService(
                {
                    candidateId: Number(candidateId),
                    positionType,
                    changeControlCode:
                        normalizedChangeControlCode || null,
                },
                req.user
            );

        return res.status(200).json({
            message:
                "Validación de cargo guardada correctamente",
            validation,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al guardar la validación de cargo",
        });
    }
};

// Completa la Fase 3 de validación del postulante.
export const completePersonnelCandidateValidation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { candidateId } = req.params;
        const {
            isSuitable,
            requirementValidations,
        } = req.body;

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (
            Number.isNaN(Number(candidateId)) ||
            Number(candidateId) <= 0
        ) {
            return res.status(400).json({
                message: "El candidato no es válido",
            });
        }

        if (typeof isSuitable !== "boolean") {
            return res.status(400).json({
                message: "Debe indicar si el postulante es apto o no",
            });
        }

        if (
            !Array.isArray(requirementValidations) ||
            requirementValidations.length === 0
        ) {
            return res.status(400).json({
                message: "Debe enviar la validación de los requisitos",
            });
        }

        for (const requirement of requirementValidations) {
            if (
                !Number.isInteger(
                    Number(requirement.requirementDescriptionId)
                ) ||
                Number(requirement.requirementDescriptionId) <= 0
            ) {
                return res.status(400).json({
                    message:
                        "La descripción del requisito no es válida",
                });
            }

            if (typeof requirement.complies !== "boolean") {
                return res.status(400).json({
                    message:
                        "Debe indicar si el postulante cumple cada requisito",
                });
            }

            if (
                requirement.evidence != null &&
                typeof requirement.evidence !== "string"
            ) {
                return res.status(400).json({
                    message: "La evidencia no es válida",
                });
            }

            if (
                requirement.gapClosure != null &&
                typeof requirement.gapClosure !== "string"
            ) {
                return res.status(400).json({
                    message: "El cierre de brecha no es válido",
                });
            }
        }

        const validation =
            await completePersonnelCandidateValidationService(
                {
                    candidateId: Number(candidateId),
                    isSuitable,
                    requirementValidations:
                        requirementValidations.map(
                            (requirement) => ({
                                requirementDescriptionId:
                                    Number(
                                        requirement.requirementDescriptionId
                                    ),
                                complies: requirement.complies,
                                evidence:
                                    requirement.evidence ?? null,
                                gapClosure:
                                    requirement.gapClosure ?? null,
                            })
                        ),
                },
                req.user
            );

        return res.status(200).json({
            message:
                "Validación del postulante completada correctamente",
            validation,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al completar la validación del postulante",
        });
    }
};

// Guarda las calificaciones de la Fase 4 - Evaluación Técnica.
export const savePersonnelCandidateTechnicalEvaluation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { candidateId } = req.params;
        const {
            interviewScore,
            examScore,
        } = req.body;

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (
            Number.isNaN(Number(candidateId)) ||
            Number(candidateId) <= 0
        ) {
            return res.status(400).json({
                message: "El candidato no es válido",
            });
        }

        const hasInterviewScore =
            interviewScore !== undefined &&
            interviewScore !== null;

        const hasExamScore =
            examScore !== undefined &&
            examScore !== null;

        if (
            !hasInterviewScore &&
            !hasExamScore
        ) {
            return res.status(400).json({
                message:
                    "Debe diligenciar por lo menos una calificación",
            });
        }

        if (
            hasInterviewScore &&
            (
                typeof interviewScore !== "number" ||
                !Number.isFinite(interviewScore) ||
                interviewScore < 0 ||
                interviewScore > 5
            )
        ) {
            return res.status(400).json({
                message:
                    "La calificación de la entrevista debe estar entre 0.0 y 5.0",
            });
        }

        if (
            hasInterviewScore &&
            Number(interviewScore.toFixed(1)) !==
            interviewScore
        ) {
            return res.status(400).json({
                message:
                    "La calificación de la entrevista solo puede tener un decimal",
            });
        }

        if (
            hasExamScore &&
            (
                typeof examScore !== "number" ||
                !Number.isFinite(examScore) ||
                examScore < 0 ||
                examScore > 5
            )
        ) {
            return res.status(400).json({
                message:
                    "La calificación del examen debe estar entre 0.0 y 5.0",
            });
        }

        if (
            hasExamScore &&
            Number(examScore.toFixed(1)) !==
            examScore
        ) {
            return res.status(400).json({
                message:
                    "La calificación del examen solo puede tener un decimal",
            });
        }

        const evaluation =
            await savePersonnelCandidateTechnicalEvaluationService(
                {
                    candidateId:
                        Number(candidateId),

                    interviewScore:
                        hasInterviewScore
                            ? interviewScore
                            : undefined,

                    examScore:
                        hasExamScore
                            ? examScore
                            : undefined,
                },
                req.user
            );

        return res.status(200).json({
            message:
                evaluation.status ===
                    "PENDIENTE_APROBACION"
                    ? "Evaluación Técnica enviada para aprobación correctamente"
                    : "Calificación de la Evaluación Técnica guardada correctamente",
            evaluation,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al guardar la Evaluación Técnica",
        });
    }
};

// Confirma la Fase 4 - Evaluación Técnica.
export const approvePersonnelCandidateTechnicalEvaluation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { candidateId } = req.params;
        const { isSuitable } = req.body;

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (
            Number.isNaN(Number(candidateId)) ||
            Number(candidateId) <= 0
        ) {
            return res.status(400).json({
                message: "El candidato no es válido",
            });
        }

        if (typeof isSuitable !== "boolean") {
            return res.status(400).json({
                message:
                    "Debe indicar si el postulante es apto para continuar el proceso",
            });
        }

        const result =
            await approvePersonnelCandidateTechnicalEvaluationService(
                {
                    candidateId:
                        Number(candidateId),
                    isSuitable,
                },
                req.user
            );

        return res.status(200).json({
            message:
                isSuitable
                    ? "Evaluación Técnica aprobada. El postulante puede continuar el proceso."
                    : "Evaluación Técnica finalizada. El postulante no continuará el proceso.",
            ...result,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al validar la Evaluación Técnica",
        });
    }
};

// Obtiene los candidatos disponibles para validación.
export const getPersonnelCandidateValidations = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const result =
            await getPersonnelCandidateValidationsService(
                req.user
            );

        return res.status(200).json({
            message:
                "Candidatos para validación obtenidos correctamente",
            ...result,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al obtener los candidatos para validación",
        });
    }
};

// Obtiene el detalle de la validación de un candidato.
export const getPersonnelCandidateValidationDetail = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { candidateId } = req.params;

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (
            Number.isNaN(Number(candidateId)) ||
            Number(candidateId) <= 0
        ) {
            return res.status(400).json({
                message: "El candidato no es válido",
            });
        }

        const result =
            await getPersonnelCandidateValidationDetailService(
                Number(candidateId),
                req.user
            );

        return res.status(200).json({
            message:
                "Detalle de la validación obtenido correctamente",
            ...result,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al obtener el detalle de la validación",
        });
    }
};