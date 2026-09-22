import fs from "fs";
import path from "path";
import multer from "multer";

import type {
    NextFunction,
    Request,
    Response,
} from "express";

const technicalExamUploadPath =
    "uploads/human-talent/technical-exams";

if (!fs.existsSync(technicalExamUploadPath)) {
    fs.mkdirSync(technicalExamUploadPath, {
        recursive: true,
    });
}

const technicalExamStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(technicalExamUploadPath)) {
            fs.mkdirSync(technicalExamUploadPath, {
                recursive: true,
            });
        }

        cb(null, technicalExamUploadPath);
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
            `technical-exam-${Date.now()}-${fileBaseName}${fileExtension}`;

        cb(null, uniqueFileName);
    },
});

const candidateTechnicalExamUpload = multer({
    storage: technicalExamStorage,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const fileExtension = path
            .extname(file.originalname)
            .toLowerCase();

        const allowedMimeTypes = [
            "application/pdf",
            "application/x-pdf",
            "application/octet-stream",
        ];

        const validMimeType =
            allowedMimeTypes.includes(file.mimetype);

        const validExtension =
            fileExtension === ".pdf";

        if (!validMimeType || !validExtension) {
            return cb(
                new Error(
                    "La evidencia del examen técnico debe ser un archivo PDF"
                )
            );
        }

        cb(null, true);
    },
});

export const uploadCandidateTechnicalExam = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const upload =
        candidateTechnicalExamUpload.single("file");

    upload(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message:
                        "La evidencia del examen técnico no puede superar los 5 MB",
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