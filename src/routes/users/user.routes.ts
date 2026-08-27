import {
  Router,
} from "express";

import {
  getUsers,
  getAgents,
  loginUser,
  updateUserRole,
  resetUserPassword,
  uploadUserSignatureController,
} from "../../controllers/users/user.controller.js";

import {
  authMiddleware,
  roleMiddleware,
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

router.post(
  "/login",
  loginUser
);

export default router;