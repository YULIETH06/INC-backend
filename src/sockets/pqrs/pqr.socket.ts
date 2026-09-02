import type { Server } from "socket.io";
import type { AuthSocket } from "../../interfaces/sockets/socket.interface.js";
import { createPqrMessageService } from "../../services/pqrs/pqrMessage.service.js";
import prisma from "../../config/client.js";

// Cuenta los mensajes no revisados de una PQR para un usuario específico.
const getUnreadMessagesCount = async (
    pqrId: number,
    userId: number
) => {
    const chatRead = await prisma.pqrChatRead.findUnique({
        where: {
            pqrId_userId: {
                pqrId,
                userId,
            },
        },
    });

    const unreadMessagesCount = await prisma.pqrMessage.count({
        where: {
            pqrId,
            senderId: {
                not: userId,
            },
            ...(chatRead && {
                createdAt: {
                    gt: chatRead.lastReadAt,
                },
            }),
        },
    });

    return unreadMessagesCount;
};

// Emite el contador actualizado de mensajes no revisados al usuario indicado.
const emitUnreadCountToUser = async (
    io: Server,
    pqrId: number,
    userId: number
) => {
    const unreadMessagesCount = await getUnreadMessagesCount(pqrId, userId);

    io.to(`user_${userId}`).emit("pqr_unread_count_updated", {
        pqrId,
        unreadMessagesCount,
    });
};

// Registra los eventos socket relacionados únicamente con el chat de PQR
export const registerPqrSocketEvents = (
    io: Server,
    socket: AuthSocket
) => {
    socket.on("join_pqr", async ({ pqrId }) => {
        try {
            if (!socket.user) {
                socket.emit("socket_error", {
                    message: "Usuario no autenticado",
                });
                return;
            }

            const cleanPqrId = Number(pqrId);

            if (!cleanPqrId || Number.isNaN(cleanPqrId)) {
                socket.emit("socket_error", {
                    message: "El id de la PQR no es válido",
                });
                return;
            }

            const pqr = await prisma.pQR.findUnique({
                where: {
                    id: cleanPqrId,
                },
            });

            if (!pqr) {
                socket.emit("socket_error", {
                    message: "La PQR no existe",
                });
                return;
            }

            const isOwner = pqr.userId === socket.user.id;

            const isAssignedAgent =
                socket.user.role === "AGENT" &&
                pqr.assignedToId === socket.user.id;

            const isAdmin = socket.user.role === "ADMIN";

            if (!isOwner && !isAssignedAgent && !isAdmin) {
                socket.emit("socket_error", {
                    message: "No tienes permiso para acceder al chat de esta PQR",
                });
                return;
            }

            socket.join(`pqr_${cleanPqrId}`);

            socket.emit("joined_pqr", {
                message: "Te uniste al chat de la PQR",
                pqrId: cleanPqrId,
            });
        } catch (error) {
            socket.emit("socket_error", {
                message: "Error al unirse al chat de la PQR",
            });
        }
    });

    socket.on("send_pqr_message", async ({ pqrId, content }) => {
        try {
            if (!socket.user) {
                socket.emit("socket_error", {
                    message: "Usuario no autenticado",
                });
                return;
            }

            const cleanPqrId = Number(pqrId);

            if (!cleanPqrId || Number.isNaN(cleanPqrId)) {
                socket.emit("socket_error", {
                    message: "El id de la PQR no es válido",
                });
                return;
            }

            const message = await createPqrMessageService({
                pqrId: cleanPqrId,
                content,
                senderId: socket.user.id,
                senderRole: socket.user.role,
            });

            io.to(`pqr_${cleanPqrId}`).emit("new_pqr_message", message);

            const pqr = await prisma.pQR.findUnique({
                where: {
                    id: cleanPqrId,
                },
                select: {
                    userId: true,
                    assignedToId: true,
                },
            });

            if (pqr) {
                const receiverIds = [
                    ...new Set(
                        [pqr.userId, pqr.assignedToId].filter(
                            (receiverId): receiverId is number =>
                                Boolean(receiverId) &&
                                receiverId !== socket.user!.id
                        )
                    ),
                ];

                await Promise.all(
                    receiverIds.map((receiverId) =>
                        emitUnreadCountToUser(io, cleanPqrId, receiverId)
                    )
                );
            }
        } catch (error) {
            socket.emit("socket_error", {
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al enviar el mensaje",
            });
        }
    });
};