import type { Response } from "express";
import {
    ApprovalDecision,
    ContractType,
    DirectContractType,
    InternContractType,
} from "@prisma/client";

import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";

import {
    createPersonnelHiringConfirmationService,
    decidePersonnelHiringConfirmationService,
} from "../../services/humanTalent/personnelHiringConfirmation.service.js";

// Crea la confirmación final de contratación de una requisición.
export const createPersonnelHiringConfirmation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const {
            contractType,
            directContractType,
            contractDurationMonths,
            internContractType,
            approvedSalary,
        } = req.body;

        const allowedContractTypes: ContractType[] = [
            "DIRECTO",
            "TEMPORAL",
            "PRACTICANTE",
        ];

        const allowedDirectContractTypes: DirectContractType[] = [
            "INDEFINIDO",
            "FIJO",
        ];

        const allowedInternContractTypes: InternContractType[] = [
            "APRENDIZ",
            "PASANTE",
            "ROTANTE",
        ];

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (Number.isNaN(Number(id))) {
            return res.status(400).json({
                message: "La requisición no es válida",
            });
        }

        if (!contractType || !approvedSalary) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben ser enviados",
            });
        }

        if (!allowedContractTypes.includes(contractType)) {
            return res.status(400).json({
                message: "Tipo de contratación no válido",
                allowedContractTypes,
            });
        }

        if (
            contractType === "DIRECTO" &&
            !allowedDirectContractTypes.includes(directContractType)
        ) {
            return res.status(400).json({
                message: "Tipo de contrato directo no válido",
                allowedDirectContractTypes,
            });
        }

        if (
            contractType === "PRACTICANTE" &&
            !allowedInternContractTypes.includes(internContractType)
        ) {
            return res.status(400).json({
                message: "Tipo de practicante no válido",
                allowedInternContractTypes,
            });
        }

        if (
            Number.isNaN(Number(approvedSalary)) ||
            Number(approvedSalary) <= 0
        ) {
            return res.status(400).json({
                message: "El salario aprobado debe ser mayor a cero",
            });
        }

        if (
            contractType === "DIRECTO" &&
            directContractType === "FIJO" &&
            (Number.isNaN(Number(contractDurationMonths)) ||
                Number(contractDurationMonths) <= 0)
        ) {
            return res.status(400).json({
                message: "Debe indicar la duración del contrato fijo en meses",
            });
        }

        if (
            contractType === "TEMPORAL" &&
            (Number.isNaN(Number(contractDurationMonths)) ||
                Number(contractDurationMonths) <= 0)
        ) {
            return res.status(400).json({
                message: "Debe indicar la duración del contrato temporal en meses",
            });
        }

        const hiringConfirmation =
            await createPersonnelHiringConfirmationService({
                requisitionId: Number(id),
                contractType,
                directContractType: directContractType || null,
                contractDurationMonths: contractDurationMonths
                    ? Number(contractDurationMonths)
                    : null,
                internContractType: internContractType || null,
                approvedSalary: Number(approvedSalary),
                createdById: req.user.id,
            });

        return res.status(201).json({
            message: "Confirmación de contratación registrada correctamente",
            hiringConfirmation,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al registrar la confirmación de contratación",
        });
    }
};

// Aprueba, rechaza o cancela una confirmación de contratación.
export const decidePersonnelHiringConfirmation = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { decision, comment } = req.body;

        const allowedDecisions: ApprovalDecision[] = [
            "APROBADA",
            "RECHAZADA",
            "CANCELADA",
        ];

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (Number.isNaN(Number(id))) {
            return res.status(400).json({
                message: "La confirmación de contratación no es válida",
            });
        }

        if (!decision) {
            return res.status(400).json({
                message: "La decisión es obligatoria",
            });
        }

        if (!allowedDecisions.includes(decision)) {
            return res.status(400).json({
                message: "Decisión no válida",
                allowedDecisions,
            });
        }

        if (
            (decision === "RECHAZADA" || decision === "CANCELADA") &&
            !comment?.trim()
        ) {
            return res.status(400).json({
                message: "Debe ingresar un comentario para rechazar o cancelar",
            });
        }

        const approval = await decidePersonnelHiringConfirmationService({
            hiringConfirmationId: Number(id),
            decision,
            comment,
            decidedById: req.user.id,
        });

        return res.json({
            message: "Decisión de Talento Humano registrada correctamente",
            approval,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al registrar la decisión de Talento Humano",
        });
    }
};