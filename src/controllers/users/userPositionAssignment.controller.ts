import type {
  Request,
  Response,
} from "express";

import {
  USER_POSITION_ASSIGNMENT_ERRORS,
  UserPositionAssignmentRuleError,
  assignUserPositionService,
  endUserPositionAssignmentService,
  getAssignablePositionsService,
  getUserPositionAssignmentsService,
} from "../../services/users/userPositionAssignment.service.js";

// Errores que corresponden a un registro inexistente.
const notFoundErrors: string[] = [
  USER_POSITION_ASSIGNMENT_ERRORS.USER_NOT_FOUND,
  USER_POSITION_ASSIGNMENT_ERRORS.POSITION_NOT_FOUND,
];

// Errores que corresponden a una regla del negocio.
const businessErrors: string[] = [
  USER_POSITION_ASSIGNMENT_ERRORS.POSITION_INACTIVE,
  USER_POSITION_ASSIGNMENT_ERRORS.SAME_POSITION,
  USER_POSITION_ASSIGNMENT_ERRORS.NO_ACTIVE_ASSIGNMENT,
];

// Convierte un valor recibido en un id válido.
const parseId = (
  value: unknown
): number | null => {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
};

// Responde los errores conocidos del servicio.
const handleKnownError = (
  error: unknown,
  res: Response
) => {
  if (!(error instanceof Error)) {
    return null;
  }

  // Reglas del negocio con mensajes que dependen de los datos.
  if (error instanceof UserPositionAssignmentRuleError) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (notFoundErrors.includes(error.message)) {
    return res.status(404).json({
      message: error.message,
    });
  }

  if (businessErrors.includes(error.message)) {
    return res.status(400).json({
      message: error.message,
    });
  }

  return null;
};

// Obtiene los cargos activos disponibles para asignar.
export const getAssignablePositions = async (
  req: Request,
  res: Response
) => {
  try {
    const positions =
      await getAssignablePositionsService();

    return res.status(200).json({
      message:
        "Cargos obtenidos correctamente",
      positions,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al obtener los cargos disponibles",
    });
  }
};

// Obtiene el cargo actual y el historial de cargos de un usuario.
export const getUserPositionAssignments = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = parseId(
      req.params.id
    );

    if (!userId) {
      return res.status(400).json({
        message:
          "El id del usuario no es válido",
      });
    }

    const result =
      await getUserPositionAssignmentsService(
        userId
      );

    return res.status(200).json({
      message:
        "Cargos del usuario obtenidos correctamente",
      ...result,
    });
  } catch (error) {
    const knownErrorResponse =
      handleKnownError(error, res);

    if (knownErrorResponse) {
      return knownErrorResponse;
    }

    return res.status(500).json({
      message:
        "Error al obtener los cargos del usuario",
    });
  }
};

// Asigna o cambia el cargo de un usuario.
export const assignUserPosition = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = parseId(
      req.params.id
    );

    if (!userId) {
      return res.status(400).json({
        message:
          "El id del usuario no es válido",
      });
    }

    if (
      req.body?.positionId === undefined ||
      req.body?.positionId === null ||
      req.body?.positionId === ""
    ) {
      return res.status(400).json({
        message:
          "El cargo es obligatorio",
      });
    }

    const positionId = parseId(
      req.body.positionId
    );

    if (!positionId) {
      return res.status(400).json({
        message:
          "El id del cargo no es válido",
      });
    }

    const assignment =
      await assignUserPositionService(
        userId,
        positionId
      );

    return res.status(201).json({
      message:
        "Cargo asignado correctamente",
      assignment,
    });
  } catch (error) {
    const knownErrorResponse =
      handleKnownError(error, res);

    if (knownErrorResponse) {
      return knownErrorResponse;
    }

    return res.status(500).json({
      message:
        "Error al asignar el cargo al usuario",
    });
  }
};

// Retira el cargo activo de un usuario.
export const endUserPositionAssignment = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = parseId(
      req.params.id
    );

    if (!userId) {
      return res.status(400).json({
        message:
          "El id del usuario no es válido",
      });
    }

    await endUserPositionAssignmentService(
      userId
    );

    return res.status(200).json({
      message:
        "Cargo retirado correctamente",
    });
  } catch (error) {
    const knownErrorResponse =
      handleKnownError(error, res);

    if (knownErrorResponse) {
      return knownErrorResponse;
    }

    return res.status(500).json({
      message:
        "Error al retirar el cargo del usuario",
    });
  }
};
