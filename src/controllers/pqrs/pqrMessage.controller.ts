import type { Response } from "express";
import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import {
    createPqrMessageWithAttachmentService,
    getPqrMessagesService,
    markPqrChatAsReadService,
} from "../../services/pqrs/pqrMessage.service.js";
import { getIo } from "../../config/socket.js";
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
    pqrId: number,
    userId: number
) => {
    const io = getIo();

    if (!io) return;

    const unreadMessagesCount = await getUnreadMessagesCount(pqrId, userId);

    io.to(`user_${userId}`).emit("pqr_unread_count_updated", {
        pqrId,
        unreadMessagesCount,
    });
};

// Obtiene el historial de mensajes de una PQR.
export const getPqrMessagesController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const pqrId = Number(req.params.id);

        if (!pqrId || Number.isNaN(pqrId)) {
            return res.status(400).json({
                message: "El id de la PQR no es válido",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const messages = await getPqrMessagesService(
            pqrId,
            req.user.id,
            req.user.role
        );

        return res.json({
            message: "Mensajes obtenidos correctamente",
            messages,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al obtener los mensajes",
        });
    }
};

// Envía un mensaje con archivo adjunto en una PQR.
export const createPqrMessageWithAttachmentController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const pqrId = Number(req.params.id);
        const content = req.body.content;

        if (!pqrId || Number.isNaN(pqrId)) {
            return res.status(400).json({
                message: "El id de la PQR no es válido",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "El archivo es obligatorio",
            });
        }

        const message = await createPqrMessageWithAttachmentService({
            pqrId,
            content,
            file: req.file,
            senderId: req.user.id,
            senderRole: req.user.role,
        });

        const io = getIo();

        // Emite el nuevo mensaje a la sala de la PQR si Socket.IO está activo.
        if (io) {
            io.to(`pqr_${pqrId}`).emit("new_pqr_message", message);

            const pqr = await prisma.pQR.findUnique({
                where: {
                    id: pqrId,
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
                                receiverId !== req.user!.id
                        )
                    ),
                ];

                await Promise.all(
                    receiverIds.map((receiverId) =>
                        emitUnreadCountToUser(pqrId, receiverId)
                    )
                );
            }
        }

        return res.status(201).json({
            message: "Mensaje con archivo enviado correctamente",
            pqrMessage: message,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al enviar el archivo",
        });
    }
};

// Marca como leído el chat de una PQR para el usuario autenticado.
export const markPqrChatAsReadController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const pqrId = Number(req.params.id);

        if (!pqrId || Number.isNaN(pqrId)) {
            return res.status(400).json({
                message: "El id de la PQR no es válido",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        await markPqrChatAsReadService(
            pqrId,
            req.user.id,
            req.user.role
        );

        return res.json({
            message: "Chat marcado como leído correctamente",
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al marcar el chat como leído",
        });
    }
};