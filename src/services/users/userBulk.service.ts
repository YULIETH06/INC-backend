import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import { Role } from "@prisma/client";

import prisma from "../../config/client.js";

import type {
    BulkRegisterUserColumnError,
    BulkRegisterUserData,
    BulkRegisterUserError,
} from "../../interfaces/users/userBulk.interface.js";

import {
    containsOnlyLetters,
    isValidEmail,
} from "../../utils/validators.js";

// Valida que el archivo Excel tenga las columnas requeridas.
const validateBulkUserColumns = (
    sheet: XLSX.WorkSheet
) => {
    const rows = XLSX.utils.sheet_to_json<string[]>(
        sheet,
        {
            header: 1,
        }
    );

    const headers = rows[0];

    if (!headers || headers.length === 0) {
        throw new Error(
            "El archivo Excel no contiene encabezados"
        );
    }

    const normalizedHeaders = headers.map(
        (header) =>
            String(header)
                .trim()
                .toLowerCase()
    );

    const requiredColumns = [
        "nombre",
        "correo",
        "contraseña",
        "rol",
    ];

    const missingColumns = requiredColumns.filter(
        (column) =>
            !normalizedHeaders.includes(column)
    );

    if (missingColumns.length > 0) {
        throw new Error(
            `El archivo Excel no tiene las columnas requeridas: ${missingColumns.join(
                ", "
            )}. Las columnas obligatorias son: nombre, correo, contraseña y rol.`
        );
    }
};

// Calcula la cantidad real de errores encontrados
// en todas las filas procesadas.
const getTotalBulkErrors = (
    errors: BulkRegisterUserError[]
) => {
    return errors.reduce(
        (total, error) =>
            total + error.totalErrors,
        0
    );
};

