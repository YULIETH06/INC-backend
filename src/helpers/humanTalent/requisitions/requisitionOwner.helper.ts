import type { Prisma } from "@prisma/client";

import type { PrismaExecutor } from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

// Datos mínimos de una requisición para resolver su responsable.
export interface RequisitionOwnerData {
    ownerPositionId: number | null;
    createdById: number;
}

// Condición de una asignación de cargo vigente.
const activeAssignmentWhere = {
    isActive: true,
    endDate: null,
} as const;

// Obtiene los cargos que el usuario tiene activos hoy.
export const getActivePositionIdsByUser = async (
    prismaExecutor: PrismaExecutor,
    userId: number
): Promise<number[]> => {
    const assignments =
        await prismaExecutor.userPositionAssignment.findMany({
            where: {
                userId,
                ...activeAssignmentWhere,
            },
            select: {
                positionId: true,
            },
        });

    return assignments.map(
        (assignment) => assignment.positionId
    );
};

// Obtiene la asignación activa de un cargo, si alguien lo ocupa hoy.
export const findActiveAssignmentByPositionId = async (
    prismaExecutor: PrismaExecutor,
    positionId: number
): Promise<{ id: number; userId: number } | null> => {
    return prismaExecutor.userPositionAssignment.findFirst({
        where: {
            positionId,
            ...activeAssignmentWhere,
        },
        select: {
            id: true,
            userId: true,
        },
        orderBy: {
            startDate: "desc",
        },
    });
};

// Obtiene el usuario responsable hoy de una requisición.
// Es quien ocupa el cargo responsable. Las requisiciones antiguas sin cargo
// responsable conservan como responsable al usuario que las creó.
export const getRequisitionOwnerUserId = async (
    prismaExecutor: PrismaExecutor,
    requisition: RequisitionOwnerData
): Promise<number | null> => {
    if (!requisition.ownerPositionId) {
        return requisition.createdById;
    }

    const assignment =
        await findActiveAssignmentByPositionId(
            prismaExecutor,
            requisition.ownerPositionId
        );

    return assignment?.userId ?? null;
};

// Indica si el usuario es hoy el responsable de la requisición.
export const isRequisitionOwner = async (
    prismaExecutor: PrismaExecutor,
    userId: number,
    requisition: RequisitionOwnerData
): Promise<boolean> => {
    if (!requisition.ownerPositionId) {
        return requisition.createdById === userId;
    }

    const activePositionIds =
        await getActivePositionIdsByUser(
            prismaExecutor,
            userId
        );

    return activePositionIds.includes(
        requisition.ownerPositionId
    );
};

// Condición de Prisma para encontrar las requisiciones de las que el usuario es responsable hoy.
export const buildRequisitionOwnerWhere = (
    userId: number,
    activePositionIds: number[]
): Prisma.PersonnelRequisitionWhereInput => {
    return {
        OR: [
            {
                ownerPositionId: {
                    in: activePositionIds,
                },
            },
            {
                ownerPositionId: null,
                createdById: userId,
            },
        ],
    };
};
