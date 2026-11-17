import type {
    Response,
} from "express";

import type {
    AuthRequest,
} from "../../interfaces/auth/auth.interface.js";

import {
    AUDIT_ACTIONS,
    AUDIT_MODULES,
} from "../../constants/audit/auditLog.constants.js";

import type {
    AuditAction,
    AuditModule,
} from "../../constants/audit/auditLog.constants.js";

import {
    getAuditLogsService,
} from "../../services/audit/auditLog.service.js";

// Valores permitidos para los filtros.
const validModules: string[] = Object.values(AUDIT_MODULES);
const validActions: string[] = Object.values(AUDIT_ACTIONS);

// Formato de fecha esperado: AAAA-MM-DD.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Lee un texto del query. Devuelve undefined si no llegó o está vacío.
const getQueryText = (
    value: unknown
): string | undefined => {
    if (typeof value !== "string") {
        return undefined;
    }

    const cleanValue = value.trim();

    return cleanValue || undefined;
};

// Consulta los registros de la auditoría. Endpoint usado por ADMIN.
export const getAuditLogs = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const module = getQueryText(req.query.module);
        const action = getQueryText(req.query.action);
        const search = getQueryText(req.query.search);
        const dateFrom = getQueryText(req.query.dateFrom);
        const dateTo = getQueryText(req.query.dateTo);
        const actorUserIdText = getQueryText(req.query.actorUserId);

        if (module && !validModules.includes(module)) {
            return res.status(400).json({
                message: "El módulo no es válido",
            });
        }

        if (action && !validActions.includes(action)) {
            return res.status(400).json({
                message: "La acción no es válida",
            });
        }

        if (
            (dateFrom && !DATE_PATTERN.test(dateFrom)) ||
            (dateTo && !DATE_PATTERN.test(dateTo))
        ) {
            return res.status(400).json({
                message: "Las fechas deben tener el formato AAAA-MM-DD",
            });
        }

        if (dateFrom && dateTo && dateFrom > dateTo) {
            return res.status(400).json({
                message: "La fecha inicial no puede ser mayor que la fecha final",
            });
        }

        const actorUserId = actorUserIdText
            ? Number(actorUserIdText)
            : undefined;

        if (
            actorUserId !== undefined &&
            (!Number.isInteger(actorUserId) || actorUserId <= 0)
        ) {
            return res.status(400).json({
                message: "El usuario no es válido",
            });
        }

        const result = await getAuditLogsService({
            module: module as AuditModule | undefined,
            action: action as AuditAction | undefined,
            actorUserId,
            search: search?.slice(0, 100),
            dateFrom,
            dateTo,
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error al consultar la auditoría",
        });
    }
};