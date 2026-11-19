import { Router } from "express";

import {
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
} from "../../controllers/auth/auth.controller.js";

import {
  authMiddleware,
} from "../../middlewares/index.js";

const router = Router();

// Registra un usuario individual.
router.post(
  "/register",
  registerUser
);

// Autentica un usuario y genera su token de acceso.
router.post(
  "/login",
  loginUser
);

// Cambia la contraseña del usuario autenticado.
router.patch(
  "/password",
  authMiddleware,
  changePassword
);

// Registra el cierre de sesión del usuario autenticado.
router.post(
  "/logout",
  authMiddleware,
  logoutUser
);

export default router;