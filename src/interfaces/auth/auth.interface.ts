import type { Role } from "@prisma/client";
import type { Request } from "express";

// Extiende Request para incluir el usuario autenticado.
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
  };
}

// Datos necesarios para registrar un usuario.
export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}