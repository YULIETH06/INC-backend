import bcrypt from "bcryptjs";

import prisma from "../../config/client.js";

import {
    Role,
} from "@prisma/client";

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
        },
    });

    return users;
};

export const getUserByIdService = async (
    id: number
) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    return user;
};

export const updateUserRoleService = async (
    id: number,
    role: Role
) => {
    const user = await prisma.user.update({
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

    return user;
};

export const getAgentsService = async () => {
    const agents = await prisma.user.findMany({
        where: {
            role: Role.AGENT,
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
    newPassword: string
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
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

    const updatedUser = await prisma.user.update({
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

    return updatedUser;
};

// Actualiza la firma del usuario autenticado.
export const updateUserSignatureService = async (
    userId: number,
    signatureUrl: string
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

    const user = await prisma.user.update({
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

    return user;
};