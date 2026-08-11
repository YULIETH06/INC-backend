import { getIo } from "../../config/socket.js";
import { emitNotificationToUser } from "../../sockets/notification.socket.js";
import { NotificationType, Role } from "@prisma/client";
import prisma from "../../config/client.js";
import type { CreateNotificationData } from "../../interfaces/notifications/notification.interface.js";

// Crea una notificación para un usuario específico
export const createNotificationService = async (
    data: CreateNotificationData,
) => {
    const notification = await prisma.notification.create({
        data: {
            title: data.title,
            message: data.message,
            type: data.type,
            userId: data.userId,
            pqrId: data.pqrId ?? null,
            personnelRequisitionId: data.personnelRequisitionId ?? null,
        },
    });

    const io = getIo();

    // Emite la notificación en tiempo real si el socket está activo
    if (io) {
        emitNotificationToUser(io, data.userId, notification);
    }

    return notification;
};

// Crea la misma notificación para varios usuarios
export const createNotificationsForUsersService = async (
    userIds: number[],
    data: Omit<CreateNotificationData, "userId">
) => {
    if (userIds.length === 0) {
        return null;
    }

    const notifications = await prisma.$transaction(
        userIds.map((userId) =>
            prisma.notification.create({
                data: {
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    userId,
                    pqrId: data.pqrId ?? null,
                    personnelRequisitionId: data.personnelRequisitionId ?? null,
                },
            })
        )
    );

    const io = getIo();

    // Emite cada notificación al usuario correspondiente
    if (io) {
        notifications.forEach((notification) => {
            emitNotificationToUser(
                io,
                notification.userId,
                notification
            );
        });
    }

    return notifications;
};

// Obtiene las notificaciones del usuario autenticado
export const getUserNotificationsService = async (userId: number) => {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return notifications;
};

// Obtiene la cantidad de notificaciones no leídas del usuario autenticado
export const getUnreadNotificationsCountService = async (userId: number) => {
    const count = await prisma.notification.count({
        where: {
            userId,
            isRead: false,
        },
    });

    return count;
};

// Marca una notificación como leída si pertenece al usuario autenticado
export const markNotificationAsReadService = async (
    notificationId: number,
    userId: number
) => {
    const result = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId,
        },
        data: {
            isRead: true,
        },
    });

    if (result.count === 0) {
        return false;
    }

    return true;
};

// Marca todas las notificaciones pendientes como leídas
export const markAllNotificationsAsReadService = async (userId: number) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });

    return result.count;
};