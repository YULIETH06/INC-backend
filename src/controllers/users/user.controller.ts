import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import prisma from "../../config/client.js";

import {
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
  getAgentsService,
  resetUserPasswordService,
  updateUserSignatureService,
} from "../../services/users/user.service.js";

import type {
  AuthRequest,
} from "../../interfaces/auth/auth.interface.js";

export const getUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los usuarios",
    });
  }
};

export const getAgents = async (
  req: Request,
  res: Response
) => {
  try {
    const agents = await getAgentsService();

    return res.status(200).json({
      message: "Agentes obtenidos correctamente",
      agents,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los agentes",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son obligatorios",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        positionAssignments: {
          where: {
            isActive: true,
            endDate: null,
          },
          include: {
            position: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    const positions =
      user.positionAssignments.map(
        (assignment) => {
          return assignment.position;
        }
      );

    return res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        positions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el login",
      error,
    });
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      id,
    } = req.params;

    const {
      role,
    } = req.body;

    const userId = Number(id);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        message: "El id del usuario no es válido",
      });
    }

    if (!role) {
      return res.status(400).json({
        message: "El rol es obligatorio",
      });
    }

    const allowedRoles = [
      "USER",
      "ADMIN",
      "AGENT",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Rol no válido",
        allowedRoles,
      });
    }

    const userExists =
      await getUserByIdService(userId);

    if (!userExists) {
      return res.status(404).json({
        message: "El usuario no existe",
      });
    }

    const updatedUser =
      await updateUserRoleService(
        userId,
        role
      );

    return res.status(200).json({
      message:
        "Rol del usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al actualizar el rol del usuario",
      error,
    });
  }
};

// Permite al administrador restablecer la contraseña de un usuario.
export const resetUserPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      id,
    } = req.params;

    const {
      newPassword,
    } = req.body;

    const userId = Number(id);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        message:
          "El id del usuario no es válido",
      });
    }

    if (
      typeof newPassword !== "string" ||
      !newPassword.trim()
    ) {
      return res.status(400).json({
        message:
          "La nueva contraseña es obligatoria",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "La nueva contraseña debe tener mínimo 6 caracteres",
      });
    }

    const updatedUser =
      await resetUserPasswordService(
        userId,
        newPassword
      );

    if (!updatedUser) {
      return res.status(404).json({
        message: "El usuario no existe",
      });
    }

    return res.status(200).json({
      message:
        "Contraseña del usuario actualizada correctamente",
      user: updatedUser,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
      "La nueva contraseña debe ser diferente a la contraseña actual"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Error al actualizar la contraseña del usuario",
    });
  }
};

// Sube y guarda la firma del usuario autenticado.
export const uploadUserSignatureController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "Debes seleccionar una imagen para la firma",
      });
    }

    const signatureUrl =
      `/uploads/signatures/${req.file.filename}`;

    const user =
      await updateUserSignatureService(
        req.user.id,
        signatureUrl
      );

    return res.status(200).json({
      message: "Firma registrada correctamente",
      user,
    });
  } catch (error) {
    /*
     * Si multer ya guardó el archivo, pero luego falla la validación
     * porque el usuario ya tenía firma, se elimina el archivo nuevo.
     */
    if (req.file) {
      const filePath = path.resolve(
        req.file.path
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Error al subir la firma";

    return res.status(400).json({
      message,
    });
  }
};