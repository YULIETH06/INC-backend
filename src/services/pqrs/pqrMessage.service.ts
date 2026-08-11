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

    if (userRole === "USER" && pqr.userId !== userId) {
        throw new Error("Solo puedes enviar mensajes en las PQR creadas por ti");
    }

    if (userRole === "AGENT" && pqr.assignedToId !== userId) {
        throw new Error("Solo puedes enviar mensajes en las PQR asignadas a ti");
    }

    return pqr;
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

    if (userRole === "USER" && pqr.userId !== userId) {
        throw new Error("Solo puedes ver los mensajes de tus PQR");
    }

    if (userRole === "AGENT" && pqr.assignedToId !== userId) {
        throw new Error("Solo puedes ver los mensajes de las PQR asignadas a ti");
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

    if (userRole === "USER" && pqr.userId !== userId) {
        throw new Error("Solo puedes marcar como leído el chat de tus PQR");
    }

    if (userRole === "AGENT" && pqr.assignedToId !== userId) {
        throw new Error("Solo puedes marcar como leído el chat de las PQR asignadas a ti");
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