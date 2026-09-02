import type { Role } from "@prisma/client";
import prisma from "../../config/client.js";
import type {
    CreatePqrMessageData,
    CreatePqrMessageWithAttachmentData,
} from "../../interfaces/pqrs/pqrMessage.interface.js";
import { buildPqrAttachmentData } from "./pqrAttachment.service.js";

// Valida si el usuario puede interactuar con la PQR.
const validatePqrAccess = async (
    pqrId: number,
    userId: number,
    userRole: Role
) => {
    const pqr = await prisma.pQR.findUnique({
        where: {
            id: pqrId,
        },
    });

    if (!pqr) {
        throw new Error("La PQR no existe");
    }

    if (pqr.status === "CERRADA") {
        throw new Error("No se pueden enviar mensajes en una PQR cerrada");
    }

    if (!canAccessPqrChat(pqr, userId, userRole)) {
        throw new Error("No tienes permiso para enviar mensajes en esta PQR");
    }

    return pqr;
};

// Valida si el usuario tiene acceso al chat de una PQR.
const canAccessPqrChat = (
    pqr: {
        userId: number;
        assignedToId: number | null;
    },
    userId: number,
    userRole: Role
) => {
    // ADMIN tiene acceso administrativo.
    if (userRole === "ADMIN") {
        return true;
    }

    // Cualquier usuario autenticado puede acceder a una PQR creada por él.
    if (pqr.userId === userId) {
        return true;
    }

    // Un AGENT también puede acceder si la PQR está asignada a él.
    if (userRole === "AGENT" && pqr.assignedToId === userId) {
        return true;
    }

    return false;
};

// Crea un mensaje de texto dentro de una PQR.
export const createPqrMessageService = async ({
    pqrId,
    senderId,
    senderRole,
    content,
}: CreatePqrMessageData) => {
    const cleanContent = content?.trim();

    if (!cleanContent) {
        throw new Error("El mensaje es obligatorio");
    }

    if (cleanContent.length > 500) {
        throw new Error("El mensaje no puede superar los 500 caracteres");
    }

    await validatePqrAccess(pqrId, senderId, senderRole);

    const message = await prisma.pqrMessage.create({
        data: {
            content: cleanContent,
            pqrId,
            senderId,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            attachments: true,
        },
    });

    return message;
};

// Crea un mensaje con archivo adjunto dentro de una PQR.
export const createPqrMessageWithAttachmentService = async ({
    pqrId,
    senderId,
    senderRole,
    content,
    file,
}: CreatePqrMessageWithAttachmentData) => {
    const cleanContent = content?.trim();

    if (cleanContent && cleanContent.length > 500) {
        throw new Error("El mensaje no puede superar los 500 caracteres");
    }

    await validatePqrAccess(pqrId, senderId, senderRole);

    const attachmentData = buildPqrAttachmentData({
        file,
    });

    const message = await prisma.pqrMessage.create({
        data: {
            content: cleanContent || null,
            pqrId,
            senderId,
            attachments: {
                create: attachmentData,
            },
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            attachments: true,
        },
    });

    return message;
};

// Obtiene el historial de mensajes de una PQR.
export const getPqrMessagesService = async (
    pqrId: number,
    userId: number,
    userRole: Role
) => {
    const pqr = await prisma.pQR.findUnique({
        where: {
            id: pqrId,
        },
    });

    if (!pqr) {
        throw new Error("La PQR no existe");
    }

    if (!canAccessPqrChat(pqr, userId, userRole)) {
        throw new Error("No tienes permiso para ver los mensajes de esta PQR");
    }

    const messages = await prisma.pqrMessage.findMany({
        where: {
            pqrId,
        },
        orderBy: {
            createdAt: "asc",
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            attachments: true,
        },
    });

    return messages;
};

// Marca como leído el chat de una PQR para el usuario autenticado.
export const markPqrChatAsReadService = async (
    pqrId: number,
    userId: number,
    userRole: Role
) => {
    const pqr = await prisma.pQR.findUnique({
        where: {
            id: pqrId,
        },
    });

    if (!pqr) {
        throw new Error("La PQR no existe");
    }

    if (!canAccessPqrChat(pqr, userId, userRole)) {
        throw new Error(
            "No tienes permiso para marcar como leído el chat de esta PQR"
        );
    }

    const chatRead = await prisma.pqrChatRead.upsert({
        where: {
            pqrId_userId: {
                pqrId,
                userId,
            },
        },
        update: {
            lastReadAt: new Date(),
        },
        create: {
            pqrId,
            userId,
            lastReadAt: new Date(),
        },
    });

    return chatRead;
};