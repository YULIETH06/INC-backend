import type { Response } from "express";
import {
  createPqrService,
  getMyPqrsService,
  getAllPqrsService,
  getPqrByIdService,
  updatePqrStatusService,
  getAvailablePqrsService,
  getMyAssignedPqrsService,
  takePqrService,
  getPqrWithAssignedService,
  updatePqrPriorityService,
  ratePqrService,
  assignPqrService,
  unassignPqrService,
} from "../../services/pqrs/pqr.service.js";
import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import { PqrStatus, PqrCaseType, PqrPriority } from "@prisma/client";

export const createPqr = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { caseType, description } = req.body;

    const allowedCaseTypes: PqrCaseType[] = [
      "SAP",
      "BEAS",
      "TERMINAL",
      "CORREO",
      "INTRANET",
      "SOPORTE_EQUIPOS",
      "SOPORTE_RED",
      "MI_PORTAL_SAP",
      "LEGALISAPP",
      "NUEVAS_SOLICITUDES",
    ];

    if (!caseType || !description) {
      return res.status(400).json({
        message: "El tipo de caso y la descripción son obligatorios",
      });
    }

    if (!allowedCaseTypes.includes(caseType)) {
      return res.status(400).json({
        message: "Tipo de caso no válido",
        allowedCaseTypes,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        message:
          "La descripción no puede superar los 500 caracteres",
      });
    }

    const pqr = await createPqrService({
      caseType,
      description,
      userId: req.user.id,
      file: req.file,
    });

    return res.status(201).json({
      message: "PQR creada correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear la PQR",
      error,
    });
  }
};

export const getMyPqrs = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const pqrs = await getMyPqrsService(req.user.id);

    return res.json({
      message: "PQR obtenidas correctamente",
      pqrs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las PQR",
      error,
    });
  }
};

// Admin

export const getAllPqrs = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pqrs = await getAllPqrsService();

    return res.json({
      message: "Todas las PQR obtenidas correctamente",
      pqrs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener todas las PQR",
      error,
    });
  }
};

export const updatePqrStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pqrId = Number(id);

    if (Number.isNaN(pqrId)) {
      return res.status(400).json({
        message: "El id de la PQR no es válido",
      });
    }

    const allowedStatus: PqrStatus[] = [
      "PENDIENTE",
      "EN_PROCESO",
      "CERRADA",
    ];

    if (!status) {
      return res.status(400).json({
        message: "El estado es obligatorio",
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Estado no válido",
        allowedStatus,
      });
    }

    const existingPqr = await getPqrByIdService(pqrId);

    if (!existingPqr) {
      return res.status(404).json({
        message: "La PQR no existe",
      });
    }

    const pqr = await updatePqrStatusService(
      pqrId,
      status
    );

    return res.json({
      message: "Estado de la PQR actualizado correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar el estado de la PQR",
      error,
    });
  }
};

// Obtiene las PQR que todavía no tienen responsable asignado
export const getAvailablePqrsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pqrs = await getAvailablePqrsService();

    return res.status(200).json({
      message: "PQR disponibles obtenidas correctamente",
      pqrs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las PQR disponibles",
    });
  }
};

// Permite que un AGENT tome una PQR
export const takePqrController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const agentId = req.user?.id;

    const pqrId = Number(id);

    if (isNaN(pqrId)) {
      return res.status(400).json({
        message: "El id de la PQR no es válido",
      });
    }

    if (!agentId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const pqrExists = await getPqrWithAssignedService(pqrId);

    if (!pqrExists) {
      return res.status(404).json({
        message: "La PQR no existe",
      });
    }

    if (pqrExists.assignedToId === agentId) {
      return res.status(400).json({
        message: "Esta PQR ya está asignada a ti",
      });
    }

    if (pqrExists.assignedToId) {
      return res.status(400).json({
        message: "Esta PQR ya fue tomada por otro agente",
      });
    }

    const pqr = await takePqrService(pqrId, agentId);

    if (!pqr) {
      return res.status(400).json({
        message: "No se pudo tomar la PQR. Puede que ya haya sido asignada.",
      });
    }

    return res.status(200).json({
      message: "PQR tomada correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al tomar la PQR",
    });
  }
};

