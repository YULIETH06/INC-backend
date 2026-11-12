import prisma from "../../config/client.js";

import {
    endActiveAssignmentsForUser,
    isResponsiblePosition,
    sendTransferredApprovalNotifications,
    syncPendingApprovalsForPosition,
} from "../../helpers/users/positionAssignmentTransfer.helper.js";

import type {
    TransferredApprovalNotification,
} from "../../helpers/users/positionAssignmentTransfer.helper.js";

import {
    createAuditLog,
} from "../../helpers/audit/auditLog.helper.js";

import {
    AUDIT_ACTIONS,
    AUDIT_MODULES,
} from "../../constants/audit/auditLog.constants.js";

import type {
    AuditActor,
} from "../../interfaces/audit/auditLog.interface.js";

// Mensajes de error usados por el servicio y el controlador.
export const USER_POSITION_ASSIGNMENT_ERRORS = {
    USER_NOT_FOUND: "El usuario no existe",
    POSITION_NOT_FOUND: "El cargo no existe",
    POSITION_INACTIVE: "El cargo seleccionado no está activo",
    SAME_POSITION: "El usuario ya tiene asignado este cargo",
    NO_ACTIVE_ASSIGNMENT: "El usuario no tiene un cargo activo para retirar",
    USER_INACTIVE: "No se puede asignar un cargo a un usuario desactivado",
} as const;

// Error de regla del negocio con un mensaje que depende de los datos,
// por ejemplo el nombre del cargo o del usuario que ya lo ocupa.
export class UserPositionAssignmentRuleError extends Error { }

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
    positionId: number,
    auditActor: AuditActor
) => {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                isActive: true,
            },
        });

        if (!user) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.USER_NOT_FOUND
            );
        }

        // Un usuario desactivado no puede recibir cargos.
        if (!user.isActive) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.USER_INACTIVE
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
                    position: {
                        select: {
                            name: true,
                        },
                    },
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

        // Registra la asignación en la auditoría.
        const previousPositionText =
            currentAssignment
                ? ` (antes: ${currentAssignment.position.name})`
                : "";

        await createAuditLog(tx, {
            actor: auditActor,
            module: AUDIT_MODULES.USERS,
            action: AUDIT_ACTIONS.USER_POSITION_ASSIGNED,
            entityType: "User",
            entityId: userId,
            description: `Asignó a ${user.name} el cargo ${position.name}${previousPositionText}`,
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
    userId: number,
    auditActor: AuditActor
) => {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                positionAssignments: {
                    where: activeAssignmentWhere,
                    select: {
                        position: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.USER_NOT_FOUND
            );
        }

        // Retira los cargos activos y deja sin responsable sus aprobaciones
        // pendientes hasta que alguien reciba el cargo.
        const endResult =
            await endActiveAssignmentsForUser(
                tx,
                userId
            );

        if (endResult.endedAssignments === 0) {
            throw new Error(
                USER_POSITION_ASSIGNMENT_ERRORS.NO_ACTIVE_ASSIGNMENT
            );
        }

        // Registra el retiro en la auditoría.
        const positionNames =
            user.positionAssignments
                .map((assignment) => assignment.position.name)
                .join(", ");

        await createAuditLog(tx, {
            actor: auditActor,
            module: AUDIT_MODULES.USERS,
            action: AUDIT_ACTIONS.USER_POSITION_ENDED,
            entityType: "User",
            entityId: userId,
            description: `Retiró a ${user.name} del cargo ${positionNames}`,
        });

        return endResult;
    });

    await sendTransferredApprovalNotifications(
        result.notifications
    );

    return {
        endedAssignments: result.endedAssignments,
    };
};
