import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import type { PrismaExecutor } from "../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

import type {
    AuditActor,
    CreateAuditLogData,
} from "../../interfaces/audit/auditLog.interface.js";

// Obtiene de la petición el usuario que hace la acción.
// Se llama en el controlador y se envía al servicio.
export const getAuditActor = (
    req: AuthRequest
): AuditActor => {
    return {
        userId: req.user?.id ?? null,
        email: req.user?.email ?? null,
        role: req.user?.role ?? null,
    };
};

// Registra una acción en la auditoría.
// Debe ejecutarse dentro de la misma transacción de la acción:
// si la acción falla, el registro tampoco se guarda.
export const createAuditLog = async (
    prismaExecutor: PrismaExecutor,
    data: CreateAuditLogData
) => {
    const { actor } = data;

    // Copia el nombre del usuario tal como está en este momento.
    const actorUser =
        actor.userId !== null
            ? await prismaExecutor.user.findUnique({
                where: {
                    id: actor.userId,
                },
                select: {
                    name: true,
                },
            })
            : null;

    return prismaExecutor.auditLog.create({
        data: {
            actorUserId: actor.userId,
            actorName: actorUser?.name ?? null,
            actorEmail: actor.email?.slice(0, 150) ?? null,
            actorRole: actor.role,

            module: data.module,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId ?? null,
            description: data.description.slice(0, 500),
        },
    });
};

// Acorta un texto largo para mostrarlo dentro de la descripción de la auditoría.
export const shortenAuditText = (
    text: string,
    maxLength = 120
) => {
    const cleanText = text.trim();

    return cleanText.length > maxLength
        ? `${cleanText.slice(0, maxLength)}…`
        : cleanText;
};