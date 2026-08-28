import type { Role } from "@prisma/client";

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