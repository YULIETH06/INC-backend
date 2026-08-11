import type { Prisma } from "@prisma/client";

import type { PrismaExecutor } from "../../interfaces/humanTalent/personnelRequisition.interface.js";

import type {
    HiringConfirmationApprovalFlowStep,
    HumanTalentActiveAssignment,
} from "../../interfaces/humanTalent/personnelHiringConfirmation.interface.js";

// Busca el usuario activo que tiene asignado un cargo dentro del flujo de Talento Humano.
const findActiveHumanTalentAssignment = async (
    prismaExecutor: PrismaExecutor,
    positionId: number
): Promise<HumanTalentActiveAssignment> => {
    const assignment = await prismaExecutor.userPositionAssignment.findFirst({
        where: {
            positionId,
            isActive: true,
            endDate: null,
        },
        select: {
            id: true,
            userId: true,
        },
        orderBy: {
            startDate: "desc",
        },
    });

    if (!assignment) {
        throw new Error(
            "No existe un usuario activo asignado a uno de los cargos del flujo de Talento Humano."
        );
    }

    return assignment;
};

// Construye el flujo de aprobación de la confirmación de contratación.
export const buildHiringConfirmationApprovalFlow = async (
    prismaExecutor: PrismaExecutor,
    createdById: number
): Promise<HiringConfirmationApprovalFlowStep[]> => {
    const humanTalentConfig =
        await prismaExecutor.humanTalentWorkflowConfig.findFirst({
            where: {
                isActive: true,
            },
            select: {
                analystPositionId: true,
                chiefPositionId: true,
            },
        });

    if (!humanTalentConfig) {
        throw new Error(
            "No existe una configuración activa del flujo de Talento Humano."
        );
    }

    const analystAssignment = await findActiveHumanTalentAssignment(
        prismaExecutor,
        humanTalentConfig.analystPositionId
    );

    const chiefAssignment = await findActiveHumanTalentAssignment(
        prismaExecutor,
        humanTalentConfig.chiefPositionId
    );

    return [
        {
            approvalOrder: 1,
            approverPositionId: humanTalentConfig.analystPositionId,
            approverAssignmentId: analystAssignment.id,
            approverUserId: analystAssignment.userId,
            isAutoApproved: analystAssignment.userId === createdById,
        },
        {
            approvalOrder: 2,
            approverPositionId: humanTalentConfig.chiefPositionId,
            approverAssignmentId: chiefAssignment.id,
            approverUserId: chiefAssignment.userId,
            isAutoApproved: false,
        },
    ];
};

// Convierte los pasos calculados al formato que Prisma necesita para crear aprobaciones.
export const buildHiringConfirmationApprovalCreateManyData = (
    hiringConfirmationId: number,
    steps: HiringConfirmationApprovalFlowStep[],
    decidedById: number
): Prisma.PersonnelHiringConfirmationApprovalCreateManyInput[] => {
    const firstPendingStepIndex = steps.findIndex(
        (step) => !step.isAutoApproved
    );

    return steps.map((step, index) => {
        const isAutoApproved = step.isAutoApproved;
        const isCurrent = index === firstPendingStepIndex;

        return {
            hiringConfirmationId,
            approvalOrder: step.approvalOrder,
            approverPositionId: step.approverPositionId,
            approverAssignmentId: step.approverAssignmentId,
            approverUserId: step.approverUserId,
            decision: isAutoApproved ? "APROBADA" : null,
            decidedById: isAutoApproved ? decidedById : null,
            decidedAt: isAutoApproved ? new Date() : null,
            isCurrent,
        };
    });
};