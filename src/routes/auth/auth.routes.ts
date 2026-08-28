import { Router } from "express";

import {
  changePassword,
  loginUser,
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

export default router;