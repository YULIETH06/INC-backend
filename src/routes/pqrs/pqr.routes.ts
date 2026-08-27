import { Router } from "express";
import {
  createPqr,
  getAllPqrs,
  getMyPqrs,
  updatePqrStatus,
  getAvailablePqrsController,
  getMyAssignedPqrsController,
  takePqrController,
  updatePqrPriorityController,
  ratePqrController,
  assignPqrController,
  unassignPqrController,
} from "../../controllers/pqrs/pqr.controller.js";
import {
  authMiddleware,
  roleMiddleware,
  uploadPqrAttachment
} from "../../middlewares/index.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["USER", "AGENT"]),
  uploadPqrAttachment.single("file"),
  createPqr
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["USER", "AGENT"]),
  getMyPqrs);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getAllPqrs
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "AGENT"]),
  updatePqrStatus
);

router.patch(
  "/:id/priority",
  authMiddleware,
  roleMiddleware(["ADMIN", "AGENT"]),
  updatePqrPriorityController
);

router.patch(
  "/:id/rate",
  authMiddleware,
  roleMiddleware(["USER"]),
  ratePqrController
);

router.get(
  "/available",
  authMiddleware,
  roleMiddleware(["ADMIN", "AGENT"]),
  getAvailablePqrsController
);

router.patch(
  "/:id/take",
  authMiddleware,
  roleMiddleware(["ADMIN", "AGENT"]),
  takePqrController
);

router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  assignPqrController
);

router.patch(
  "/:id/unassign",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  unassignPqrController
);

router.get(
  "/assigned/my",
  authMiddleware,
  roleMiddleware(["ADMIN", "AGENT"]),
  getMyAssignedPqrsController
);

export default router;