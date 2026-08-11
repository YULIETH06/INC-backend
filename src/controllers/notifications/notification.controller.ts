import type { Response } from "express";
import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import {
    getUserNotificationsService,
    getUnreadNotificationsCountService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
} from "../../services/notifications/notification.service.js";

// Obtiene las notificaciones del usuario autenticado
export const getNotificationsController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Usuario no autenticado.",
            });
        }

        const notifications = await getUserNotificationsService(userId);

        return res.status(200).json({
            message: "Notificaciones obtenidas correctamente.",
            notifications,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error al obtener las notificaciones.",
        });
    }
};

// Obtiene la cantidad de notificaciones no leídas
export const getUnreadNotificationsCountController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Usuario no autenticado.",
            });
        }

        const count = await getUnreadNotificationsCountService(userId);

        return res.status(200).json({
            message: "Cantidad de notificaciones no leídas obtenida correctamente.",
            count,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error al obtener la cantidad de notificaciones.",
        });
    }
};

// Marca una notificación como leída
export const markNotificationAsReadController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;
        const notificationId = Number(req.params.id);

        if (!userId) {
            return res.status(401).json({
                message: "Usuario no autenticado.",
            });
        }

        if (Number.isNaN(notificationId)) {
            return res.status(400).json({
                message: "El id de la notificación no es válido.",
            });
        }

        const wasUpdated = await markNotificationAsReadService(
            notificationId,
            userId
        );

        if (!wasUpdated) {
            return res.status(404).json({
                message: "La notificación no existe.",
            });
        }

        return res.status(200).json({
            message: "Notificación marcada como leída.",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error al marcar la notificación como leída.",
        });
    }
};

// Marca todas las notificaciones pendientes como leídas
export const markAllNotificationsAsReadController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Usuario no autenticado.",
            });
        }

        const updatedCount = await markAllNotificationsAsReadService(userId);

        if (updatedCount === 0) {
            return res.status(200).json({
                message: "No tienes notificaciones pendientes por leer.",
                updatedCount,
            });
        }

        return res.status(200).json({
            message: "Todas las notificaciones fueron marcadas como leídas.",
            updatedCount,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error al marcar las notificaciones como leídas.",
        });
    }
};