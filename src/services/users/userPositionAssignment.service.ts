import prisma from "../../config/client.js";

// Mensajes de error usados por el servicio y el controlador.
export const USER_POSITION_ASSIGNMENT_ERRORS = {
    USER_NOT_FOUND: "El usuario no existe",
    POSITION_NOT_FOUND: "El cargo no existe",
    POSITION_INACTIVE: "El cargo seleccionado no está activo",
    SAME_POSITION: "El usuario ya tiene asignado este cargo",
    NO_ACTIVE_ASSIGNMENT: "El usuario no tiene un cargo activo para retirar",
} as const;

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
    return prisma.$transaction(async (tx) => {
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

        const now = new Date();

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

        return newAssignment;
    });
};

// Retira el cargo activo del usuario sin asignarle uno nuevo.
export const endUserPositionAssignmentService = async (
    userId: number
) => {
    return prisma.$transaction(async (tx) => {
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

        return {
            endedAssignments: activeAssignments.length,
        };
    });
};
