import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import type { Role } from "@prisma/client";

// Valida que el usuario autenticado tenga alguno de los roles permitidos
export const roleMiddleware = (allowedRoles: Role[]) => {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (!allowedRoles.includes(req.user.role as Role)) {
            return res.status(403).json({
                message: "No tienes permisos para acceder a este recurso",
            });
        }

        next();
    };
};