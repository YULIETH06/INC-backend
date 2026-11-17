import type { Prisma } from "@prisma/client";

import prisma from "../../config/client.js";

import {
    AUDIT_LOG_QUERY_LIMIT,
} from "../../constants/audit/auditLog.constants.js";

import type {
    AuditLogFilters,
} from "../../interfaces/audit/auditLog.interface.js";

// Zona horaria del sistema, para que las fechas del filtro
// se interpreten como días de Colombia.
const TIME_ZONE_OFFSET = "-05:00";

// Consulta los registros de la auditoría, del más reciente al más antiguo.
// Devuelve como máximo AUDIT_LOG_QUERY_LIMIT registros y el total que cumple los filtros.
export const getAuditLogsService = async (
    filters: AuditLogFilters
) => {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.module) {
        where.module = filters.module;
    }

    if (filters.action) {
        where.action = filters.action;
    }

    if (filters.actorUserId) {
        where.actorUserId = filters.actorUserId;
    }

    // Rango de fechas: desde el inicio del primer día
    // hasta el final del último día.
    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {
            ...(filters.dateFrom && {
                gte: new Date(
                    `${filters.dateFrom}T00:00:00.000${TIME_ZONE_OFFSET}`
                ),
            }),
            ...(filters.dateTo && {
                lte: new Date(
                    `${filters.dateTo}T23:59:59.999${TIME_ZONE_OFFSET}`
                ),
            }),
        };
    }

    // Búsqueda por nombre, correo o descripción.
    if (filters.search) {
        where.OR = [
            {
                actorName: {
                    contains: filters.search,
                },
            },
            {
                actorEmail: {
                    contains: filters.search,
                },
            },
            {
                description: {
                    contains: filters.search,
                },
            },
        ];
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
            take: AUDIT_LOG_QUERY_LIMIT,
            select: {
                id: true,
                actorUserId: true,
                actorName: true,
                actorEmail: true,
                actorRole: true,
                module: true,
                action: true,
                entityType: true,
                entityId: true,
                description: true,
                createdAt: true,
            },
        }),
        prisma.auditLog.count({
            where,
        }),
    ]);

    return {
        logs,
        total,
        limit: AUDIT_LOG_QUERY_LIMIT,
    };
};