import prisma from "../../../config/client.js";
import type { AuthRequest } from "../../../interfaces/auth/auth.interface.js";
import type {
    CreatePersonnelRequisitionData,
    DecidePersonnelRequisitionData,
} from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";
import {
    buildRequisitionApprovalFlow,
    getApprovalStepsFromCreatorLevel,
} from "../../../helpers/humanTalent/requisitions/requisitionApprovalFlow.helper.js";
import { validatePersonnelRequisitionCreator } from "../../../helpers/humanTalent/requisitions/requisitionCreator.helper.js";
import {
    notifyRequisitionNextApprovalService,
    notifyRequisitionPendingApprovalService,
    notifyRequisitionReadyForHumanTalentService,
    notifyRequisitionRejectedService
} from "../../notifications/humanTalent/humanTalentNotification.service.js";

type AuthenticatedUser = NonNullable<AuthRequest["user"]>;

// Crea una requisición de personal y genera su flujo de aprobación.
export const createPersonnelRequisitionService = async ({
    departmentId,
    positionId,
    positionRevisionId,
    reason,
    otherReason,
    cityId,
    contractType,
    directContractType,
    contractDurationMonths,
    internContractType,
    proposedSalary,
    createdById,
}: CreatePersonnelRequisitionData) => {
    const department = await prisma.department.findFirst({
        where: {
            id: departmentId,
            isActive: true,
        },
    });

    if (!department) {
        throw new Error("El área solicitante no existe o está inactiva");
    }

    const position = await prisma.positionProfile.findFirst({
        where: {
            id: positionId,
            isActive: true,
        },
    });

    if (!position) {
        throw new Error("El cargo requerido no existe o está inactivo");
    }

    const city = await prisma.city.findFirst({
        where: {
            id: cityId,
            isActive: true,
        },
    });

    if (!city) {
        throw new Error("La ciudad no existe o está inactiva");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: createdById,
        },
    });

    if (!user) {
        throw new Error("El usuario que crea la requisición no existe");
    }

    if (!user.signatureUrl) {
        throw new Error(
            "Debes tener una firma registrada para crear una requisición de personal"
        );
    }

    // Valida que el usuario tenga un cargo autorizado para crear requisiciones.
    await validatePersonnelRequisitionCreator(prisma, createdById);

    // Limpia y valida la descripción del motivo seleccionado.
    const cleanOtherReason = otherReason?.trim();

    if (!cleanOtherReason) {
        throw new Error("La descripción del motivo es obligatoria");
    }

    if (!contractType) {
        throw new Error("El tipo de contratación es obligatorio");
    }

    if (contractType === "DIRECTO" && !directContractType) {
        throw new Error("Debe seleccionar el tipo de contrato directo");
    }

    if (
        contractType === "DIRECTO" &&
        directContractType === "FIJO" &&
        (!contractDurationMonths || contractDurationMonths <= 0)
    ) {
        throw new Error("Debe indicar la duración del contrato fijo en meses");
    }

    if (
        contractType === "TEMPORAL" &&
        (!contractDurationMonths || contractDurationMonths <= 0)
    ) {
        throw new Error("Debe indicar la duración del contrato temporal en meses");
    }

    if (contractType === "PRACTICANTE" && !internContractType) {
        throw new Error("Debe seleccionar el tipo de practicante");
    }

    const cleanDirectContractType =
        contractType === "DIRECTO" ? directContractType : null;

    const cleanContractDurationMonths =
        contractType === "TEMPORAL" ||
            (contractType === "DIRECTO" && directContractType === "FIJO")
            ? contractDurationMonths
            : null;

    const cleanInternContractType =
        contractType === "PRACTICANTE" ? internContractType : null;

    type RequisitionNotificationToSend =
        | {
            type: "PENDING_APPROVAL";
            userId: number;
            requisitionId: number;
            createdByName: string;
            positionName: string;
            departmentName: string;
        }
        | {
            type: "READY_FOR_HUMAN_TALENT";
            userId: number;
            requisitionId: number;
            positionName: string;
            departmentName: string;
        };

    const result = await prisma.$transaction(async (tx) => {
        let notificationToSend: RequisitionNotificationToSend | null = null;

        // Construye el flujo completo según la jerarquía del departamento.
        const approvalSteps = await buildRequisitionApprovalFlow(tx, departmentId);

        // Si el creador está dentro de la jerarquía, el flujo inicia desde su nivel.
        const participatingApprovalSteps = getApprovalStepsFromCreatorLevel(
            approvalSteps,
            createdById
        );

        // Identifica el primer paso pendiente después de las autoaprobaciones del creador.
        const firstPendingStepIndex = participatingApprovalSteps.findIndex((step) => {
            return step.approverUserId !== createdById;
        });

        const autoApprovedStepsLimit =
            firstPendingStepIndex === -1
                ? participatingApprovalSteps.length
                : firstPendingStepIndex;

        const firstPendingStep =
            firstPendingStepIndex === -1
                ? undefined
                : participatingApprovalSteps[firstPendingStepIndex];

        const createdRequisition = await tx.personnelRequisition.create({
            data: {
                departmentId,
                positionId,
                positionRevisionId,
                reason,
                otherReason: cleanOtherReason,
                cityId,
                contractType,
                directContractType: cleanDirectContractType,
                contractDurationMonths: cleanContractDurationMonths,
                internContractType: cleanInternContractType,
                proposedSalary,
                status: firstPendingStep
                    ? "EN_APROBACION"
                    : "PENDIENTE_CONFIRMACION_TALENTO_HUMANO",
                createdById,
            },
        });

        // Crea los pasos de aprobación de la requisición.
        // Si el creador está en un nivel superior, los pasos inferiores se omiten.
        await tx.personnelRequisitionApproval.createMany({
            data: participatingApprovalSteps.map((step, index) => {
                const isAutoApproved = index < autoApprovedStepsLimit;
                const isCurrent = index === firstPendingStepIndex;

                return {
                    requisitionId: createdRequisition.id,
                    approvalOrder: step.approvalOrder,
                    departmentId: step.departmentId,
                    approverPositionId: step.approverPositionId,
                    approverAssignmentId: step.approverAssignmentId,
                    approverUserId: step.approverUserId,
                    decision: isAutoApproved ? "APROBADA" : null,
                    decidedById: isAutoApproved ? createdById : null,
                    decidedAt: isAutoApproved ? new Date() : null,
                    isCurrent,
                };
            }),
        });

        if (firstPendingStep) {
            // Notifica al primer usuario que debe aprobar la requisición.
            notificationToSend = {
                type: "PENDING_APPROVAL",
                userId: firstPendingStep.approverUserId,
                requisitionId: createdRequisition.id,
                createdByName: user.name,
                positionName: position.name,
                departmentName: department.name,
            };
        } else {
            // Si todos los pasos jerárquicos fueron aprobados automáticamente, notifica a Talento Humano.
            const humanTalentConfig =
                await tx.humanTalentWorkflowConfig.findFirst({
                    where: {
                        isActive: true,
                    },
                });

            if (!humanTalentConfig) {
                throw new Error(
                    "No existe una configuración activa del flujo de Talento Humano"
                );
            }

            const humanTalentAssignment =
                await tx.userPositionAssignment.findFirst({
                    where: {
                        positionId: humanTalentConfig.analystPositionId,
                        isActive: true,
                        endDate: null,
                    },
                    select: {
                        userId: true,
                    },
                    orderBy: {
                        startDate: "desc",
                    },
                });

            if (!humanTalentAssignment) {
                throw new Error(
                    "No existe un usuario activo asignado al primer VoBo de Talento Humano"
                );
            }

            notificationToSend = {
                type: "READY_FOR_HUMAN_TALENT",
                userId: humanTalentAssignment.userId,
                requisitionId: createdRequisition.id,
                positionName: position.name,
                departmentName: department.name,
            };
        }

        const requisition = await tx.personnelRequisition.findUnique({
            where: {
                id: createdRequisition.id,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                city: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        signatureUrl: true,
                    },
                },
            },
        });

        return {
            requisition,
            notificationToSend,
        };
    });

    if (result.notificationToSend?.type === "PENDING_APPROVAL") {
        await notifyRequisitionPendingApprovalService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.createdByName,
            result.notificationToSend.positionName,
            result.notificationToSend.departmentName
        );
    }

    if (result.notificationToSend?.type === "READY_FOR_HUMAN_TALENT") {
        await notifyRequisitionReadyForHumanTalentService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.positionName,
            result.notificationToSend.departmentName
        );
    }

    return result.requisition;
};

