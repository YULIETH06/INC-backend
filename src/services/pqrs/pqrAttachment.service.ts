import { PqrAttachmentType } from "@prisma/client";

interface BuildPqrAttachmentDataParams {
    file: Express.Multer.File;
}

// Identifica si el archivo subido es imagen o documento.
const getPqrAttachmentType = (mimeType: string): PqrAttachmentType => {
    if (mimeType.startsWith("image/")) {
        return PqrAttachmentType.IMAGE;
    }

    return PqrAttachmentType.DOCUMENT;
};

// Construye la información del archivo que se guardará en la base de datos.
export const buildPqrAttachmentData = ({
    file,
}: BuildPqrAttachmentDataParams) => {
    const fileUrl = `/uploads/pqr/${file.filename}`;

    return {
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl,
        fileType: getPqrAttachmentType(file.mimetype),
        mimeType: file.mimetype,
        fileSize: file.size,
    };
};