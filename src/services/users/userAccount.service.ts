import { Prisma } from "@prisma/client";

import prisma from "../../config/client.js";

import {
    endActiveAssignmentsForUser,
    sendTransferredApprovalNotifications,
} from "../../helpers/users/positionAssignmentTransfer.helper.js";

import {
    isValidEmail,
} from "../../utils/validators.js";

// Error de una regla de la cuenta del usuario.
// Incluye el código HTTP que debe responder el controlador.
export class UserAccountError extends Error {
    statusCode: 400 | 404 | 409;

    constructor(
        message: string,
        statusCode: 400 | 404 | 409 = 400
    ) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Datos que se devuelven del usuario después de cada acción.
const userAccountSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    deactivatedAt: true,
} as const;

// Indica si un error de Prisma corresponde a un valor único repetido.
const isUniqueConstraintError = (
    error: unknown
) => {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
};

// Mensaje cuando otro usuario activo ya utiliza el correo.
const getEmailInUseMessage = (
    email: string
) => {
    return `Ya existe un usuario activo con el correo ${email}`;
};

// Desactiva un usuario.
// El usuario no puede iniciar sesión, se le retiran sus cargos
// y su correo queda libre para que otro usuario pueda registrarse con él.
export const deactivateUserService = async (
    userId: number,
    authenticatedUserId: number
) => {
    if (userId === authenticatedUserId) {
        throw new UserAccountError(
            "No puedes desactivar tu propio usuario"
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (!user) {
            throw new UserAccountError(
                "El usuario no existe",
                404
            );
        }

        if (!user.isActive) {
            throw new UserAccountError(
                "El usuario ya está desactivado"
            );
        }

        // Retira sus cargos: las aprobaciones pendientes quedan sin
        // responsable hasta que alguien reciba el cargo.
        const { endedAssignments, notifications } =
            await endActiveAssignmentsForUser(
                tx,
                userId
            );

        const updatedUser = await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                isActive: false,
                deactivatedAt: new Date(),

                // Libera el correo para un nuevo registro.
                activeEmail: null,
            },
            select: userAccountSelect,
        });

        return {
            user: updatedUser,
            endedAssignments,
            notifications,
        };
    });

    await sendTransferredApprovalNotifications(
        result.notifications
    );

    return {
        user: result.user,
        endedAssignments: result.endedAssignments,
    };
};

// Activa nuevamente un usuario desactivado.
// Solo es posible si ningún otro usuario activo utiliza su correo.
export const activateUserService = async (
    userId: number
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            isActive: true,
        },
    });

    if (!user) {
        throw new UserAccountError(
            "El usuario no existe",
            404
        );
    }

    if (user.isActive) {
        throw new UserAccountError(
            "El usuario ya está activo"
        );
    }

    const emailInUse = await prisma.user.findUnique({
        where: {
            activeEmail: user.email,
        },
        select: {
            id: true,
        },
    });

    if (emailInUse) {
        throw new UserAccountError(
            `${getEmailInUseMessage(user.email)}. Cámbiale el correo antes de activarlo.`,
            409
        );
    }

    try {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isActive: true,
                deactivatedAt: null,
                activeEmail: user.email,
            },
            select: userAccountSelect,
        });
    } catch (error) {
        // Otro usuario tomó el correo entre la validación y la actualización.
        if (isUniqueConstraintError(error)) {
            throw new UserAccountError(
                `${getEmailInUseMessage(user.email)}. Cámbiale el correo antes de activarlo.`,
                409
            );
        }

        throw error;
    }
};

// Cambia el correo de un usuario, activo o desactivado.
// Si el usuario está activo, el correo no puede pertenecer a otro usuario activo.
export const updateUserEmailService = async (
    userId: number,
    email: string
) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
        throw new UserAccountError(
            "El correo es obligatorio"
        );
    }

    if (!isValidEmail(cleanEmail)) {
        throw new UserAccountError(
            "El correo electrónico no tiene un formato válido"
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            isActive: true,
        },
    });

    if (!user) {
        throw new UserAccountError(
            "El usuario no existe",
            404
        );
    }

    if (user.email.toLowerCase() === cleanEmail) {
        throw new UserAccountError(
            "El nuevo correo debe ser diferente al correo actual"
        );
    }

    if (user.isActive) {
        const emailInUse = await prisma.user.findUnique({
            where: {
                activeEmail: cleanEmail,
            },
            select: {
                id: true,
            },
        });

        if (emailInUse) {
            throw new UserAccountError(
                getEmailInUseMessage(cleanEmail),
                409
            );
        }
    }

    try {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                email: cleanEmail,

                // Solo los usuarios activos ocupan el correo.
                activeEmail: user.isActive
                    ? cleanEmail
                    : null,
            },
            select: userAccountSelect,
        });
    } catch (error) {
        // Otro usuario tomó el correo entre la validación y la actualización.
        if (isUniqueConstraintError(error)) {
            throw new UserAccountError(
                getEmailInUseMessage(cleanEmail),
                409
            );
        }

        throw error;
    }
};