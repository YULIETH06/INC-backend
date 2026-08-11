import { Router } from "express";

import userRoutes from "./users/user.routes.js";
import profileRoutes from "./users/profile.routes.js";
import pqrRoutes from "./pqrs/pqr.routes.js";
import authRoutes from "./auth/auth.routes.js";
import pqrMessageRoutes from "./pqrs/pqrMessage.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";

import cityRoutes from "./common/city.routes.js";
import identificationTypeRoutes from "./common/identificationType.routes.js";

import departmentRoutes from "./humanTalent/department.routes.js";
import personnelRequisitionRoutes from "./humanTalent/personnelRequisition.routes.js";
import personnelHiringConfirmationRoutes from "./humanTalent/personnelHiringConfirmation.routes.js";
import personnelRequisitionCandidateRoutes from "./humanTalent/personnelRequisitionCandidate.routes.js";

import positionProfileRoutes from "./positionManagement/positionProfile.routes.js";
import positionProfileRevisionRoutes from "./positionManagement/positionProfileRevision.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "API funcionando correctamente",
  });
});

// Usuarios y autenticación.
router.use("/users", userRoutes);
router.use("/profile", profileRoutes);
router.use("/auth", authRoutes);

// PQR.
router.use("/pqrs", pqrRoutes);
router.use("/", pqrMessageRoutes);

// Notificaciones.
router.use("/notifications", notificationRoutes);

// Recursos comunes.
router.use("/common/cities", cityRoutes);

router.use(
    "/common/identification-types",
    identificationTypeRoutes
);

// Talento Humano.
router.use(
  "/human-talent/departments",
  departmentRoutes
);

router.use(
  "/human-talent/requisitions",
  personnelRequisitionRoutes
);

router.use(
  "/human-talent",
  personnelHiringConfirmationRoutes
);

router.use(
  "/human-talent/requisitions",
  personnelRequisitionCandidateRoutes
);

// Gestión de cargos.
router.use(
  "/position-management/position-profiles",
  positionProfileRoutes
);

router.use(
  "/position-management/position-profiles",
  positionProfileRevisionRoutes
);

export default router;