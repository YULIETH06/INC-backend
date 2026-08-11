import type { Server } from "socket.io";

// Emite una notificación en tiempo real a un usuario específico
export const emitNotificationToUser = (
    io: Server,
    userId: number,
    notification: unknown
) => {
    io.to(`user_${userId}`).emit("new_notification", notification);
};