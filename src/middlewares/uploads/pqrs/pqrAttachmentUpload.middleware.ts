import fs from "fs";
import path from "path";
import multer from "multer";

const pqrUploadPath = "uploads/pqr";

// Crea la carpeta de adjuntos de PQR si todavía no existe.
if (!fs.existsSync(pqrUploadPath)) {
    fs.mkdirSync(pqrUploadPath, {
        recursive: true,
    });
}

// Guarda el archivo Excel en memoria para leerlo desde req.file.buffer.
const excelStorage = multer.memoryStorage();

// Middleware para recibir archivos Excel.
export const uploadExcel = multer({
    storage: excelStorage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Solo se permiten archivos Excel"));
        }

        cb(null, true);
    },
});

// Guarda los adjuntos de PQR en una carpeta local del backend.
const pqrAttachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Crea la carpeta si fue eliminada mientras el servidor estaba activo.
        if (!fs.existsSync(pqrUploadPath)) {
            fs.mkdirSync(pqrUploadPath, {
                recursive: true,
            });
        }

        cb(null, pqrUploadPath);
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const fileBaseName = path
            .basename(file.originalname, fileExtension)
            .replace(/\s+/g, "-")
            .toLowerCase();

        const uniqueFileName = `${Date.now()}-${fileBaseName}${fileExtension}`;

        cb(null, uniqueFileName);
    },
});

// Middleware para recibir imágenes y documentos del chat de PQR.
export const uploadPqrAttachment = multer({
    storage: pqrAttachmentStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new Error("Solo se permiten imágenes JPG, PNG, WEBP o documentos PDF")
            );
        }

        cb(null, true);
    },
});