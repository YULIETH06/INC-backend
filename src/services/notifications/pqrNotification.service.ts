import { NotificationType, Role } from "@prisma/client";
import prisma from "../../config/client.js";
import { createNotificationService, createNotificationsForUsersService } from "./notification.service.js";

// Obtiene los usuarios ADMIN y AGENT que deben recibir notificaciones
export const getAdminsAndAgentsService = async () => {
    const users = await prisma.user.findMany({
        where: {
            role: {
                in: [Role.ADMIN, Role.AGENT],
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    return users;
};

// Obtiene solo los usuarios ADMIN que deben recibir notificaciones
export const getAdminsService = async () => {
    const admins = await prisma.user.findMany({
        where: {
            role: Role.ADMIN,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    return admins;
};

// Notifica a ADMIN y AGENT cuando se crea una nueva PQR
export const notifyAdminsAndAgentsAboutNewPqrService = async (
    pqrId: number,
    userName: string,
    userEmail: string
) => {
    const usersToNotify = await getAdminsAndAgentsService();

    const userIds = usersToNotify.map((user) => user.id);

    const result = await createNotificationsForUsersService(userIds, {
        title: "Nueva PQR creada",
        message: `${userName} (${userEmail}) creó una nueva PQR #${pqrId}.`,
        type: NotificationType.NEW_PQR,
        pqrId,
    });

    return result;
};

// Notifica al USER cuando su PQR fue cerrada
export const notifyUserAboutClosedPqrService = async (
    userId: number,
    pqrId: number
) => {
    const notification = await createNotificationService({
        title: "PQR cerrada",
        message: `Tu solicitud #${pqrId} fue cerrada. Por favor califica la atención recibida.`,
        type: NotificationType.PQR_CLOSED,
        userId,
        pqrId,
    });

    return notification;
};

// Notifica a los ADMIN cuando un AGENT toma una PQR
export const notifyAdminsAboutTakenPqrService = async (
    pqrId: number,
    agentName: string,
    agentEmain: string,
    userName: string,
    userEmail: string,
    agentId: number
) => {
    const admins = await getAdminsService();

    // Evita notificar al mismo usuario si quien tomó la PQR también es ADMIN
    const adminIds = admins
        .filter((admin) => admin.id !== agentId)
        .map((admin) => admin.id);

    const result = await createNotificationsForUsersService(adminIds, {
        title: "PQR tomada por agente",
        message: `${agentName} (${agentEmain}) tomó la PQR #${pqrId} creada por ${userName}(${userEmail}).`,
        type: NotificationType.PQR_TAKEN,
        pqrId,
    });

    return result;
};

// Notifica al USER cuando un AGENT toma su PQR
export const notifyUserAboutTakenPqrService = async (
    userId: number,
    pqrId: number
) => {
    const notification = await createNotificationService({
        title: "Tu PQR está siendo atendida",
        message: `Tu solicitud #${pqrId} ya fue tomada por un agente.`,
        type: NotificationType.PQR_TAKEN,
        userId,
        pqrId,
    });

    return notification;
};

// Notifica a los ADMIN y al AGENT asignado cuando un USER califica una PQR
export const notifyAboutRatedPqrService = async (
    pqrId: number,
    userName: string,
    userEmail: string,
    rating: number,
    assignedToId?: number | null
) => {
    const admins = await getAdminsService();

    const adminIds = admins.map((admin) => admin.id);

    const userIdsToNotify = assignedToId
        ? [...new Set([...adminIds, assignedToId])]
        : adminIds;

    const result = await createNotificationsForUsersService(userIdsToNotify, {
        title: "PQR calificada",
        message: `${userName} (${userEmail}) calificó la PQR #${pqrId} con ${rating} estrellas.`,
        type: NotificationType.PQR_RATED,
        pqrId,
    });

    return result;
};

// Notifica al AGENT cuando un ADMIN le asigna o reasigna una PQR
export const notifyAgentAboutAssignedPqrService = async (
    agentId: number,
    pqrId: number
) => {
    const notification = await createNotificationService({
        title: "PQR asignada",
        message: `Se te asignó la PQR #${pqrId}.`,
        type: NotificationType.PQR_ASSIGNED,
        userId: agentId,
        pqrId,
    });

    return notification;
};

// Notifica al AGENT anterior cuando un ADMIN le retira una PQR
export const notifyAgentAboutUnassignedPqrService = async (
    agentId: number,
    pqrId: number
) => {
    const notification = await createNotificationService({
        title: "PQR retirada",
        message: `Ya no tienes asignada la PQR #${pqrId}.`,
        type: NotificationType.PQR_UNASSIGNED,
        userId: agentId,
        pqrId,
    });

    return notification;
};
