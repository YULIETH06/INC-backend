import type { Role } from "@prisma/client";

import type {
    AuditAction,
    AuditModule,
} from "../../constants/audit/auditLog.constants.js";

// Quién hace la acción.
export interface AuditActor {
    userId: number | null;
    email: string | null;
    role: Role | null;
}

// Datos necesarios para registrar una acción en la auditoría.
export interface CreateAuditLogData {
    actor: AuditActor;
    module: AuditModule;
    action: AuditAction;
    entityType: string;
    entityId?: number | null;
    description: string;
}

// Filtros para consultar la auditoría.
export interface AuditLogFilters {
    module?: AuditModule | undefined;
    action?: AuditAction | undefined;
    actorUserId?: number | undefined;
    search?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}