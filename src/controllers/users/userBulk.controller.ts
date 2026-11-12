import type {
    Response,
} from "express";

import type {
    AuthRequest,
} from "../../interfaces/auth/auth.interface.js";

import {
    getAuditActor,
} from "../../helpers/audit/auditLog.helper.js";

import {
    registerUsersBulkService,
} from "../../services/users/userBulk.service.js";

// Permite registrar usuarios mediante carga masiva.
export const registerUsersBulk = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message:
                    "Debe subir un archivo Excel",
            });
        }

        const result =
            await registerUsersBulkService(
                req.file.buffer,
                getAuditActor(req)
            );

        return res.status(201).json({
            message:
                "Carga masiva procesada correctamente",
            result,
        });
    } catch (error) {
        // Muestra el error real en consola
        // para facilitar la revisión técnica.
        console.log(
            "Error carga masiva:",
            error
        );

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message:
                "Error al procesar la carga masiva de usuarios",
        });
    }
};