// Permite que un ADMIN asigne o reasigne una PQR a un AGENT específico.
export const assignPqrController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const pqrId = Number(id);
    const cleanAgentId = Number(agentId);

    if (!pqrId || Number.isNaN(pqrId)) {
      return res.status(400).json({
        message: "El id de la PQR no es válido",
      });
    }

    if (!agentId) {
      return res.status(400).json({
        message: "El agente es obligatorio",
      });
    }

    if (!cleanAgentId || Number.isNaN(cleanAgentId)) {
      return res.status(400).json({
        message: "El id del agente no es válido",
      });
    }

    const pqr = await assignPqrService(pqrId, cleanAgentId);

    return res.status(200).json({
      message: "Responsable de la PQR actualizado correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Error al asignar o reasignar la PQR",
    });
  }
};

// Permite que un ADMIN quite el AGENT asignado de una PQR.
export const unassignPqrController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const pqrId = Number(id);

    if (!pqrId || Number.isNaN(pqrId)) {
      return res.status(400).json({
        message: "El id de la PQR no es válido",
      });
    }

    const pqr = await unassignPqrService(pqrId);

    return res.status(200).json({
      message: "PQR desasignada correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Error al desasignar la PQR",
    });
  }
};

// Obtiene las PQR asignadas al AGENT autenticado
export const getMyAssignedPqrsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const agentId = req.user?.id;

    if (!agentId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const pqrs = await getMyAssignedPqrsService(agentId);

    return res.status(200).json({
      message: "PQR asignadas obtenidas correctamente",
      pqrs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las PQR asignadas",
    });
  }
};

// Cambia la prioridad de una PQR.
export const updatePqrPriorityController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const pqrId = Number(id);

    if (Number.isNaN(pqrId)) {
      return res.status(400).json({
        message: "El id de la PQR no es válido",
      });
    }

    const allowedPriorities: PqrPriority[] = [
      "BAJA",
      "MEDIA",
      "ALTA",
      "URGENTE",
    ];

    if (!priority) {
      return res.status(400).json({
        message: "La prioridad es obligatoria",
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Prioridad no válida",
        allowedPriorities,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const existingPqr = await getPqrWithAssignedService(pqrId);

    if (!existingPqr) {
      return res.status(404).json({
        message: "La PQR no existe",
      });
    }

    if (
      req.user.role === "AGENT" &&
      existingPqr.assignedToId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Solo puedes cambiar la prioridad de las PQR asignadas a ti",
      });
    }

    if (existingPqr.status === "CERRADA") {
      return res.status(400).json({
        message: "No se puede cambiar la prioridad de una PQR cerrada",
      });
    }

    const pqr = await updatePqrPriorityService(pqrId, priority);

    return res.status(200).json({
      message: "Prioridad de la PQR actualizada correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar la prioridad de la PQR",
    });
  }
};

// Permite que un usuario califique una PQR cerrada.
export const ratePqrController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { rating, ratingComment } = req.body;

    const pqrId = Number(id);
    const ratingValue = Number(rating);

    if (Number.isNaN(pqrId)) {
      return res.status(400).json({
        message: "El id de la PQR no es válido",
      });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({
        message: "La calificación es obligatoria",
      });
    }

    if (
      Number.isNaN(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        message: "La calificación debe estar entre 1 y 5",
      });
    }

    if (ratingComment && ratingComment.trim().length > 300) {
      return res.status(400).json({
        message: "El comentario no puede superar los 300 caracteres",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const existingPqr = await getPqrByIdService(pqrId);

    if (!existingPqr) {
      return res.status(404).json({
        message: "La PQR no existe",
      });
    }

    if (existingPqr.userId !== req.user.id) {
      return res.status(403).json({
        message: "Solo puedes calificar las PQR creadas por ti",
      });
    }

    if (existingPqr.status !== "CERRADA") {
      return res.status(400).json({
        message: "Solo puedes calificar una PQR cerrada",
      });
    }

    if (existingPqr.rating !== null) {
      return res.status(400).json({
        message: "Esta PQR ya fue calificada",
      });
    }

    const pqr = await ratePqrService(pqrId, {
      rating: ratingValue,
      ratingComment: ratingComment?.trim(),
    });

    return res.status(200).json({
      message: "PQR calificada correctamente",
      pqr,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al calificar la PQR",
    });
  }
};