// Registra usuarios mediante carga masiva
// desde un archivo Excel.
export const registerUsersBulkService = async (
    fileBuffer: Buffer
) => {
    const workbook = XLSX.read(fileBuffer, {
        type: "buffer",
    });

    // Valida que el archivo tenga al menos una hoja.
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error(
            "El archivo Excel no contiene hojas"
        );
    }

    // Obtiene la primera hoja del archivo.
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        throw new Error(
            "No se pudo leer la hoja del archivo Excel"
        );
    }

    // Valida las columnas requeridas.
    validateBulkUserColumns(sheet);

    // Convierte la hoja en un arreglo de objetos.
    const users =
        XLSX.utils.sheet_to_json<BulkRegisterUserData>(
            sheet
        );

    if (users.length === 0) {
        throw new Error(
            "El archivo Excel no contiene usuarios para registrar"
        );
    }

    const errors: BulkRegisterUserError[] = [];

    const validUsers: Array<
        BulkRegisterUserData & {
            rowNumber: number;
        }
    > = [];

    const emailsInFile = new Set<string>();

    // Primera fase:
    // valida completamente el archivo antes de registrar.
    for (const [index, userData] of users.entries()) {
        const rowNumber = index + 2;

        const rowErrors: BulkRegisterUserColumnError[] =
            [];

        const cleanName =
            userData.nombre?.trim();

        const cleanEmail =
            userData.correo
                ?.trim()
                .toLowerCase();

        const password = String(
            userData.contraseña ?? ""
        );

        const role = String(
            userData.rol ?? ""
        )
            .trim()
            .toUpperCase() as Role;

        // Valida campos obligatorios.
        if (!cleanName) {
            rowErrors.push({
                column: "nombre",
                message:
                    "El nombre es obligatorio",
            });
        }

        if (!cleanEmail) {
            rowErrors.push({
                column: "correo",
                message:
                    "El correo electrónico es obligatorio",
            });
        }

        if (!password) {
            rowErrors.push({
                column: "contraseña",
                message:
                    "La contraseña es obligatoria",
            });
        }

        if (!role) {
            rowErrors.push({
                column: "rol",
                message:
                    "El rol es obligatorio",
            });
        }

        // Valida nombre.
        if (
            cleanName &&
            !containsOnlyLetters(cleanName)
        ) {
            rowErrors.push({
                column: "nombre",
                message:
                    "El nombre solo puede contener letras",
            });
        }

        if (
            cleanName &&
            cleanName.length < 3
        ) {
            rowErrors.push({
                column: "nombre",
                message:
                    "El nombre debe tener mínimo 3 caracteres",
            });
        }

        // Valida correo.
        if (
            cleanEmail &&
            !isValidEmail(cleanEmail)
        ) {
            rowErrors.push({
                column: "correo",
                message:
                    "El correo electrónico no tiene un formato válido",
            });
        }

        // Valida contraseña.
        if (
            password &&
            password.length < 6
        ) {
            rowErrors.push({
                column: "contraseña",
                message:
                    "La contraseña debe tener mínimo 6 caracteres",
            });
        }

        // Valida rol.
        if (
            role &&
            !Object.values(Role).includes(role)
        ) {
            rowErrors.push({
                column: "rol",
                message:
                    "Rol no válido. Los roles permitidos son USER, ADMIN y AGENT",
            });
        }

        // Valida correos duplicados dentro del archivo.
        if (
            cleanEmail &&
            isValidEmail(cleanEmail)
        ) {
            if (
                emailsInFile.has(cleanEmail)
            ) {
                rowErrors.push({
                    column: "correo",
                    message:
                        "Correo duplicado dentro del archivo",
                });
            } else {
                emailsInFile.add(cleanEmail);
            }
        }

        // Si la fila tiene errores, se registra
        // la información del error y no continúa.
        if (rowErrors.length > 0) {
            errors.push({
                row: rowNumber,
                totalErrors:
                    rowErrors.length,
                errors: rowErrors,
            });

            continue;
        }

        // Guarda temporalmente los usuarios válidos.
        validUsers.push({
            rowNumber,
            nombre: cleanName,
            correo: cleanEmail,
            contraseña: password,
            rol: role,
        });
    }

    // Si existe cualquier error de validación,
    // no se registra ningún usuario.
    if (errors.length > 0) {
        return {
            totalRows: users.length,
            totalCreated: 0,
            totalRowsWithErrors:
                errors.length,
            totalErrors:
                getTotalBulkErrors(errors),
            createdUsers: [],
            errors,
            message:
                "El archivo contiene errores. Corrige la información y vuelve a subirlo.",
        };
    }

    // Consulta los correos que ya existen
    // en la base de datos.
    const existingUsers =
        await prisma.user.findMany({
            where: {
                email: {
                    in: validUsers.map(
                        (user) =>
                            user.correo
                    ),
                },
            },
            select: {
                email: true,
            },
        });

    const existingEmails = new Set(
        existingUsers.map(
            (user) => user.email
        )
    );

    // Valida usuarios existentes.
    validUsers.forEach((user) => {
        if (
            existingEmails.has(user.correo)
        ) {
            errors.push({
                row: user.rowNumber,
                totalErrors: 1,
                errors: [
                    {
                        column: "correo",
                        message:
                            "El usuario ya existe",
                    },
                ],
            });
        }
    });

    // Si existe algún usuario previamente registrado,
    // no se realiza la carga.
    if (errors.length > 0) {
        return {
            totalRows: users.length,
            totalCreated: 0,
            totalRowsWithErrors:
                errors.length,
            totalErrors:
                getTotalBulkErrors(errors),
            createdUsers: [],
            errors,
            message:
                "El archivo contiene errores. Corrige la información y vuelve a subirlo.",
        };
    }

    // Segunda fase:
    // prepara todos los usuarios para su creación.
    const usersToCreate =
        await Promise.all(
            validUsers.map(
                async (user) => {
                    const hashedPassword =
                        await bcrypt.hash(
                            user.contraseña,
                            10
                        );

                    return {
                        name: user.nombre,
                        email: user.correo,
                        password:
                            hashedPassword,
                        role: user.rol,
                    };
                }
            )
        );

    // Registra todos los usuarios
    // en una sola operación.
    await prisma.user.createMany({
        data: usersToCreate,
    });

    // Consulta los usuarios creados
    // seleccionando únicamente datos seguros.
    const createdUsers =
        await prisma.user.findMany({
            where: {
                email: {
                    in: validUsers.map(
                        (user) =>
                            user.correo
                    ),
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

    return {
        totalRows: users.length,
        totalCreated:
            createdUsers.length,
        totalRowsWithErrors: 0,
        totalErrors: 0,
        createdUsers,
        errors: [],
        message:
            "Todos los usuarios fueron registrados correctamente.",
    };
};