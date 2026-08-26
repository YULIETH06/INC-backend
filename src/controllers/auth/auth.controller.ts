import type { Request, Response } from "express";

import type {
  AuthRequest,
} from "../../interfaces/auth/auth.interface.js";

import {
  changePasswordService,
  registerUsersBulkService,
  registerUserService,
} from "../../services/auth/auth.service.js";

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await registerUserService(req.body);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error al registrar usuario",
    });
  }
};

// Permite registrar usuarios mediante carga masiva.
export const registerUsersBulk = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Debe subir un archivo Excel",
      });
    }

    const result = await registerUsersBulkService(req.file.buffer);

    return res.status(201).json({
      message: "Carga masiva procesada correctamente",
      result,
    });
  } catch (error) {
    // Muestra el error real en consola.
    console.log("Error carga masiva:", error);

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error al procesar la carga masiva de usuarios",
    });
  }
};

// Cambia la contraseña del usuario autenticado.
export const changePassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Valida que exista un usuario autenticado.
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword.trim()
        : "";

    const newPassword =
      typeof req.body.newPassword === "string"
        ? req.body.newPassword.trim()
        : "";

    // Valida los campos obligatorios.
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "La contraseña actual y la nueva contraseña son obligatorias",
      });
    }

    // Mantiene la longitud mínima utilizada por el sistema.
    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "La nueva contraseña debe tener mínimo 6 caracteres",
      });
    }

    // Cambia la contraseña del usuario autenticado.
    await changePasswordService(
      req.user.id,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error al cambiar la contraseña",
    });
  }
};