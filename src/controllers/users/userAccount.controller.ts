import type {
    Response,
} from "express";

import type {
    AuthRequest,
} from "../../interfaces/auth/auth.interface.js";

import {
    UserAccountError,
    activateUserService,
    deactivateUserService,
    updateUserEmailService,
} from "../../services/users/userAccount.service.js";

// Convierte el id recibido en la ruta en un número válido.
const parseUserId = (
    value: unknown
): number | null => {
    const id = Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
};

// Responde los errores conocidos de la cuenta del usuario.
const handleUserAccountError = (
    error: unknown,
    res: Response,
    defaultMessage: string
) => {
    if (error instanceof UserAccountError) {
        return res.status(error.statusCode).json({
            message: error.message,
        });
    }

    return res.status(500).json({
        message: defaultMessage,
    });
};

// Desactiva un usuario. Endpoint usado por ADMIN.
export const deactivateUser = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = parseUserId(
            req.params.id
        );

        if (!userId) {
            return res.status(400).json({
                message:
                    "El id del usuario no es válido",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message:
                    "Usuario no autenticado",
            });
        }

        const result =
            await deactivateUserService(
                userId,
                req.user.id
            );

        return res.status(200).json({
            message:
                "Usuario desactivado correctamente",
            ...result,
        });
    } catch (error) {
        return handleUserAccountError(
            error,
            res,
            "Error al desactivar el usuario"
        );
    }
};

// Activa nuevamente un usuario desactivado. Endpoint usado por ADMIN.
export const activateUser = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = parseUserId(
            req.params.id
        );

        if (!userId) {
            return res.status(400).json({
                message:
                    "El id del usuario no es válido",
            });
        }

        const user =
            await activateUserService(
                userId
            );

        return res.status(200).json({
            message:
                "Usuario activado correctamente",
            user,
        });
    } catch (error) {
        return handleUserAccountError(
            error,
            res,
            "Error al activar el usuario"
        );
    }
};

// Cambia el correo de un usuario. Endpoint usado por ADMIN.
export const updateUserEmail = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = parseUserId(
            req.params.id
        );

        if (!userId) {
            return res.status(400).json({
                message:
                    "El id del usuario no es válido",
            });
        }

        const email = req.body?.email;

        if (
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                message:
                    "El correo es obligatorio",
            });
        }

        const user =
            await updateUserEmailService(
                userId,
                email
            );

        return res.status(200).json({
            message:
                "Correo del usuario actualizado correctamente",
            user,
        });
    } catch (error) {
        return handleUserAccountError(
            error,
            res,
            "Error al actualizar el correo del usuario"
        );
    }
};