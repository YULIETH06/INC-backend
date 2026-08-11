import type { PqrAttachmentType, Role } from "@prisma/client";

// Datos necesarios para crear un mensaje de texto en una PQR.
export interface CreatePqrMessageData {
  pqrId: number;
  senderId: number;
  senderRole: Role;
  content?: string;
}

// Datos necesarios para crear un mensaje con archivo adjunto.
export interface CreatePqrMessageWithAttachmentData {
  pqrId: number;
  senderId: number;
  senderRole: Role;
  content?: string;
  file: Express.Multer.File;
}

// Información del archivo adjunto que se guarda en la base de datos.
export interface PqrAttachmentData {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: PqrAttachmentType;
  mimeType: string;
  fileSize: number;
}