import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../../config/client.js";

import type {
  RegisterUserData,
} from "../../interfaces/auth/auth.interface.js";

import {
  containsOnlyLetters,
  isValidEmail,
} from "../../utils/validators.js";

// Mensaje para un usuario desactivado que intenta usar el sistema.
export const USER_INACTIVE_MESSAGE =
  "Tu usuario está desactivado. Comunícate con el administrador.";

// Registra un usuario individual.
export const registerUserService = async ({
  name,
  email,
  password,
}: RegisterUserData) => {
  // Limpia espacios y normaliza los datos.
  const cleanName = name?.trim();
  const cleanEmail = email
    ?.trim()
    .toLowerCase();
  const cleanPassword =
    password?.trim();

  if (
    !cleanName ||
    !cleanEmail ||
    !cleanPassword
  ) {
    throw new Error(
      "Todos los campos son obligatorios"
    );
  }

  if (
    !containsOnlyLetters(cleanName)
  ) {
    throw new Error(
      "El nombre solo puede contener letras"
    );
  }

  if (cleanName.length < 3) {
    throw new Error(
      "El nombre debe tener mínimo 3 caracteres"
    );
  }

  if (!isValidEmail(cleanEmail)) {
    throw new Error(
      "El correo electrónico no tiene un formato válido"
    );
  }

  if (cleanPassword.length < 6) {
    throw new Error(
      "La contraseña debe tener mínimo 6 caracteres"
    );
  }

  // Comprueba si el correo ya pertenece a un usuario activo.
  // El correo de un usuario desactivado sí puede volver a registrarse.
  const userExists =
    await prisma.user.findUnique({
      where: {
        activeEmail: cleanEmail,
      },
      select: {
        id: true,
      },
    });

  if (userExists) {
    throw new Error(
      "El usuario ya existe"
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      cleanPassword,
      10
    );

  // Crea el usuario y retorna únicamente
  // los datos seguros necesarios para la respuesta.
  const user =
    await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        activeEmail: cleanEmail,
        password:
          hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return user;
};

// Autentica un usuario y genera su token de acceso.
export const loginUserService = async (
  email: string,
  password: string
) => {
  const cleanEmail =
    email?.trim() ?? "";

  // Solo los usuarios activos tienen correo activo, por lo que
  // un usuario desactivado no puede iniciar sesión.
  const user = await prisma.user.findUnique({
    where: {
      activeEmail: cleanEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      positionAssignments: {
        where: {
          isActive: true,
          endDate: null,
        },
        select: {
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
    // Si las credenciales corresponden a un usuario desactivado,
    // se informa el motivo en lugar de un error genérico.
    const inactiveUser =
      await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          isActive: false,
        },
        select: {
          password: true,
        },
        orderBy: {
          deactivatedAt: "desc",
        },
      });

    if (
      inactiveUser &&
      await bcrypt.compare(
        password,
        inactiveUser.password
      )
    ) {
      throw new Error(
        USER_INACTIVE_MESSAGE
      );
    }

    throw new Error(
      "Credenciales inválidas"
    );
  }

  // Verifica la contraseña almacenada.
  const validPassword =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!validPassword) {
    throw new Error(
      "Credenciales inválidas"
    );
  }

  // Genera el token JWT del usuario autenticado.
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

  // Obtiene únicamente los cargos activos.
  const positions =
    user.positionAssignments.map(
      (assignment) =>
        assignment.position
    );

  return {
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
  };
};

// Cambia la contraseña del usuario autenticado.
export const changePasswordService = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  // Busca únicamente los datos necesarios
  // para validar la contraseña.
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

  if (!user) {
    throw new Error(
      "El usuario no existe"
    );
  }

  // Verifica que la contraseña actual sea correcta.
  const isCurrentPasswordValid =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!isCurrentPasswordValid) {
    throw new Error(
      "La contraseña actual es incorrecta"
    );
  }

  // Evita utilizar nuevamente la misma contraseña.
  const isSamePassword =
    await bcrypt.compare(
      newPassword,
      user.password
    );

  if (isSamePassword) {
    throw new Error(
      "La nueva contraseña debe ser diferente a la contraseña actual"
    );
  }

  // Encripta la nueva contraseña antes de almacenarla.
  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password:
        hashedPassword,
    },
  });
};