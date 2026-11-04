import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import type { AuthSocket } from "../../interfaces/sockets/socket.interface.js";
import type { ExtendedError } from "socket.io";

import prisma from "../../config/client.js";

import {
    USER_INACTIVE_MESSAGE,
} from "../../services/auth/auth.service.js";

interface JwtPayload {
    id: number;
    email: string;
    role: Role;
}

// Valida el JWT enviado desde el cliente al conectarse por socket.
// También verifica que el usuario siga activo, para que un usuario
// desactivado no pueda volver a conectarse.
export const socketAuthMiddleware = async (
    socket: AuthSocket,
    next: (err?: ExtendedError) => void
) => {
    let decoded: JwtPayload | null = null;

    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Token no proporcionado"));
        }

        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;
    } catch (error) {
        return next(new Error("Token inválido o expirado"));
    }

    if (!decoded) {
        return next(new Error("Token inválido o expirado"));
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return next(new Error(USER_INACTIVE_MESSAGE));
        }

        socket.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        next(new Error("Error al validar el usuario autenticado"));
    }
};