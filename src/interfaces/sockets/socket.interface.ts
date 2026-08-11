import type { Socket } from "socket.io";
import type { Role } from "@prisma/client";

// Socket extendido para guardar el usuario autenticado por JWT.
export interface AuthSocket extends Socket {
    user?: {
        id: number;
        email: string;
        role: Role;
    };
}