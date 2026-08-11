import fs from "fs";
import path from "path";
import multer from "multer";

const signatureUploadPath = "uploads/signatures";

// Crea la carpeta de firmas si todavía no existe.
if (!fs.existsSync(signatureUploadPath)) {
    fs.mkdirSync(signatureUploadPath, {
        recursive: true,
    });
}

// Guarda las firmas de usuarios en una carpeta local del backend.
const signatureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Crea la carpeta si fue eliminada mientras el servidor estaba activo.
        if (!fs.existsSync(signatureUploadPath)) {
            fs.mkdirSync(signatureUploadPath, {
                recursive: true,
            });
        }

        cb(null, signatureUploadPath);
    },

    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);

        const uniqueFileName = `signature-${Date.now()}${fileExtension}`;

        cb(null, uniqueFileName);
    },
});

// Middleware para recibir imágenes de firmas de usuarios.
export const uploadUserSignature = multer({
    storage: signatureStorage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new Error("Solo se permiten imágenes JPG, PNG o WEBP")
            );
        }

        cb(null, true);
    },
});