import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

import prisma from "../../config/client.js";

import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";

import {
  USER_INACTIVE_MESSAGE,
} from "../../services/auth/auth.service.js";

// Código que el frontend usa para cerrar la sesión de un usuario desactivado.
export const USER_INACTIVE_CODE = "USER_INACTIVE";

interface TokenPayload {
  id: number;
  email: string;
  role: Role;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Acceso denegado. Token no proporcionado.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Formato de token inválido.",
    });
  }

  let decoded: TokenPayload | null = null;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;
  } catch (error) {
    decoded = null;
  }

  if (!decoded) {
    return res.status(401).json({
      message: "Token inválido o expirado.",
    });
  }

  try {
    // Verifica en cada petición que el usuario siga existiendo y activo.
    // Así, un usuario desactivado pierde el acceso en su siguiente acción,
    // aunque su token todavía no haya vencido.
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: USER_INACTIVE_MESSAGE,
        code: USER_INACTIVE_CODE,
      });
    }

    // Usa los datos actuales de la base de datos, por si el administrador
    // cambió el correo o el rol después de iniciar sesión.
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error al validar el usuario autenticado.",
    });
  }
};