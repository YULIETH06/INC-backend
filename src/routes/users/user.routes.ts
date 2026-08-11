import { Router } from "express";

import {
  getUsers,
  getAgents,
  loginUser,
  updateUserRole,
  uploadUserSignatureController,
} from "../../controllers/users/user.controller.js";
import { authMiddleware, roleMiddleware, uploadUserSignature } from "../../middlewares/index.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), getUsers);

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

router.patch(
  "/signature",
  authMiddleware,
  uploadUserSignature.single("signature"),
  uploadUserSignatureController
);

router.post("/login", loginUser);

export default router;