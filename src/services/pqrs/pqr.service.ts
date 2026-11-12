import prisma from "../../config/client.js";
import type { CreatePqrData, RatePqrData } from "../../interfaces/pqrs/pqr.interface.js";
import { PqrPriority, PqrStatus, Role } from "@prisma/client";
import { buildPqrAttachmentData } from "./pqrAttachment.service.js";
import {
  notifyAdminsAndAgentsAboutNewPqrService,
  notifyAdminsAboutTakenPqrService,
  notifyUserAboutClosedPqrService,
  notifyUserAboutTakenPqrService,
  notifyAboutRatedPqrService,
  notifyAgentAboutAssignedPqrService,
  notifyAgentAboutUnassignedPqrService,
} from "../notifications/pqrs/pqrNotification.service.js";

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

import {
  PQR_CASE_TYPE_LABELS,
  PQR_PRIORITY_LABELS,
  PQR_STATUS_LABELS,
} from "../../constants/pqrs/pqr.constants.js";

// Cuenta los mensajes no revisados de una PQR para un usuario específico.
const getUnreadMessagesCount = async (
  pqrId: number,
  userId: number
) => {
  const chatRead = await prisma.pqrChatRead.findUnique({
    where: {
      pqrId_userId: {
        pqrId,
        userId,
      },
    },
  });

  const unreadMessagesCount = await prisma.pqrMessage.count({
    where: {
      pqrId,
      senderId: {
        not: userId,
      },
      ...(chatRead && {
        createdAt: {
          gt: chatRead.lastReadAt,
        },
      }),
    },
  });

  return unreadMessagesCount;
};

// Agrega el contador de mensajes no revisados a cada PQR.
const addUnreadMessagesCountToPqrs = async <T extends { id: number }>(
  pqrs: T[],
  userId: number
) => {
  const pqrsWithUnreadCount = await Promise.all(
    pqrs.map(async (pqr) => ({
      ...pqr,
      unreadMessagesCount: await getUnreadMessagesCount(pqr.id, userId),
    }))
  );

  return pqrsWithUnreadCount;
};

