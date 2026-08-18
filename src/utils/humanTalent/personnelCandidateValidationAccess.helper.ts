import type { Role } from "@prisma/client";

import type {
    PrismaExecutor,
} from "../../interfaces/humanTalent/personnelRequisition.interface.js";

// Valida el acceso al módulo de validación de candidatos.
export const validatePersonnelCandidateValidationAccess = async (
    prismaExecutor: PrismaExecutor,
    userId: number,
    role: Role
) => {
    // Acceso administrativo.
    if (role === "ADMIN") {
        return {
            canManageValidation: false,
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

    // Asignaciones activas del usuario dentro del flujo.
    const assignments =
        await prismaExecutor.userPositionAssignment.findMany({
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

    const isAnalyst = assignments.some(
        (assignment) =>
            assignment.positionId ===
            workflowConfig.analystPositionId
    );

    const isChief = assignments.some(
        (assignment) =>
            assignment.positionId ===
            workflowConfig.chiefPositionId
    );

    // Validación de cargos autorizados.
    if (!isAnalyst && !isChief) {
        throw new Error(
            "No tienes permisos para consultar las validaciones de candidatos"
        );
    }

    return {
        canManageValidation: isAnalyst,
    };
};