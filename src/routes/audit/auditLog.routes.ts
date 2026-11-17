import {
    Router,
} from "express";

import {
    getAuditLogs,
} from "../../controllers/audit/auditLog.controller.js";

import {
    authMiddleware,
    roleMiddleware,
} from "../../middlewares/index.js";

const router = Router();

// Consulta los registros de la auditoría.
// Solo lectura: la auditoría no se puede editar ni eliminar.
router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    getAuditLogs
);

export default router;