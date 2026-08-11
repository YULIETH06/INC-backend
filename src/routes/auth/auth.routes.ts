import { Router } from "express";
import {
  registerUser,
  registerUsersBulk,
} from "../../controllers/auth/auth.controller.js";
import {
  authMiddleware,
  roleMiddleware,
  uploadExcel
} from "../../middlewares/index.js";

const router = Router();

router.post("/register", registerUser);

// Registra usuarios mediante carga masiva desde archivo Excel.
router.post(
  "/register/bulk",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  uploadExcel.single("file"),
  registerUsersBulk
);

export default router;