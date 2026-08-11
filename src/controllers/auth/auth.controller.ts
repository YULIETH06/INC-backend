import type { Request, Response } from "express";
import { registerUsersBulkService, registerUserService } from "../../services/auth/auth.service.js";

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