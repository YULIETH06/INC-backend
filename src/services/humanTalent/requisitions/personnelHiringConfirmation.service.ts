import prisma from "../../../config/client.js";

import {
    buildHiringConfirmationApprovalCreateManyData,
    buildHiringConfirmationApprovalFlow,
} from "../../../helpers/humanTalent/requisitions/hiringConfirmationApprovalFlow.helper.js";

import type {
    CreatePersonnelHiringConfirmationData,
    DecidePersonnelHiringConfirmationData,
} from "../../../interfaces/humanTalent/requisitions/personnelHiringConfirmation.interface.js";

import {
    notifyCandidateUploadPendingService,
    notifyCandidateUploadWithoutAssistantService,
    notifyHiringConfirmationApprovedService,
    notifyHiringConfirmationPendingService,
    notifyHiringConfirmationRejectedService,
} from "../../notifications/humanTalent/humanTalentNotification.service.js";

// Código del cargo Auxiliar de Talento Humano.
const HUMAN_TALENT_ASSISTANT_POSITION_CODE = "DPC-TH-0080";

// Calcula la fecha límite de 2 días hábiles para el cargue inicial de candidatos.
const calculateCandidateSubmissionDeadline = (
    approvalDate: Date
) => {
    const deadline = new Date(approvalDate);
    let businessDaysAdded = 0;

    while (businessDaysAdded < 2) {
        deadline.setDate(deadline.getDate() + 1);

        const dayOfWeek = deadline.getDay();

        // Domingo = 0 y sábado = 6.
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDaysAdded++;
        }
    }

    // El Auxiliar dispone de todo el segundo día hábil.
    deadline.setHours(23, 59, 59, 999);

    return deadline;
};