// Crea una nueva PQR asociada al usuario autenticado
export const createPqrService = async (
  {
    caseType,
    description,
    userId,
    file,
  }: CreatePqrData,
  auditActor: AuditActor
) => {
  const pqr = await prisma.$transaction(async (tx) => {
    const createdPqr = await tx.pQR.create({
      data: {
        caseType,
        description,
        userId,
      },
      include: {
        // usuario que creó la PQR
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Crea siempre el primer mensaje del chat con la descripción de la PQR.
    await tx.pqrMessage.create({
      data: {
        content: description,
        pqrId: createdPqr.id,
        senderId: userId,

        // Si el usuario adjunta archivo, se asocia al primer mensaje.
        ...(file && {
          attachments: {
            create: buildPqrAttachmentData({
              file,
            }),
          },
        }),
      },
    });

    await createAuditLog(tx, {
      actor: auditActor,
      module: AUDIT_MODULES.PQRS,
      action: AUDIT_ACTIONS.PQR_CREATED,
      entityType: "PQR",
      entityId: createdPqr.id,
      description: `PQR #${createdPqr.id} – ${PQR_CASE_TYPE_LABELS[caseType]}`,
    });

    return createdPqr;
  });

  // Notifica a ADMIN y AGENT que existe una nueva PQR
  await notifyAdminsAndAgentsAboutNewPqrService(
    pqr.id,
    pqr.user.name,
    pqr.user.email
  );

  return pqr;
};

export const getMyPqrsService = async (userId: number) => {
  const pqrs = await prisma.pQR.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return addUnreadMessagesCountToPqrs(pqrs, userId);
};

export const getPqrByIdService = async (id: number) => {
  const pqr = await prisma.pQR.findUnique({
    where: {
      id,
    },
  });

  return pqr;
};

export const getAllPqrsService = async () => {
  const pqrs = await prisma.pQR.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return pqrs;
};

// Cambia el estado de una PQR
export const updatePqrStatusService = async (
  id: number,
  status: PqrStatus,
  auditActor: AuditActor
) => {
  const currentPqr = await prisma.pQR.findUnique({
    where: {
      id,
    },
  });

  if (!currentPqr) {
    return null;
  }

  const pqr = await prisma.$transaction(async (tx) => {
    const updatedPqr = await tx.pQR.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    // Solo se registra si el estado realmente cambió.
    if (currentPqr.status !== status) {
      await createAuditLog(tx, {
        actor: auditActor,
        module: AUDIT_MODULES.PQRS,
        action: AUDIT_ACTIONS.PQR_STATUS_CHANGED,
        entityType: "PQR",
        entityId: id,
        description: `PQR #${id}: ${PQR_STATUS_LABELS[currentPqr.status]} → ${PQR_STATUS_LABELS[status]}`,
      });
    }

    return updatedPqr;
  });

  // Notifica al USER solo cuando la PQR cambia a CERRADA
  if (currentPqr.status !== "CERRADA" && pqr.status === "CERRADA") {
    await notifyUserAboutClosedPqrService(
      pqr.userId,
      pqr.id
    );
  }

  return pqr;
};

// Obtiene las PQR que todavía no tienen responsable asignado
export const getAvailablePqrsService = async () => {
  const pqrs = await prisma.pQR.findMany({
    where: {
      assignedToId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return pqrs;
};

// Permite que un AGENT tome una PQR sin cambiar su estado
export const takePqrService = async (
  pqrId: number,
  agentId: number,
  auditActor: AuditActor
) => {
  const pqr = await prisma.$transaction(async (tx) => {
    const result = await tx.pQR.updateMany({
      where: {
        id: pqrId,
        assignedToId: null,
      },
      data: {
        assignedToId: agentId,
      },
    });

    if (result.count === 0) {
      return null;
    }

    await createAuditLog(tx, {
      actor: auditActor,
      module: AUDIT_MODULES.PQRS,
      action: AUDIT_ACTIONS.PQR_TAKEN,
      entityType: "PQR",
      entityId: pqrId,
      description: `Tomó la PQR #${pqrId}`,
    });

    return tx.pQR.findUnique({
      where: {
        id: pqrId,
      },
      include: {
        // usuario que creó la PQR
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        // agente que tomó la PQR
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  });

  if (!pqr || !pqr.assignedTo) {
    return null;
  }

  // Notifica a los ADMIN qué agente tomó la PQR
  await notifyAdminsAboutTakenPqrService(
    pqr.id,
    pqr.assignedTo.name,
    pqr.assignedTo.email,
    pqr.user.name,
    pqr.user.email,
    agentId
  );

  // Notifica al USER que su PQR ya está siendo atendida
  await notifyUserAboutTakenPqrService(
    pqr.user.id,
    pqr.id
  );

  return pqr;
};

// Permite que un ADMIN asigne o reasigne una PQR a un AGENT específico.
export const assignPqrService = async (
  pqrId: number,
  agentId: number,
  auditActor: AuditActor
) => {
  const pqrExists = await prisma.pQR.findUnique({
    where: {
      id: pqrId,
    },
    include: {
      assignedTo: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!pqrExists) {
    throw new Error("La PQR no existe");
  }

  if (pqrExists.status === PqrStatus.CERRADA) {
    throw new Error("No se puede asignar o reasignar una PQR cerrada");
  }

  const agent = await prisma.user.findUnique({
    where: {
      id: agentId,
    },
  });

  if (!agent) {
    throw new Error("El agente no existe");
  }

  if (agent.role !== Role.AGENT) {
    throw new Error("El usuario seleccionado no tiene rol AGENT");
  }

  if (!agent.isActive) {
    throw new Error("El agente seleccionado está desactivado");
  }

  const previousAgentId = pqrExists.assignedToId;

  const pqr = await prisma.$transaction(async (tx) => {
    const updatedPqr = await tx.pQR.update({
      where: {
        id: pqrId,
      },
      data: {
        assignedToId: agentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Solo se registra si el agente realmente cambió.
    if (previousAgentId !== agentId) {
      await createAuditLog(tx, {
        actor: auditActor,
        module: AUDIT_MODULES.PQRS,
        action: AUDIT_ACTIONS.PQR_AGENT_ASSIGNED,
        entityType: "PQR",
        entityId: pqrId,
        description: pqrExists.assignedTo
          ? `PQR #${pqrId} reasignada de ${pqrExists.assignedTo.name} a ${agent.name}`
          : `PQR #${pqrId} asignada a ${agent.name}`,
      });
    }

    return updatedPqr;
  });

  // Notifica al nuevo AGENT que recibió la PQR.
  await notifyAgentAboutAssignedPqrService(
    agentId,
    pqr.id
  );

  // Si antes no tenía agente, se notifica al USER igual que cuando un agente toma la PQR.
  if (!previousAgentId) {
    await notifyUserAboutTakenPqrService(
      pqr.userId,
      pqr.id
    );
  }

  // Si tenía otro agente, se notifica al agente anterior que ya no tiene esa PQR.
  if (previousAgentId && previousAgentId !== agentId) {
    await notifyAgentAboutUnassignedPqrService(
      previousAgentId,
      pqr.id
    );
  }

  return pqr;
};

// Permite que un ADMIN quite el AGENT asignado de una PQR.
export const unassignPqrService = async (
  pqrId: number,
  auditActor: AuditActor
) => {
  const pqrExists = await prisma.pQR.findUnique({
    where: {
      id: pqrId,
    },
    include: {
      assignedTo: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!pqrExists) {
    throw new Error("La PQR no existe");
  }

  if (pqrExists.status === PqrStatus.CERRADA) {
    throw new Error("No se puede desasignar una PQR cerrada");
  }

  if (!pqrExists.assignedToId) {
    throw new Error("La PQR no tiene agente asignado");
  }

  const previousAgentId = pqrExists.assignedToId;

  const pqr = await prisma.$transaction(async (tx) => {
    const updatedPqr = await tx.pQR.update({
      where: {
        id: pqrId,
      },
      data: {
        assignedToId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await createAuditLog(tx, {
      actor: auditActor,
      module: AUDIT_MODULES.PQRS,
      action: AUDIT_ACTIONS.PQR_AGENT_UNASSIGNED,
      entityType: "PQR",
      entityId: pqrId,
      description: `Quitó a ${pqrExists.assignedTo?.name ?? "el agente"} de la PQR #${pqrId}`,
    });

    return updatedPqr;
  });

  // Notifica al AGENT que fue retirado de la PQR.
  await notifyAgentAboutUnassignedPqrService(
    previousAgentId,
    pqr.id
  );

  return pqr;
};

// Obtiene las PQR asignadas al AGENT autenticado
export const getMyAssignedPqrsService = async (agentId: number) => {
  const pqrs = await prisma.pQR.findMany({
    where: {
      assignedToId: agentId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return addUnreadMessagesCountToPqrs(pqrs, agentId);
};

// Consulta una PQR por id incluyendo su responsable
export const getPqrWithAssignedService = async (pqrId: number) => {
  const pqr = await prisma.pQR.findUnique({
    where: {
      id: pqrId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return pqr;
};

// Cambia la prioridad de una PQR.
export const updatePqrPriorityService = async (
  pqrId: number,
  priority: PqrPriority,
  auditActor: AuditActor
) => {
  return prisma.$transaction(async (tx) => {
    // Prioridad anterior, para registrar el cambio.
    const currentPqr = await tx.pQR.findUnique({
      where: {
        id: pqrId,
      },
      select: {
        priority: true,
      },
    });

    const pqr = await tx.pQR.update({
      where: {
        id: pqrId,
      },
      data: {
        priority,
      },
    });

    // Solo se registra si la prioridad realmente cambió.
    if (
      currentPqr &&
      currentPqr.priority !== priority
    ) {
      await createAuditLog(tx, {
        actor: auditActor,
        module: AUDIT_MODULES.PQRS,
        action: AUDIT_ACTIONS.PQR_PRIORITY_CHANGED,
        entityType: "PQR",
        entityId: pqrId,
        description: `PQR #${pqrId}: ${currentPqr.priority ? PQR_PRIORITY_LABELS[currentPqr.priority] : "Sin prioridad"} → ${PQR_PRIORITY_LABELS[priority]}`,
      });
    }

    return pqr;
  });
};

// Permite calificar una PQR cerrada
export const ratePqrService = async (
  pqrId: number,
  data: RatePqrData,
  auditActor: AuditActor
) => {
  const pqr = await prisma.$transaction(async (tx) => {
    const ratedPqr = await tx.pQR.update({
      where: {
        id: pqrId,
      },
      data: {
        rating: data.rating,
        ratingComment: data.ratingComment ?? null,
        ratedAt: new Date(),
      },
      include: {
        // usuario que creó y calificó la PQR
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        // agente asignado a la PQR
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await createAuditLog(tx, {
      actor: auditActor,
      module: AUDIT_MODULES.PQRS,
      action: AUDIT_ACTIONS.PQR_RATED,
      entityType: "PQR",
      entityId: pqrId,
      description: `Calificó la PQR #${pqrId} con ${data.rating} ${data.rating === 1 ? "estrella" : "estrellas"}`,
    });

    return ratedPqr;
  });

  // Notifica a los ADMIN y al AGENT asignado que la PQR fue calificada
  await notifyAboutRatedPqrService(
    pqr.id,
    pqr.user.name,
    pqr.user.email,
    pqr.rating ?? data.rating,
    pqr.assignedToId
  );

  return pqr;
};