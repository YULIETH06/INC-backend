import bcrypt from "bcryptjs";

import prisma from "../../config/client.js";

import {
    Role,
} from "@prisma/client";

import {
    createAuditLog,
} from "../../helpers/audit/auditLog.helper.js";

import {
    AUDIT_ACTIONS,
    AUDIT_MODULES,
} from "../../constants/audit/auditLog.constants.js";

import type {
    AuditActor,
} from "../../interfaces/audit/auditLog.interface.js";

// Nombre legible de cada rol para la auditoría.
const roleLabels: Record<Role, string> = {
    ADMIN: "Administrador",
    AGENT: "Agente",
    USER: "Usuario",
};

export const getAllUsersService = async () => {
    const users = await prisma.user.findMany({
        orderBy: {
            id: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            signatureUrl: true,
            isActive: true,
            deactivatedAt: true,

            // Cargo activo del usuario.
            positionAssignments: {
                where: {
                    isActive: true,
                    endDate: null,
                },
                orderBy: {
                    startDate: "desc",
                },
                take: 1,
                select: {
                    id: true,
                    startDate: true,
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

    // Devuelve el cargo activo como un objeto en lugar de una lista.
    return users.map(
        ({
            positionAssignments,
            ...user
        }) => ({
            ...user,
            currentPosition:
                positionAssignments[0] ?? null,
        })
    );
};

// Consulta la existencia de un usuario mediante su identificador.
export const getUserByIdService = async (
    id: number
) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    return user;
};

export const updateUserRoleService = async (
    id: number,
    role: Role,
    auditActor: AuditActor
) => {
    return prisma.$transaction(async (tx) => {
        // Rol anterior, para registrar el cambio.
        const currentUser = await tx.user.findUnique({
            where: {
                id,
            },
            select: {
                name: true,
                role: true,
            },
        });

        const user = await tx.user.update({
            where: {
                id,
            },
            data: {
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        // Solo se registra si el rol realmente cambió.
        if (
            currentUser &&
            currentUser.role !== role
        ) {
            await createAuditLog(tx, {
                actor: auditActor,
                module: AUDIT_MODULES.USERS,
                action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
                entityType: "User",
                entityId: id,
                description: `${currentUser.name}: ${roleLabels[currentUser.role]} → ${roleLabels[role]}`,
            });
        }

        return user;
    });
};

export const getAgentsService = async () => {
    // Solo los agentes activos pueden recibir PQR.
    const agents = await prisma.user.findMany({
        where: {
            role: Role.AGENT,
            isActive: true,
        },
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            signatureUrl: true,
        },
    });

    return agents;
};

// Restablece la contraseña de un usuario desde la administración.
export const resetUserPasswordService = async (
    userId: number,
    newPassword: string,
    auditActor: AuditActor
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            password: true,
        },
    });

    if (!user) {
        return null;
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new Error(
            "La nueva contraseña debe ser diferente a la contraseña actual"
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    return prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        await createAuditLog(tx, {
            actor: auditActor,
            module: AUDIT_MODULES.USERS,
            action: AUDIT_ACTIONS.USER_PASSWORD_RESET,
            entityType: "User",
            entityId: userId,
            description: `Restableció la contraseña de ${user.name}`,
        });

        return updatedUser;
    });
};

// Obtiene la firma registrada del usuario autenticado.
export const getUserSignatureService = async (
    userId: number
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            signatureUrl: true,
        },
    });

    if (!user) {
        throw new Error("El usuario no existe");
    }

    return user.signatureUrl;
};

// Actualiza la firma del usuario autenticado.
export const updateUserSignatureService = async (
    userId: number,
    signatureUrl: string,
    auditActor: AuditActor
) => {
    const currentUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            signatureUrl: true,
        },
    });

    if (!currentUser) {
        throw new Error("El usuario no existe");
    }

    if (currentUser.signatureUrl) {
        throw new Error(
            "El usuario ya tiene una firma registrada"
        );
    }

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                signatureUrl,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                signatureUrl: true,
            },
        });

        await createAuditLog(tx, {
            actor: auditActor,
            module: AUDIT_MODULES.USERS,
            action: AUDIT_ACTIONS.USER_SIGNATURE_UPDATED,
            entityType: "User",
            entityId: userId,
            description: "Registró su firma",
        });

        return user;
    });
};