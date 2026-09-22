import multer from "multer";

// Guarda el archivo Excel en memoria para leerlo desde req.file.buffer.
const excelStorage = multer.memoryStorage();

// Middleware para recibir archivos Excel de carga masiva de usuarios.
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
            return cb(
                new Error(
                    "Solo se permiten archivos Excel"
                )
            );
        }

        cb(null, true);
    },
});