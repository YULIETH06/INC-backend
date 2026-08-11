import fs from "fs";
import path from "path";
import multer from "multer";

import type {
    NextFunction,
    Request,
    Response,
} from "express";

const candidateResumeUploadPath =
    "uploads/human-talent/candidates";

// Crea la carpeta de hojas de vida si todavía no existe.
if (!fs.existsSync(candidateResumeUploadPath)) {
    fs.mkdirSync(candidateResumeUploadPath, {
        recursive: true,
    });
}

// Guarda las hojas de vida en una carpeta local del backend.
const candidateResumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Crea nuevamente la carpeta si fue eliminada
        // mientras el servidor estaba activo.
        if (!fs.existsSync(candidateResumeUploadPath)) {
            fs.mkdirSync(candidateResumeUploadPath, {
                recursive: true,
            });
        }

        cb(null, candidateResumeUploadPath);
    },

    filename: (req, file, cb) => {
        const fileExtension = path
            .extname(file.originalname)
            .toLowerCase();

        const fileBaseName = path
            .basename(file.originalname, fileExtension)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase();

        const uniqueFileName =
            `candidate-${Date.now()}-${fileBaseName}${fileExtension}`;

        cb(null, uniqueFileName);
    },
});

// Configuración de Multer para hojas de vida.
const personnelCandidateResumeUpload = multer({
    storage: candidateResumeStorage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx",
        ];

        const fileExtension = path
            .extname(file.originalname)
            .toLowerCase();

        const validMimeType = allowedMimeTypes.includes(
            file.mimetype
        );

        const validExtension = allowedExtensions.includes(
            fileExtension
        );

        if (!validMimeType || !validExtension) {
            return cb(
                new Error(
                    "Solo se permiten hojas de vida en formato PDF, DOC o DOCX"
                )
            );
        }

        cb(null, true);
    },
});

// Recibe una sola hoja de vida y controla los errores de Multer.
export const uploadPersonnelCandidateResume = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const upload = personnelCandidateResumeUpload.single("file");

    upload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message:
                        "La hoja de vida no puede superar los 5 MB",
                });
            }

            return res.status(400).json({
                message: error.message,
            });
        }

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        next();
    });
};