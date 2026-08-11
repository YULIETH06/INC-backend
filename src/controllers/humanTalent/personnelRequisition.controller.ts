import type { Response } from "express";
import {
    ApprovalDecision,
    ContractType,
    DirectContractType,
    InternContractType,
    RequisitionReason,
} from "@prisma/client";
import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import {
    createPersonnelRequisitionService,
    decidePersonnelRequisitionService,
    getPersonnelRequisitionsService,
    getPersonnelRequisitionByIdService,
} from "../../services/humanTalent/personnelRequisition.service.js";

// Crea una nueva requisición de personal.
export const createPersonnelRequisition = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const {
            departmentId,
            positionId,
            positionRevisionId,
            reason,
            otherReason,
            cityId,
            contractType,
            directContractType,
            contractDurationMonths,
            internContractType,
            proposedSalary,
        } = req.body;

        const allowedReasons: RequisitionReason[] = [
            "CARGO_NUEVO",
            "REEMPLAZO_RETIRO",
            "INCREMENTO_PRODUCCION",
            "SOLICITUD_PRACTICANTES",
            "OTROS",
        ];

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

        if (
            !departmentId ||
            !positionId ||
            !positionRevisionId ||
            !reason ||
            !cityId ||
            !contractType ||
            !proposedSalary
        ) {
            return res.status(400).json({
                message: "Todos los campos obligatorios deben ser enviados",
            });
        }

        if (!allowedReasons.includes(reason)) {
            return res.status(400).json({
                message: "Motivo de requisición no válido",
                allowedReasons,
            });
        }

        if (!otherReason?.trim()) {
            return res.status(400).json({
                message: "La descripción del motivo es obligatoria",
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

        if (Number.isNaN(Number(departmentId))) {
            return res.status(400).json({
                message: "El área solicitante no es válida",
            });
        }

        if (Number.isNaN(Number(positionId))) {
            return res.status(400).json({
                message: "El cargo requerido no es válido",
            });
        }

        if (
            !Number.isInteger(Number(positionRevisionId)) ||
            Number(positionRevisionId) <= 0
        ) {
            return res.status(400).json({
                message: "La revisión del perfil de cargo no es válida",
            });
        }

        if (Number.isNaN(Number(cityId))) {
            return res.status(400).json({
                message: "La ciudad no es válida",
            });
        }

        if (
            Number.isNaN(Number(proposedSalary)) ||
            Number(proposedSalary) <= 0
        ) {
            return res.status(400).json({
                message: "El salario propuesto debe ser mayor a cero",
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

        const requisition = await createPersonnelRequisitionService({
            departmentId: Number(departmentId),
            positionId: Number(positionId),
            positionRevisionId: Number(positionRevisionId),
            reason,
            otherReason,
            cityId: Number(cityId),
            contractType,
            directContractType: directContractType || null,
            contractDurationMonths: contractDurationMonths
                ? Number(contractDurationMonths)
                : null,
            internContractType: internContractType || null,
            proposedSalary: Number(proposedSalary),
            createdById: req.user.id,
        });

        return res.status(201).json({
            message: "Requisición de personal creada correctamente",
            requisition,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al crear la requisición de personal",
        });
    }
};

// Obtiene el listado de requisiciones de personal según el rol del usuario autenticado.
export const getPersonnelRequisitions = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const requisitions = await getPersonnelRequisitionsService(req.user);

        return res.json({
            message: "Requisiciones de personal obtenidas correctamente",
            requisitions,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al obtener las requisiciones de personal",
        });
    }
};

// Obtiene el detalle completo de una requisición de personal.
export const getPersonnelRequisitionByIdController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const requisitionId = Number(req.params.id);

        if (!requisitionId || Number.isNaN(requisitionId)) {
            return res.status(400).json({
                message: "El id de la requisición no es válido",
            });
        }

        const requisition = await getPersonnelRequisitionByIdService(
            requisitionId,
            req.user
        );

        return res.status(200).json({
            requisition,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Error al obtener el detalle de la requisición";

        return res.status(400).json({
            message,
        });
    }
};

// Aprueba, rechaza o cancela una requisición de personal.
export const decidePersonnelRequisition = async (
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
                message: "La requisición no es válida",
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

        const approval = await decidePersonnelRequisitionService(
            {
                requisitionId: Number(id),
                decision,
                comment,
                decidedById: req.user.id,
            },
            req.user
        );

        return res.json({
            message: "Decisión registrada correctamente",
            approval,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al registrar la decisión de la requisición",
        });
    }
};