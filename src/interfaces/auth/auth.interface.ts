import type { Role } from "@prisma/client";
import type { Request } from "express";

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

// Datos esperados en cada fila del archivo de carga masiva.
export interface BulkRegisterUserData {
  nombre: string;
  correo: string;
  contraseña: string;
  rol: Role;
}

// Detalle de un error encontrado en una columna del archivo.
export interface BulkRegisterUserColumnError {
  column: string;
  message: string;
}

// Información de errores encontrados en una fila durante la carga masiva.
export interface BulkRegisterUserError {
  row: number;
  totalErrors: number;
  errors: BulkRegisterUserColumnError[];
}