// Valida si el usuario autenticado es Auxiliar activo de Talento Humano.
const isActiveHumanTalentAnalyst = async (userId: number): Promise<boolean> => {
    const humanTalentConfig = await prisma.humanTalentWorkflowConfig.findFirst({
        where: {
            isActive: true,
        },
        select: {
            analystPositionId: true,
        },
    });

    if (!humanTalentConfig) {
        return false;
    }

    const assignment = await prisma.userPositionAssignment.findFirst({
        where: {
            userId,
            positionId: humanTalentConfig.analystPositionId,
            isActive: true,
            endDate: null,
        },
        select: {
            id: true,
        },
    });

    return Boolean(assignment);
};

// Obtiene las requisiciones visibles para el usuario autenticado.
export const getPersonnelRequisitionsService = async (
    user: AuthenticatedUser
) => {

    const isHumanTalentAnalyst = await isActiveHumanTalentAnalyst(user.id);

    const where =
        user.role === "ADMIN"
            ? {}
            : {
                OR: [
                    // Requisiciones creadas por el usuario.
                    {
                        createdById: user.id,
                    },

                    // Requisiciones donde el usuario es aprobador o ya tomó una decisión.
                    {
                        approvals: {
                            some: {
                                OR: [
                                    {
                                        approverUserId: user.id,
                                    },
                                    {
                                        decidedById: user.id,
                                    },
                                ],
                            },
                        },
                    },

                    // Requisiciones donde el usuario participa en la confirmación de contratación.
                    {
                        hiringConfirmation: {
                            is: {
                                OR: [
                                    {
                                        createdById: user.id,
                                    },
                                    {
                                        approvals: {
                                            some: {
                                                OR: [
                                                    {
                                                        approverUserId: user.id,
                                                    },
                                                    {
                                                        decidedById: user.id,
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },

                    // Requisiciones listas para que Auxiliar TH registre confirmación.
                    ...(isHumanTalentAnalyst
                        ? [
                            {
                                status: "PENDIENTE_CONFIRMACION_TALENTO_HUMANO" as const,
                                hiringConfirmation: null,
                            },
                        ]
                        : []),
                ],
            };

    const requisitions = await prisma.personnelRequisition.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            department: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
            position: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
            city: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    signatureUrl: true,
                },
            },
            approvals: {
                orderBy: {
                    approvalOrder: "asc",
                },
                include: {
                    department: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    approverPosition: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    approverUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                    decidedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                },
            },
            hiringConfirmation: {
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                    approvals: {
                        orderBy: {
                            approvalOrder: "asc",
                        },
                        include: {
                            approverPosition: {
                                select: {
                                    id: true,
                                    code: true,
                                    name: true,
                                },
                            },
                            approverUser: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    signatureUrl: true,
                                },
                            },
                            decidedBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    signatureUrl: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return requisitions;
};

// Obtiene el detalle completo de una requisición de personal.
export const getPersonnelRequisitionByIdService = async (
    requisitionId: number,
    user: AuthenticatedUser
) => {
    const requisition = await prisma.personnelRequisition.findUnique({
        where: {
            id: requisitionId,
        },
        include: {
            department: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
            position: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
            positionRevision: {
                select: {
                    id: true,
                    positionProfileId: true,
                    revisionNumber: true,
                    revisionDate: true,
                    status: true,
                    changeObservation: true,
                    updatedAt: true,
                },
            },
            city: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    signatureUrl: true,
                },
            },
            approvals: {
                orderBy: {
                    approvalOrder: "asc",
                },
                include: {
                    department: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    approverPosition: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    approverUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                    decidedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                },
            },
            hiringConfirmation: {
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                    approvals: {
                        orderBy: {
                            approvalOrder: "asc",
                        },
                        include: {
                            approverPosition: {
                                select: {
                                    id: true,
                                    code: true,
                                    name: true,
                                },
                            },
                            approverUser: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    signatureUrl: true,
                                },
                            },
                            decidedBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    signatureUrl: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!requisition) {
        throw new Error("La requisición no existe");
    }

    const isHumanTalentAnalyst = await isActiveHumanTalentAnalyst(user.id);

    const canViewAsHumanTalentAnalyst =
        isHumanTalentAnalyst &&
        requisition.status === "PENDIENTE_CONFIRMACION_TALENTO_HUMANO" &&
        !requisition.hiringConfirmation;

    const canView =
        user.role === "ADMIN" ||
        requisition.createdById === user.id ||
        canViewAsHumanTalentAnalyst ||
        requisition.approvals.some((approval) => {
            return (
                approval.approverUserId === user.id ||
                approval.decidedById === user.id
            );
        }) ||
        requisition.hiringConfirmation?.createdById === user.id ||
        requisition.hiringConfirmation?.approvals.some((approval) => {
            return (
                approval.approverUserId === user.id ||
                approval.decidedById === user.id
            );
        });

    if (!canView) {
        throw new Error("No tienes permisos para ver esta requisición");
    }

    return requisition;
};

// Aprueba, rechaza o cancela el paso actual de una requisición.
export const decidePersonnelRequisitionService = async (
    {
        requisitionId,
        decision,
        comment,
        decidedById,
    }: DecidePersonnelRequisitionData,
    user: AuthenticatedUser
) => {
    if (user.id !== decidedById) {
        throw new Error("No puedes decidir una requisición por otro usuario");
    }

    type RequisitionDecisionNotification =
        | {
            type: "REJECTED";
            userId: number;
            requisitionId: number;
            decidedByName: string;
            decision: "RECHAZADA" | "CANCELADA";
            comment?: string | null;
        }
        | {
            type: "NEXT_APPROVAL";
            userId: number;
            requisitionId: number;
            decidedByName: string;
        }
        | {
            type: "READY_FOR_HUMAN_TALENT";
            userId: number;
            requisitionId: number;
            positionName: string;
            departmentName: string;
        };

    const result = await prisma.$transaction(async (tx) => {
        let notificationToSend: RequisitionDecisionNotification | null = null;

        const currentRequisition = await tx.personnelRequisition.findUnique({
            where: {
                id: requisitionId,
            },
            include: {
                department: {
                    select: {
                        name: true,
                    },
                },
                position: {
                    select: {
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                approvals: {
                    orderBy: {
                        approvalOrder: "asc",
                    },
                },
            },
        });

        if (!currentRequisition) {
            throw new Error("La requisición no existe");
        }

        if (
            currentRequisition.status === "APROBADA" ||
            currentRequisition.status === "RECHAZADA" ||
            currentRequisition.status === "CANCELADA"
        ) {
            throw new Error("No hay una aprobación pendiente para esta requisición");
        }

        const currentApproval = currentRequisition.approvals.find(
            (approval) => approval.isCurrent
        );

        if (!currentApproval) {
            throw new Error("La requisición no tiene un paso activo para decidir");
        }

        const canDecide =
            user.role === "ADMIN" || currentApproval.approverUserId === user.id;

        if (!canDecide) {
            throw new Error("No tienes permisos para decidir esta requisición");
        }

        const approverUser = await tx.user.findUnique({
            where: {
                id: decidedById,
            },
            select: {
                id: true,
                signatureUrl: true,
            },
        });

        if (!approverUser) {
            throw new Error("El usuario que toma la decisión no existe");
        }

        if (!approverUser.signatureUrl) {
            throw new Error(
                "Debes tener una firma registrada para aprobar, rechazar o cancelar una requisición"
            );
        }

        // Registra la decisión del paso actual.
        await tx.personnelRequisitionApproval.update({
            where: {
                id: currentApproval.id,
            },
            data: {
                decision,
                comment: comment?.trim() || null,
                decidedById,
                decidedAt: new Date(),
                isCurrent: false,
            },
        });

        if (decision === "RECHAZADA" || decision === "CANCELADA") {
            // Si se rechaza o cancela, la requisición termina su flujo.
            const updatedRequisition = await tx.personnelRequisition.update({
                where: {
                    id: requisitionId,
                },
                data: {
                    status: decision,
                },
            });

            notificationToSend = {
                type: "REJECTED",
                userId: currentRequisition.createdById,
                requisitionId,
                decidedByName: "El aprobador actual",
                decision,
                comment: comment?.trim() || null,
            };

            return {
                requisition: updatedRequisition,
                notificationToSend,
            };
        }

        const nextApproval = currentRequisition.approvals.find(
            (approval) =>
                approval.approvalOrder === currentApproval.approvalOrder + 1
        );

        if (nextApproval) {
            // Activa el siguiente paso de aprobación.
            await tx.personnelRequisitionApproval.update({
                where: {
                    id: nextApproval.id,
                },
                data: {
                    isCurrent: true,
                },
            });

            if (!nextApproval.approverUserId) {
                throw new Error(
                    "El siguiente paso no tiene un usuario aprobador asignado"
                );
            }

            notificationToSend = {
                type: "NEXT_APPROVAL",
                userId: nextApproval.approverUserId,
                requisitionId,
                decidedByName: "El aprobador anterior",
            };

            const updatedRequisition = await tx.personnelRequisition.update({
                where: {
                    id: requisitionId,
                },
                data: {
                    status: "EN_APROBACION",
                },
            });

            return {
                requisition: updatedRequisition,
                notificationToSend,
            };
        }

        // Si no hay más pasos jerárquicos, pasa a confirmación de Talento Humano.
        const updatedRequisition = await tx.personnelRequisition.update({
            where: {
                id: requisitionId,
            },
            data: {
                status: "PENDIENTE_CONFIRMACION_TALENTO_HUMANO",
            },
        });

        const humanTalentConfig = await tx.humanTalentWorkflowConfig.findFirst({
            where: {
                isActive: true,
            },
        });

        if (!humanTalentConfig) {
            throw new Error(
                "No existe una configuración activa del flujo de Talento Humano"
            );
        }

        const humanTalentAssignment =
            await tx.userPositionAssignment.findFirst({
                where: {
                    positionId: humanTalentConfig.analystPositionId,
                    isActive: true,
                    endDate: null,
                },
                select: {
                    userId: true,
                },
                orderBy: {
                    startDate: "desc",
                },
            });

        if (!humanTalentAssignment) {
            throw new Error(
                "No existe un usuario activo asignado al primer VoBo de Talento Humano"
            );
        }

        notificationToSend = {
            type: "READY_FOR_HUMAN_TALENT",
            userId: humanTalentAssignment.userId,
            requisitionId,
            positionName: currentRequisition.position.name,
            departmentName: currentRequisition.department.name,
        };

        return {
            requisition: updatedRequisition,
            notificationToSend,
        };
    });

    if (result.notificationToSend?.type === "REJECTED") {
        await notifyRequisitionRejectedService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.decidedByName,
            result.notificationToSend.decision,
            result.notificationToSend.comment
        );
    }

    if (result.notificationToSend?.type === "NEXT_APPROVAL") {
        await notifyRequisitionNextApprovalService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.decidedByName
        );
    }

    if (result.notificationToSend?.type === "READY_FOR_HUMAN_TALENT") {
        await notifyRequisitionReadyForHumanTalentService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.positionName,
            result.notificationToSend.departmentName
        );
    }

    return prisma.personnelRequisition.findUnique({
        where: {
            id: result.requisition.id,
        },
        include: {
            department: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
            position: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
            city: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    signatureUrl: true,
                },
            },
            approvals: {
                orderBy: {
                    approvalOrder: "asc",
                },
                include: {
                    department: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    approverPosition: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    approverUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                    decidedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            signatureUrl: true,
                        },
                    },
                },
            },
        },
    });
};