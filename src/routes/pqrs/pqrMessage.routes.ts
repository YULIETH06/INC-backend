import { Router } from "express";
import {
    createPqrMessageWithAttachmentController,
    getPqrMessagesController,
    markPqrChatAsReadController,
} from "../../controllers/pqrs/pqrMessage.controller.js";
import { authMiddleware, uploadPqrAttachment } from "../../middlewares/index.js";

const router = Router();

// Obtiene el historial de mensajes de una PQR.
router.get("/pqrs/:id/messages", authMiddleware, getPqrMessagesController);

// Marca como leído el chat de una PQR.
router.patch(
    "/pqrs/:id/messages/read",
    authMiddleware,
    markPqrChatAsReadController
);

// Envía un mensaje con archivo adjunto en una PQR.
router.post(
    "/pqrs/:id/messages/attachment",
    authMiddleware,
    uploadPqrAttachment.single("file"),
    createPqrMessageWithAttachmentController
);

export default router;