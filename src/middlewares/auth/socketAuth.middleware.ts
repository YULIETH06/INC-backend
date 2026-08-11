import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import type { AuthSocket } from "../../interfaces/sockets/socket.interface.js";
import type { ExtendedError } from "socket.io";

interface JwtPayload {
    id: number;
    email: string;
    role: Role;
}

// Valida el JWT enviado desde el cliente al conectarse por socket.
export const socketAuthMiddleware = (
    socket: AuthSocket,
    next: (err?: ExtendedError) => void
) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Token no proporcionado"));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        socket.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        next(new Error("Token inválido o expirado"));
    }
};