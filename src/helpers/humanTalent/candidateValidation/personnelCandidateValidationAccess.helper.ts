import type { Role } from "@prisma/client";

import type {
    PrismaExecutor,
} from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

import {
    ALLOWED_REQUISITION_CREATOR_POSITION_CODES,
} from "../../../constants/humanTalent/personnelRequisition.constants.js";

// Valida el acceso al módulo de validación de candidatos.
export const validatePersonnelCandidateValidationAccess = async (
    prismaExecutor: PrismaExecutor,
    userId: number,
    role: Role
) => {
    // El administrador puede consultar todas las validaciones,
    // pero no puede gestionar las fases operativas.
    if (role === "ADMIN") {
        return {
            canManageValidation: false,
            canViewAllValidations: true,
        };
    }

    // Configuración activa del flujo de Talento Humano.
    const workflowConfig =
        await prismaExecutor.humanTalentWorkflowConfig.findFirst({
            where: {
                isActive: true,
            },
            select: {
                analystPositionId: true,
                chiefPositionId: true,
            },
        });

    if (!workflowConfig) {
        throw new Error(
            "No existe una configuración activa del flujo de Talento Humano"
        );
    }

    // Verifica si el usuario pertenece al flujo de Talento Humano.
    const workflowAssignment =
        await prismaExecutor.userPositionAssignment.findFirst({
            where: {
                userId,
                isActive: true,
                endDate: null,
                positionId: {
                    in: [
                        workflowConfig.analystPositionId,
                        workflowConfig.chiefPositionId,
                    ],
                },
            },
            select: {
                positionId: true,
            },
        });

    const isAnalyst =
        workflowAssignment?.positionId ===
        workflowConfig.analystPositionId;

    const isChief =
        workflowAssignment?.positionId ===
        workflowConfig.chiefPositionId;

    // Auxiliar de Talento Humano:
    // consulta todas las validaciones y puede gestionarlas.
    if (isAnalyst) {
        return {
            canManageValidation: true,
            canViewAllValidations: true,
        };
    }

    // Jefe de Talento Humano:
    // consulta todas las validaciones, pero no las gestiona.
    if (isChief) {
        return {
            canManageValidation: false,
            canViewAllValidations: true,
        };
    }

    // Verifica si tiene un cargo autorizado para crear requisiciones.
    const creatorAssignment =
        await prismaExecutor.userPositionAssignment.findFirst({
            where: {
                userId,
                isActive: true,
                endDate: null,
                position: {
                    isActive: true,
                    code: {
                        in: [
                            ...ALLOWED_REQUISITION_CREATOR_POSITION_CODES,
                        ],
                    },
                },
            },
            select: {
                id: true,
            },
        });

    if (!creatorAssignment) {
        throw new Error(
            "No tienes permisos para consultar las validaciones de candidatos"
        );
    }

    // Creador de requisiciones:
    // solo puede consultar candidatos de sus propias requisiciones.
    return {
        canManageValidation: false,
        canViewAllValidations: false,
    };
};