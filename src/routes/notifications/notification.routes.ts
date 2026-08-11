import { Router } from "express";
import {
    getNotificationsController,
    getUnreadNotificationsCountController,
    markAllNotificationsAsReadController,
    markNotificationAsReadController,
} from "../../controllers/notifications/notification.controller.js";
import { authMiddleware } from "../../middlewares/index.js";

const router = Router();

// Obtiene todas las notificaciones del usuario autenticado
router.get("/", authMiddleware, getNotificationsController);

// Obtiene la cantidad de notificaciones no leídas
router.get(
    "/unread-count",
    authMiddleware,
    getUnreadNotificationsCountController
);

// Marca todas las notificaciones como leídas
router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsReadController
);

// Marca una notificación como leída
router.patch(
    "/:id/read",
    authMiddleware,
    markNotificationAsReadController
);

export default router;