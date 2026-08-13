import type { Response } from "express";
import {
    CandidateApplicationConcept,
    CandidatePositionType,
} from "@prisma/client";

import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";

import {
    completePersonnelCandidateValidationService,
    createPersonnelCandidateValidationService,
    updatePersonnelCandidatePositionValidationService,
} from "../../services/humanTalent/personnelCandidateValidation.service.js";

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