import type { Prisma } from "@prisma/client";

import {
    departmentApprovalSelect,
    type ActivePositionAssignment,
    type DepartmentApprovalData,
    type PrismaExecutor,
    type RequisitionApprovalFlowStep,
} from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

// Busca el usuario activo que tiene asignado un cargo.
// Devuelve null cuando el cargo está vacío: el paso queda sin responsable
// y se asigna automáticamente cuando alguien recibe el cargo.
const findActiveAssignmentByPosition = async (
    prismaExecutor: PrismaExecutor,
    positionId: number
): Promise<ActivePositionAssignment | null> => {
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

    return assignment;
};

// Construye los pasos de aprobación según la jerarquía del departamento.
export const buildRequisitionApprovalFlow = async (
    prismaExecutor: PrismaExecutor,
    departmentId: number
): Promise<RequisitionApprovalFlowStep[]> => {
    const steps: RequisitionApprovalFlowStep[] = [];

    let currentDepartmentId: number | null = departmentId;
    let approvalOrder = 1;

    while (currentDepartmentId !== null) {
        const department: DepartmentApprovalData | null =
            await prismaExecutor.department.findUnique({
                where: {
                    id: currentDepartmentId,
                },
                select: departmentApprovalSelect,
            });

        if (!department) {
            throw new Error("No se encontró el departamento de la requisición.");
        }

        if (!department.responsiblePositionId) {
            throw new Error(
                `El departamento ${department.name} no tiene un cargo responsable configurado.`
            );
        }

        const assignment = await findActiveAssignmentByPosition(
            prismaExecutor,
            department.responsiblePositionId
        );

        steps.push({
            approvalOrder,
            departmentId: department.id,
            approverPositionId: department.responsiblePositionId,
            approverAssignmentId: assignment?.id ?? null,
            approverUserId: assignment?.userId ?? null,
        });

        currentDepartmentId = department.parentDepartmentId;
        approvalOrder++;
    }

    if (steps.length === 0) {
        throw new Error(
            "No se pudo generar el flujo de aprobación de la requisición."
        );
    }

    return steps;
};

// Convierte los pasos calculados al formato que Prisma necesita para crear aprobaciones.
export const buildRequisitionApprovalCreateManyData = (
    requisitionId: number,
    steps: RequisitionApprovalFlowStep[]
): Prisma.PersonnelRequisitionApprovalCreateManyInput[] => {
    return steps.map((step, index) => ({
        requisitionId,
        approvalOrder: step.approvalOrder,
        departmentId: step.departmentId,
        approverPositionId: step.approverPositionId,
        approverAssignmentId: step.approverAssignmentId,
        approverUserId: step.approverUserId,
        isCurrent: index === 0,
    }));
};

// Obtiene los pasos que deben participar según el nivel del usuario creador.
export const getApprovalStepsFromCreatorLevel = (
    steps: RequisitionApprovalFlowStep[],
    createdById: number
): RequisitionApprovalFlowStep[] => {
    const creatorStepIndex = steps.findIndex((step) => {
        return step.approverUserId === createdById;
    });

    if (creatorStepIndex === -1) {
        return steps;
    }

    return steps.slice(creatorStepIndex);
};