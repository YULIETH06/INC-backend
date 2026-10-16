import {
  Router,
} from "express";

import {
  getUsers,
  getAgents,
  updateUserRole,
  resetUserPassword,
  uploadUserSignatureController,
} from "../../controllers/users/user.controller.js";

import {
  registerUsersBulk,
} from "../../controllers/users/userBulk.controller.js";

import {
  getAssignablePositions,
  getUserPositionAssignments,
  assignUserPosition,
  endUserPositionAssignment,
} from "../../controllers/users/userPositionAssignment.controller.js";

import {
  authMiddleware,
  roleMiddleware,
  uploadExcel,
  uploadUserSignature,
} from "../../middlewares/index.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getUsers
);

router.get(
  "/agents",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getAgents
);

// Registra usuarios mediante carga masiva desde archivo Excel.
// Esta operación pertenece a la administración de usuarios.
router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  uploadExcel.single("file"),
  registerUsersBulk
);

// Obtiene los cargos activos disponibles para asignar a un usuario.
router.get(
  "/position-assignments/positions",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getAssignablePositions
);

// Obtiene el cargo actual y el historial de cargos de un usuario.
router.get(
  "/:id/position-assignments",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getUserPositionAssignments
);

// Asigna o cambia el cargo de un usuario.
router.post(
  "/:id/position-assignments",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  assignUserPosition
);

// Retira el cargo activo de un usuario.
router.patch(
  "/:id/position-assignments/current/end",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  endUserPositionAssignment
);

router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateUserRole
);

// Solo ADMIN puede restablecer la contraseña de otro usuario.
router.patch(
  "/:id/password",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  resetUserPassword
);

router.patch(
  "/signature",
  authMiddleware,
  uploadUserSignature.single("signature"),
  uploadUserSignatureController
);

export default router;