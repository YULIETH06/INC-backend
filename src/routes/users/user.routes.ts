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