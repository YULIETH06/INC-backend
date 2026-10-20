import {
    ALLOWED_REQUISITION_CREATOR_POSITION_CODES,
} from "../../constants/humanTalent/personnelRequisition.constants.js";

import type { PrismaExecutor } from "../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

import {
    findActiveAssignmentByPositionId,
} from "../humanTalent/requisitions/requisitionOwner.helper.js";

import {
    notifyHiringConfirmationPendingService,
    notifyRequisitionPendingApprovalService,
} from "../../services/notifications/humanTalent/humanTalentNotification.service.js";

// Código del cargo encargado de gestionar candidatos en Talento Humano.
const HUMAN_TALENT_CANDIDATE_MANAGER_POSITION_CODE = "DPC-TH-0118";

// Notificación pendiente para el nuevo ocupante de un cargo.
export type TransferredApprovalNotification =
    | {
        type: "REQUISITION";
        userId: number;
        requisitionId: number;
        createdByName: string;
        positionName: string;
        departmentName: string;
    }
    | {
        type: "HIRING_CONFIRMATION";
        userId: number;
        requisitionId: number;
        positionName: string;
        departmentName: string;
    };

// Indica si un cargo es responsable de procesos de Talento Humano.
// Estos cargos solo pueden tener un usuario activo, para que el sistema
// sepa a quién trasladar las aprobaciones y las requisiciones en curso.
export const isResponsiblePosition = async (
    prismaExecutor: PrismaExecutor,
    position: {
        id: number;
        code: string;
    }
): Promise<boolean> => {
    const allowedCreatorCodes: readonly string[] =
        ALLOWED_REQUISITION_CREATOR_POSITION_CODES;

    if (
        allowedCreatorCodes.includes(position.code) ||
        position.code ===
        HUMAN_TALENT_CANDIDATE_MANAGER_POSITION_CODE
    ) {
        return true;
    }

    // Cargo responsable de un área o departamento.
    const responsibleDepartment =
        await prismaExecutor.department.findFirst({
            where: {
                responsiblePositionId: position.id,
            },
            select: {
                id: true,
            },
        });

    if (responsibleDepartment) {
        return true;
    }

    // Cargo de Analista o Jefe en el flujo de Talento Humano.
    const workflowConfig =
        await prismaExecutor.humanTalentWorkflowConfig.findFirst({
            where: {
                isActive: true,
                OR: [
                    {
                        analystPositionId: position.id,
                    },
                    {
                        chiefPositionId: position.id,
                    },
                ],
            },
            select: {
                id: true,
            },
        });

    return Boolean(workflowConfig);
};

// Asigna las aprobaciones pendientes de un cargo a quien lo ocupa hoy.
// Si el cargo queda vacío, las aprobaciones quedan sin responsable
// hasta que alguien reciba el cargo.
// Devuelve las notificaciones de los pasos que ya son el turno del nuevo ocupante.
export const syncPendingApprovalsForPosition = async (
    prismaExecutor: PrismaExecutor,
    positionId: number
): Promise<TransferredApprovalNotification[]> => {
    const occupant =
        await findActiveAssignmentByPositionId(
            prismaExecutor,
            positionId
        );

    const occupantAssignmentId =
        occupant?.id ?? null;

    const occupantUserId =
        occupant?.userId ?? null;

    const notifications: TransferredApprovalNotification[] = [];

    // Aprobaciones de requisiciones sin decidir, en requisiciones que siguen en aprobación.
    const requisitionApprovals =
        await prismaExecutor.personnelRequisitionApproval.findMany({
            where: {
                approverPositionId: positionId,
                decision: null,
                requisition: {
                    status: {
                        in: [
                            "PENDIENTE_APROBACION",
                            "EN_APROBACION",
                        ],
                    },
                },
            },
            select: {
                id: true,
                isCurrent: true,
                approverAssignmentId: true,
                requisition: {
                    select: {
                        id: true,
                        createdBy: {
                            select: {
                                name: true,
                            },
                        },
                        position: {
                            select: {
                                name: true,
                            },
                        },
                        department: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

    const requisitionApprovalsToUpdate =
        requisitionApprovals.filter(
            (approval) =>
                approval.approverAssignmentId !==
                occupantAssignmentId
        );

    if (requisitionApprovalsToUpdate.length > 0) {
        await prismaExecutor.personnelRequisitionApproval.updateMany({
            where: {
                id: {
                    in: requisitionApprovalsToUpdate.map(
                        (approval) => approval.id
                    ),
                },
            },
            data: {
                approverAssignmentId: occupantAssignmentId,
                approverUserId: occupantUserId,
            },
        });
    }

    if (occupantUserId !== null) {
        requisitionApprovalsToUpdate
            .filter((approval) => approval.isCurrent)
            .forEach((approval) => {
                notifications.push({
                    type: "REQUISITION",
                    userId: occupantUserId,
                    requisitionId: approval.requisition.id,
                    createdByName:
                        approval.requisition.createdBy.name,
                    positionName:
                        approval.requisition.position.name,
                    departmentName:
                        approval.requisition.department.name,
                });
            });
    }

    // Aprobaciones de confirmaciones de contratación sin decidir.
    const hiringApprovals =
        await prismaExecutor.personnelHiringConfirmationApproval.findMany({
            where: {
                approverPositionId: positionId,
                decision: null,
                hiringConfirmation: {
                    status: "PENDIENTE_APROBACION",
                },
            },
            select: {
                id: true,
                isCurrent: true,
                approverAssignmentId: true,
                hiringConfirmation: {
                    select: {
                        requisition: {
                            select: {
                                id: true,
                                position: {
                                    select: {
                                        name: true,
                                    },
                                },
                                department: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    const hiringApprovalsToUpdate =
        hiringApprovals.filter(
            (approval) =>
                approval.approverAssignmentId !==
                occupantAssignmentId
        );

    if (hiringApprovalsToUpdate.length > 0) {
        await prismaExecutor.personnelHiringConfirmationApproval.updateMany({
            where: {
                id: {
                    in: hiringApprovalsToUpdate.map(
                        (approval) => approval.id
                    ),
                },
            },
            data: {
                approverAssignmentId: occupantAssignmentId,
                approverUserId: occupantUserId,
            },
        });
    }

    if (occupantUserId !== null) {
        hiringApprovalsToUpdate
            .filter((approval) => approval.isCurrent)
            .forEach((approval) => {
                const requisition =
                    approval.hiringConfirmation.requisition;

                notifications.push({
                    type: "HIRING_CONFIRMATION",
                    userId: occupantUserId,
                    requisitionId: requisition.id,
                    positionName: requisition.position.name,
                    departmentName: requisition.department.name,
                });
            });
    }

    return notifications;
};

// Envía las notificaciones de las aprobaciones trasladadas.
// Se ejecuta después de la transacción, igual que el resto de notificaciones del sistema.
export const sendTransferredApprovalNotifications = async (
    notifications: TransferredApprovalNotification[]
) => {
    for (const notification of notifications) {
        if (notification.type === "REQUISITION") {
            await notifyRequisitionPendingApprovalService(
                notification.userId,
                notification.requisitionId,
                notification.createdByName,
                notification.positionName,
                notification.departmentName
            );
        }

        if (notification.type === "HIRING_CONFIRMATION") {
            await notifyHiringConfirmationPendingService(
                notification.userId,
                notification.requisitionId,
                notification.positionName,
                notification.departmentName
            );
        }
    }
};
