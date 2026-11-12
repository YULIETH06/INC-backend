import type {
    PqrCaseType,
    PqrPriority,
    PqrStatus,
} from "@prisma/client";

// Nombre legible de cada estado de la PQR.
export const PQR_STATUS_LABELS: Record<PqrStatus, string> = {
    PENDIENTE: "Pendiente",
    EN_PROCESO: "En proceso",
    CERRADA: "Cerrada",
};

// Nombre legible de cada prioridad de la PQR.
export const PQR_PRIORITY_LABELS: Record<PqrPriority, string> = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
    URGENTE: "Urgente",
};

// Nombre legible de cada tipo de caso de la PQR.
export const PQR_CASE_TYPE_LABELS: Record<PqrCaseType, string> = {
    SAP: "SAP",
    BEAS: "BEAS",
    TERMINAL: "Terminal",
    CORREO: "Correo",
    INTRANET: "Intranet",
    SOPORTE_EQUIPOS: "Soporte Equipos",
    SOPORTE_RED: "Soporte Red",
    MI_PORTAL_SAP: "Mi Portal SAP",
    LEGALISAPP: "LegalisApp",
    NUEVAS_SOLICITUDES: "Nuevas Solicitudes",
};