// Crea la confirmación final de contratación de una requisición.
export const createPersonnelHiringConfirmationService = async ({
    requisitionId,
    contractType,
    directContractType,
    contractDurationMonths,
    internContractType,
    approvedSalary,
    createdById,
}: CreatePersonnelHiringConfirmationData) => {
    type HiringConfirmationNotificationToSend = {
        type: "PENDING";
        userId: number;
        requisitionId: number;
        positionName: string;
        departmentName: string;
    };

    const result = await prisma.$transaction(async (tx) => {
        let notificationToSend:
            | HiringConfirmationNotificationToSend
            | null = null;

        const requisition =
            await tx.personnelRequisition.findUnique({
                where: {
                    id: requisitionId,
                },
                include: {
                    hiringConfirmation: true,
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
                },
            });

        if (!requisition) {
            throw new Error(
                "La requisición de personal no existe"
            );
        }

        if (requisition.hiringConfirmation) {
            throw new Error(
                "Esta requisición ya tiene una confirmación de contratación"
            );
        }

        if (
            requisition.status !==
            "PENDIENTE_CONFIRMACION_TALENTO_HUMANO"
        ) {
            throw new Error(
                "La requisición todavía no está lista para confirmación de Talento Humano"
            );
        }

        const user = await tx.user.findUnique({
            where: {
                id: createdById,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                signatureUrl: true,
            },
        });

        if (!user) {
            throw new Error(
                "El usuario que confirma la contratación no existe"
            );
        }

        if (!user.signatureUrl?.trim()) {
            throw new Error(
                "Debes tener una firma registrada para crear la confirmación de contratación"
            );
        }

        if (
            contractType === "DIRECTO" &&
            !directContractType
        ) {
            throw new Error(
                "Debe seleccionar el tipo de contrato directo"
            );
        }

        if (
            contractType === "DIRECTO" &&
            directContractType === "FIJO" &&
            (
                !contractDurationMonths ||
                contractDurationMonths <= 0
            )
        ) {
            throw new Error(
                "Debe indicar la duración del contrato fijo en meses"
            );
        }

        if (
            contractType === "TEMPORAL" &&
            (
                !contractDurationMonths ||
                contractDurationMonths <= 0
            )
        ) {
            throw new Error(
                "Debe indicar la duración del contrato temporal en meses"
            );
        }

        if (
            contractType === "PRACTICANTE" &&
            !internContractType
        ) {
            throw new Error(
                "Debe seleccionar el tipo de practicante"
            );
        }

        if (!approvedSalary || approvedSalary <= 0) {
            throw new Error(
                "El salario aprobado debe ser mayor a cero"
            );
        }

        const cleanDirectContractType =
            contractType === "DIRECTO"
                ? directContractType
                : null;

        const cleanContractDurationMonths =
            contractType === "TEMPORAL" ||
                (
                    contractType === "DIRECTO" &&
                    directContractType === "FIJO"
                )
                ? contractDurationMonths
                : null;

        const cleanInternContractType =
            contractType === "PRACTICANTE"
                ? internContractType
                : null;

        // Construye el flujo de Talento Humano desde la configuración activa.
        const approvalSteps =
            await buildHiringConfirmationApprovalFlow(
                tx,
                createdById
            );

        const analystStep = approvalSteps.find(
            (step) => step.approvalOrder === 1
        );

        if (
            !analystStep ||
            analystStep.approverUserId !== createdById
        ) {
            throw new Error(
                "Solo el usuario asignado al primer VoBo de Talento Humano puede registrar la confirmación"
            );
        }

        const firstPendingStep = approvalSteps.find(
            (step) => !step.isAutoApproved
        );

        const hiringConfirmation =
            await tx.personnelHiringConfirmation.create({
                data: {
                    requisitionId,
                    contractType,
                    directContractType:
                        cleanDirectContractType,
                    contractDurationMonths:
                        cleanContractDurationMonths,
                    internContractType:
                        cleanInternContractType,
                    approvedSalary,
                    status: "PENDIENTE_APROBACION",
                    createdById,
                },
            });

        // Crea los pasos de aprobación de la confirmación de contratación.
        await tx.personnelHiringConfirmationApproval.createMany({
            data:
                buildHiringConfirmationApprovalCreateManyData(
                    hiringConfirmation.id,
                    approvalSteps,
                    createdById
                ),
        });

        // La requisición pasa a espera de aprobación final de Talento Humano.
        await tx.personnelRequisition.update({
            where: {
                id: requisitionId,
            },
            data: {
                status:
                    "PENDIENTE_APROBACION_TALENTO_HUMANO",
            },
        });

        if (!firstPendingStep) {
            throw new Error(
                "No se encontró un paso pendiente para aprobar la confirmación de contratación"
            );
        }

        notificationToSend = {
            type: "PENDING",
            userId: firstPendingStep.approverUserId,
            requisitionId,
            positionName: requisition.position.name,
            departmentName: requisition.department.name,
        };

        const createdHiringConfirmation =
            await tx.personnelHiringConfirmation.findUnique({
                where: {
                    id: hiringConfirmation.id,
                },
                include: {
                    requisition: {
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

        return {
            hiringConfirmation:
                createdHiringConfirmation,
            notificationToSend,
        };
    });

    if (
        result.notificationToSend?.type ===
        "PENDING"
    ) {
        await notifyHiringConfirmationPendingService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.positionName,
            result.notificationToSend.departmentName
        );
    }

    return result.hiringConfirmation;
};

// Registra la decisión de aprobación, rechazo o cancelación de una confirmación de contratación.
export const decidePersonnelHiringConfirmationService = async ({
    hiringConfirmationId,
    decision,
    comment,
    decidedById,
}: DecidePersonnelHiringConfirmationData) => {
    type HiringConfirmationDecisionNotification =
        | {
            type: "REJECTED";
            userId: number;
            requisitionId: number;
            decidedByName: string;
            decision:
            | "RECHAZADA"
            | "CANCELADA";
            comment?: string | null;
        }
        | {
            type: "PENDING";
            userId: number;
            requisitionId: number;
            positionName: string;
            departmentName: string;
        }
        | {
            type: "APPROVED";

            // Usuario creador de la requisición.
            userId: number;

            requisitionId: number;
            positionName: string;
            departmentName: string;

            // Auxiliar activo. Será null cuando no exista.
            candidateAssistantUserId: number | null;

            // Jefe de Talento Humano que realizó la aprobación definitiva.
            chiefUserId: number;
        };

    const result = await prisma.$transaction(
        async (tx) => {
            let notificationToSend:
                | HiringConfirmationDecisionNotification
                | null = null;

            const hiringConfirmation =
                await tx.personnelHiringConfirmation.findUnique({
                    where: {
                        id: hiringConfirmationId,
                    },
                    include: {
                        approvals: {
                            orderBy: {
                                approvalOrder: "asc",
                            },
                        },
                        requisition: {
                            select: {
                                id: true,
                                createdById: true,
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
                            },
                        },
                    },
                });

            if (!hiringConfirmation) {
                throw new Error(
                    "La confirmación de contratación no existe"
                );
            }

            if (
                hiringConfirmation.status ===
                "APROBADA" ||
                hiringConfirmation.status ===
                "RECHAZADA" ||
                hiringConfirmation.status ===
                "CANCELADA"
            ) {
                throw new Error(
                    "No hay una aprobación pendiente para esta confirmación"
                );
            }

            const user = await tx.user.findUnique({
                where: {
                    id: decidedById,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    signatureUrl: true,
                },
            });

            if (!user) {
                throw new Error(
                    "El usuario que toma la decisión no existe"
                );
            }

            if (!user.signatureUrl) {
                throw new Error(
                    "Debes tener una firma registrada para aprobar, rechazar o cancelar la confirmación de contratación"
                );
            }

            const currentApproval =
                hiringConfirmation.approvals.find(
                    (approval) =>
                        approval.isCurrent
                );

            if (!currentApproval) {
                throw new Error(
                    "La confirmación no tiene un paso activo para decidir"
                );
            }

            if (
                currentApproval.approverUserId !==
                decidedById
            ) {
                throw new Error(
                    "No tienes permisos para decidir esta confirmación de contratación"
                );
            }

            // Registra la decisión del paso actual.
            await tx.personnelHiringConfirmationApproval.update({
                where: {
                    id: currentApproval.id,
                },
                data: {
                    decision,
                    comment:
                        comment?.trim() || null,
                    decidedById,
                    decidedAt: new Date(),
                    isCurrent: false,
                },
            });

            if (
                decision === "RECHAZADA" ||
                decision === "CANCELADA"
            ) {
                await tx.personnelHiringConfirmation.update({
                    where: {
                        id: hiringConfirmationId,
                    },
                    data: {
                        status: decision,
                    },
                });

                await tx.personnelRequisition.update({
                    where: {
                        id:
                            hiringConfirmation
                                .requisition.id,
                    },
                    data: {
                        status: decision,
                    },
                });

                notificationToSend = {
                    type: "REJECTED",
                    userId:
                        hiringConfirmation
                            .requisition
                            .createdById,
                    requisitionId:
                        hiringConfirmation
                            .requisition.id,
                    decidedByName: user.name,
                    decision,
                    comment:
                        comment?.trim() || null,
                };

                const updatedHiringConfirmation =
                    await tx.personnelHiringConfirmation.findUnique({
                        where: {
                            id: hiringConfirmationId,
                        },
                        include: {
                            approvals: {
                                orderBy: {
                                    approvalOrder:
                                        "asc",
                                },
                            },
                        },
                    });

                return {
                    hiringConfirmation:
                        updatedHiringConfirmation,
                    notificationToSend,
                };
            }

            const nextApproval =
                hiringConfirmation.approvals.find(
                    (approval) =>
                        approval.approvalOrder ===
                        currentApproval.approvalOrder +
                        1
                );

            if (nextApproval) {
                await tx.personnelHiringConfirmationApproval.update({
                    where: {
                        id: nextApproval.id,
                    },
                    data: {
                        isCurrent: true,
                    },
                });

                if (
                    !nextApproval.approverUserId
                ) {
                    throw new Error(
                        "El siguiente paso no tiene un usuario aprobador asignado"
                    );
                }

                notificationToSend = {
                    type: "PENDING",
                    userId:
                        nextApproval.approverUserId,
                    requisitionId:
                        hiringConfirmation
                            .requisition.id,
                    positionName:
                        hiringConfirmation
                            .requisition
                            .position.name,
                    departmentName:
                        hiringConfirmation
                            .requisition
                            .department.name,
                };

                const updatedHiringConfirmation =
                    await tx.personnelHiringConfirmation.findUnique({
                        where: {
                            id: hiringConfirmationId,
                        },
                        include: {
                            approvals: {
                                orderBy: {
                                    approvalOrder:
                                        "asc",
                                },
                            },
                        },
                    });

                return {
                    hiringConfirmation:
                        updatedHiringConfirmation,
                    notificationToSend,
                };
            }

            // Si no hay más pasos, finaliza completamente la requisición.
            await tx.personnelHiringConfirmation.update({
                where: {
                    id: hiringConfirmationId,
                },
                data: {
                    status: "APROBADA",
                },
            });

            // Calcula el plazo de 2 días hábiles desde la aprobación definitiva.
            const candidateSubmissionDeadlineAt =
                calculateCandidateSubmissionDeadline(
                    new Date()
                );

            // Aprueba la requisición y habilita el cargue inicial de candidatos.
            await tx.personnelRequisition.update({
                where: {
                    id:
                        hiringConfirmation
                            .requisition.id,
                },
                data: {
                    status: "APROBADA",
                    candidateSubmissionStatus:
                        "ABIERTA",
                    candidateSubmissionDeadlineAt,
                    candidateSubmissionLateReason: null,
                },
            });

            // Busca directamente al usuario que tenga activo el cargo de Auxiliar de Talento Humano.
            const activeHumanTalentAssistant =
                await tx.userPositionAssignment.findFirst({
                    where: {
                        isActive: true,
                        endDate: null,
                        position: {
                            isActive: true,
                            code:
                                HUMAN_TALENT_ASSISTANT_POSITION_CODE,
                        },
                    },
                    select: {
                        userId: true,
                    },
                    orderBy: {
                        startDate: "desc",
                    },
                });

            notificationToSend = {
                type: "APPROVED",

                userId:
                    hiringConfirmation.requisition
                        .createdById,

                requisitionId:
                    hiringConfirmation.requisition.id,

                positionName:
                    hiringConfirmation.requisition
                        .position.name,

                departmentName:
                    hiringConfirmation.requisition
                        .department.name,

                // Será null cuando actualmente no exista un auxiliar activo.
                candidateAssistantUserId:
                    activeHumanTalentAssistant?.userId ??
                    null,

                // Usuario que realizó la aprobación final como Jefe de Talento Humano.
                chiefUserId: decidedById,
            };

            const approvedHiringConfirmation =
                await tx.personnelHiringConfirmation.findUnique({
                    where: {
                        id: hiringConfirmationId,
                    },
                    include: {
                        requisition: {
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

            return {
                hiringConfirmation:
                    approvedHiringConfirmation,
                notificationToSend,
            };
        }
    );

    if (
        result.notificationToSend?.type ===
        "REJECTED"
    ) {
        await notifyHiringConfirmationRejectedService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.decidedByName,
            result.notificationToSend.decision,
            result.notificationToSend.comment
        );
    }

    if (
        result.notificationToSend?.type ===
        "PENDING"
    ) {
        await notifyHiringConfirmationPendingService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId,
            result.notificationToSend.positionName,
            result.notificationToSend.departmentName
        );
    }

    if (
        result.notificationToSend?.type ===
        "APPROVED"
    ) {
        // Notifica al creador que la requisición
        // fue aprobada completamente.
        await notifyHiringConfirmationApprovedService(
            result.notificationToSend.userId,
            result.notificationToSend.requisitionId
        );

        if (
            result.notificationToSend
                .candidateAssistantUserId !== null
        ) {
            // Existe Auxiliar de Talento Humano:
            // se le informa que tiene un cargue pendiente.
            await notifyCandidateUploadPendingService(
                result.notificationToSend
                    .candidateAssistantUserId,
                result.notificationToSend
                    .requisitionId,
                result.notificationToSend
                    .positionName,
                result.notificationToSend
                    .departmentName
            );
        } else {
            // No existe Auxiliar de Talento Humano:
            // se informa a la Jefe de Talento Humano.
            await notifyCandidateUploadWithoutAssistantService(
                result.notificationToSend.chiefUserId,
                result.notificationToSend
                    .requisitionId,
            );
        }
    }

    return result.hiringConfirmation;
};