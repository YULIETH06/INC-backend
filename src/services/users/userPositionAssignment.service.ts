import prisma from "../../config/client.js";

import {
    isResponsiblePosition,
    sendTransferredApprovalNotifications,
    syncPendingApprovalsForPosition,
} from "../../helpers/users/positionAssignmentTransfer.helper.js";

import type {
    TransferredApprovalNotification,
} from "../../helpers/users/positionAssignmentTransfer.helper.js";

// Mensajes de error usados por el servicio y el controlador.
export const USER_POSITION_ASSIGNMENT_ERRORS = {
    USER_NOT_FOUND: "El usuario no existe",
    POSITION_NOT_FOUND: "El cargo no existe",
    POSITION_INACTIVE: "El cargo seleccionado no está activo",
    SAME_POSITION: "El usuario ya tiene asignado este cargo",
    NO_ACTIVE_ASSIGNMENT: "El usuario no tiene un cargo activo para retirar",
} as const;

// Error de regla del negocio con un mensaje que depende de los datos,
// por ejemplo el nombre del cargo o del usuario que ya lo ocupa.
export class UserPositionAssignmentRuleError extends Error {}

// Información del cargo que se devuelve en cada asignación.
const assignmentSelect = {
    id: true,
    startDate: true,
    endDate: true,
    isActive: true,
    position: {
        select: {
            id: true,
            code: true,
            name: true,
            homeDepartment: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

// Condición de una asignación vigente.
const activeAssignmentWhere = {
    isActive: true,
    endDate: null,
} as const;

// Obtiene los cargos activos que se pueden asignar a un usuario.
export const getAssignablePositionsService = async () => {
    const positions = await prisma.positionProfile.findMany({
        where: {
            isActive: true,
        },
        select: {
            id: true,
            code: true,
            name: true,
            homeDepartment: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    return positions;
};

// Obtiene el cargo actual y el historial de cargos de un usuario.
export const getUserPositionAssignmentsService = async (
    userId: number
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            positionAssignments: {
                select: assignmentSelect,
                orderBy: {
                    startDate: "desc",
                },
            },
        },
    });

    if (!user) {
        throw new Error(
            USER_POSITION_ASSIGNMENT_ERRORS.USER_NOT_FOUND
        );
    }

    const currentAssignment =
        user.positionAssignments.find(
            (assignment) =>
                assignment.isActive &&
                assignment.endDate === null
        ) ?? null;

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        currentAssignment,
        history: user.positionAssignments,
    };
};

// Asigna un cargo al usuario.
// Si el usuario ya tenía un cargo activo, se cierra y queda en el historial.
export const assignUserPositionService = async (
    userId: number,
    positionId: number
) => {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.USER_NOT_FOUND
            );
        }

        const position = await tx.positionProfile.findUnique({
            where: {
                id: positionId,
            },
            select: {
                id: true,
                code: true,
                name: true,
                isActive: true,
            },
        });

        if (!position) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.POSITION_NOT_FOUND
            );
        }

        if (!position.isActive) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.POSITION_INACTIVE
            );
        }

        const currentAssignment =
            await tx.userPositionAssignment.findFirst({
                where: {
                    userId,
                    ...activeAssignmentWhere,
                },
                select: {
                    positionId: true,
                },
                orderBy: {
                    startDate: "desc",
                },
            });

        if (currentAssignment?.positionId === positionId) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.SAME_POSITION
            );
        }

        // Los cargos responsables de procesos solo pueden tener un usuario activo.
        if (await isResponsiblePosition(tx, position)) {
            const otherOccupant =
                await tx.userPositionAssignment.findFirst({
                    where: {
                        positionId,
                        userId: {
                            not: userId,
                        },
                        ...activeAssignmentWhere,
                    },
                    select: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

            if (otherOccupant) {
                throw new UserPositionAssignmentRuleError(
                    `El cargo ${position.name} es responsable de procesos y ya está asignado a ${otherOccupant.user.name}. Retírale el cargo antes de asignarlo a otra persona.`
                );
            }
        }

        const now = new Date();

        // Cargos activos que el usuario deja, para trasladar sus aprobaciones pendientes.
        const previousAssignments =
            await tx.userPositionAssignment.findMany({
                where: {
                    userId,
                    ...activeAssignmentWhere,
                },
                select: {
                    positionId: true,
                },
            });

        // Cierra cualquier cargo activo anterior del usuario.
        await tx.userPositionAssignment.updateMany({
            where: {
                userId,
                ...activeAssignmentWhere,
            },
            data: {
                isActive: false,
                endDate: now,
            },
        });

        // Crea la nueva asignación.
        const newAssignment =
            await tx.userPositionAssignment.create({
                data: {
                    userId,
                    positionId,
                    startDate: now,
                    isActive: true,
                },
                select: assignmentSelect,
            });

        // Traslada las aprobaciones pendientes del cargo anterior
        // a quien lo ocupe ahora (o las deja sin responsable si quedó vacío),
        // y las del cargo nuevo al usuario que lo recibe.
        const notifications: TransferredApprovalNotification[] = [];

        const previousPositionIds = [
            ...new Set(
                previousAssignments.map(
                    (assignment) => assignment.positionId
                )
            ),
        ];

        for (const previousPositionId of previousPositionIds) {
            notifications.push(
                ...(await syncPendingApprovalsForPosition(
                    tx,
                    previousPositionId
                ))
            );
        }

        notifications.push(
            ...(await syncPendingApprovalsForPosition(
                tx,
                positionId
            ))
        );

        return {
            newAssignment,
            notifications,
        };
    });

    await sendTransferredApprovalNotifications(
        result.notifications
    );

    return result.newAssignment;
};

// Retira el cargo activo del usuario sin asignarle uno nuevo.
export const endUserPositionAssignmentService = async (
    userId: number
) => {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.USER_NOT_FOUND
            );
        }

        const activeAssignments =
            await tx.userPositionAssignment.findMany({
                where: {
                    userId,
                    ...activeAssignmentWhere,
                },
                select: {
                    id: true,
                    positionId: true,
                },
            });

        if (activeAssignments.length === 0) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.NO_ACTIVE_ASSIGNMENT
            );
        }

        await tx.userPositionAssignment.updateMany({
            where: {
                id: {
                    in: activeAssignments.map(
                        (assignment) => assignment.id
                    ),
                },
            },
            data: {
                isActive: false,
                endDate: new Date(),
            },
        });

        // Las aprobaciones pendientes de los cargos retirados quedan sin responsable
        // hasta que alguien reciba el cargo.
        const notifications: TransferredApprovalNotification[] = [];

        for (const assignment of activeAssignments) {
            notifications.push(
                ...(await syncPendingApprovalsForPosition(
                    tx,
                    assignment.positionId
                ))
            );
        }

        return {
            endedAssignments: activeAssignments.length,
            notifications,
        };
    });

    await sendTransferredApprovalNotifications(
        result.notifications
    );

    return {
        endedAssignments: result.endedAssignments,
    };
};
