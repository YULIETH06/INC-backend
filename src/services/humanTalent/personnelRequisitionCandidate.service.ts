import prisma from "../../config/client.js";

import type {
    CreatePersonnelRequisitionCandidateData,
    PersonnelCandidateAuthenticatedUser,
    UpdatePersonnelRequisitionCandidateData,
} from "../../interfaces/humanTalent/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateManager
} from "../../utils/humanTalent/personnelCandidateManager.helper.js";
import {
    notifyCandidatesReopenedService,
    notifyCandidatesUploadedService,
} from "../notifications/humanTalentNotification.service.js";
import { getPersonnelRequisitionByIdService } from "./personnelRequisition.service.js";

// Registra un candidato y su hoja de vida.
export const createPersonnelRequisitionCandidateService = async (
    data: CreatePersonnelRequisitionCandidateData,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    // Valida que el usuario autenticado tenga activo
    // el cargo de Auxiliar de Talento Humano.
    await validatePersonnelCandidateManager(
        prisma,
        authenticatedUser.id
    );

    const requisition =
        await prisma.personnelRequisition.findUnique({
            where: {
                id: data.requisitionId,
            },
            select: {
                id: true,
                status: true,
                candidateSubmissionStatus: true,
                _count: {
                    select: {
                        candidates: true,
                    },
                },
            },
        });

    if (!requisition) {
        throw new Error(
            "La requisición de personal no existe"
        );
    }

    if (requisition.status !== "APROBADA") {
        throw new Error(
            "Solo se pueden cargar candidatos en una requisición aprobada"
        );
    }

    if (
        requisition.candidateSubmissionStatus ===
        "NO_INICIADA"
    ) {
        throw new Error(
            "El cargue de candidatos todavía no está habilitado"
        );
    }

    if (
        requisition.candidateSubmissionStatus ===
        "CERRADA"
    ) {
        throw new Error(
            "El cargue de candidatos ya fue cerrado"
        );
    }

    if (requisition._count.candidates >= 10) {
        throw new Error(
            "La requisición ya tiene el máximo de 10 candidatos"
        );
    }

    const identificationType =
        await prisma.identificationType.findFirst({
            where: {
                id: data.identificationTypeId,
                isActive: true,
            },
            select: {
                id: true,
            },
        });

    if (!identificationType) {
        throw new Error(
            "El tipo de identificación no existe o está inactivo"
        );
    }

    const existingCandidate =
        await prisma.personnelRequisitionCandidate.findFirst({
            where: {
                requisitionId: data.requisitionId,
                identificationTypeId:
                    data.identificationTypeId,
                identificationNumber:
                    data.identificationNumber,
            },
            select: {
                id: true,
            },
        });

    if (existingCandidate) {
        throw new Error(
            "Ya existe un candidato con esta identificación en la requisición"
        );
    }

    const candidate =
        await prisma.personnelRequisitionCandidate.create({
            data: {
                requisitionId: data.requisitionId,

                identificationTypeId:
                    data.identificationTypeId,

                identificationNumber:
                    data.identificationNumber,

                name: data.name,
                observation: data.observation,

                originalName: data.originalName,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                mimeType: data.mimeType,
                fileSize: data.fileSize,

                uploadedById: authenticatedUser.id,
            },

            select: {
                id: true,
                requisitionId: true,

                identificationTypeId: true,
                identificationNumber: true,

                name: true,
                observation: true,

                originalName: true,
                fileName: true,
                fileUrl: true,
                mimeType: true,
                fileSize: true,

                uploadedById: true,

                createdAt: true,
                updatedAt: true,

                identificationType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },

                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

    return candidate;
};

// Obtiene los candidatos registrados en una requisición de personal.
export const getPersonnelRequisitionCandidatesService = async (
    requisitionId: number,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    const requisition =
        await prisma.personnelRequisition.findUnique({
            where: {
                id: requisitionId,
            },
            select: {
                id: true,
                candidateSubmissionStatus: true,
            },
        });

    if (!requisition) {
        throw new Error(
            "La requisición de personal no existe"
        );
    }

    if (
        requisition.candidateSubmissionStatus ===
        "NO_INICIADA"
    ) {
        throw new Error(
            "El cargue de candidatos todavía no está habilitado"
        );
    }

    // Verifica si el usuario autenticado tiene activo
    // el cargo de Auxiliar de Talento Humano.
    const candidateManagerAssignment =
        await prisma.userPositionAssignment.findFirst({
            where: {
                userId: authenticatedUser.id,
                isActive: true,

                position: {
                    is: {
                        code: "DPC-TH-0080",
                        isActive: true,
                    },
                },
            },
            select: {
                id: true,
            },
        });

    const isCandidateManager =
        Boolean(candidateManagerAssignment);

    // Mientras el cargue está abierto, solamente el
    // Auxiliar de Talento Humano puede consultar candidatos.
    if (
        requisition.candidateSubmissionStatus ===
        "ABIERTA" &&
        !isCandidateManager
    ) {
        throw new Error(
            "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
        );
    }

    // Cuando el cargue está cerrado, se aplican los permisos
    // generales del detalle de la requisición.
    if (
        requisition.candidateSubmissionStatus ===
        "CERRADA"
    ) {
        await getPersonnelRequisitionByIdService(
            requisitionId,
            authenticatedUser
        );
    }

    const candidates =
        await prisma.personnelRequisitionCandidate.findMany({
            where: {
                requisitionId,
            },
            select: {
                id: true,
                requisitionId: true,
                identificationTypeId: true,
                identificationNumber: true,

                identificationType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },

                name: true,
                observation: true,
                originalName: true,
                fileName: true,
                fileUrl: true,
                mimeType: true,
                fileSize: true,
                uploadedById: true,
                createdAt: true,
                updatedAt: true,

                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

    return {
        candidates,
        isCandidateManager,
    };
};

// Obtiene el historial de reaperturas y cierres posteriores del cargue.
export const getPersonnelCandidateSubmissionHistoryService = async (
    requisitionId: number,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    const requisition =
        await prisma.personnelRequisition.findUnique({
            where: {
                id: requisitionId,
            },
            select: {
                id: true,
                candidateSubmissionStatus: true,
            },
        });

    if (!requisition) {
        throw new Error(
            "La requisición de personal no existe"
        );
    }

    if (
        requisition.candidateSubmissionStatus ===
        "NO_INICIADA"
    ) {
        throw new Error(
            "El cargue de candidatos todavía no está habilitado"
        );
    }

    // Verifica si el usuario es el Auxiliar de Talento Humano activo.
    const candidateManagerAssignment =
        await prisma.userPositionAssignment.findFirst({
            where: {
                userId: authenticatedUser.id,
                isActive: true,
                position: {
                    is: {
                        code: "DPC-TH-0080",
                        isActive: true,
                    },
                },
            },
            select: {
                id: true,
            },
        });

    // Si no es el Auxiliar, valida los permisos generales de la requisición.
    if (!candidateManagerAssignment) {
        await getPersonnelRequisitionByIdService(
            requisitionId,
            authenticatedUser
        );
    }

    const history =
        await prisma.personnelCandidateSubmissionHistory.findMany({
            where: {
                requisitionId,
            },
            select: {
                id: true,
                requisitionId: true,
                action: true,
                reason: true,
                performedById: true,
                performedAt: true,

                performedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: [
                {
                    performedAt: "asc",
                },
                {
                    id: "asc",
                },
            ],
        });

    return history;
};

// Cierra el proceso de cargue de candidatos de una requisición.
export const closePersonnelRequisitionCandidatesService = async (
    requisitionId: number,
    authenticatedUser: PersonnelCandidateAuthenticatedUser,
    lateReason?: string
) => {
    // Solo el Auxiliar de Talento Humano activo puede cerrar el cargue.
    await validatePersonnelCandidateManager(
        prisma,
        authenticatedUser.id
    );

    const requisition =
        await prisma.personnelRequisition.findUnique({
            where: {
                id: requisitionId,
            },
            select: {
                id: true,
                status: true,
                createdById: true,
                candidateSubmissionStatus: true,
                candidateSubmissionDeadlineAt: true,
                candidateSubmissionClosedAt: true,
                candidateSubmissionLateReason: true,

                position: {
                    select: {
                        name: true,
                    },
                },

                _count: {
                    select: {
                        candidates: true,
                    },
                },
            },
        });

    if (!requisition) {
        throw new Error(
            "La requisición de personal no existe"
        );
    }

    if (requisition.status !== "APROBADA") {
        throw new Error(
            "Solo se puede cerrar el cargue de una requisición aprobada"
        );
    }

    if (
        requisition.candidateSubmissionStatus ===
        "NO_INICIADA"
    ) {
        throw new Error(
            "El cargue de candidatos todavía no está habilitado"
        );
    }

    if (
        requisition.candidateSubmissionStatus ===
        "CERRADA"
    ) {
        throw new Error(
            "El cargue de candidatos ya fue cerrado"
        );
    }

    if (requisition._count.candidates === 0) {
        throw new Error(
            "Debe registrar por lo menos un candidato antes de cerrar el cargue"
        );
    }

    const closedAt = new Date();

    // Si todavía no existe fecha de cierre, esta es la primera entrega.
    const isFirstClosure =
        requisition.candidateSubmissionClosedAt === null;

    const isLateFirstClosure =
        isFirstClosure &&
        requisition.candidateSubmissionDeadlineAt !== null &&
        closedAt > requisition.candidateSubmissionDeadlineAt;

    const cleanLateReason =
        lateReason?.trim() || null;

    if (
        isLateFirstClosure &&
        cleanLateReason &&
        cleanLateReason.length < 3
    ) {
        throw new Error(
            "El motivo del retraso debe tener mínimo 3 caracteres"
        );
    }

    if (
        isLateFirstClosure &&
        cleanLateReason &&
        cleanLateReason.length > 500
    ) {
        throw new Error(
            "El motivo del retraso no puede superar los 500 caracteres"
        );
    }

    // Si la primera entrega está vencida, exige justificación.
    if (isLateFirstClosure && !cleanLateReason) {
        throw new Error(
            "Debe indicar el motivo del retraso para cerrar el cargue de candidatos"
        );
    }

    const updatedRequisition =
        await prisma.$transaction(async (tx) => {
            const updated =
                await tx.personnelRequisition.update({
                    where: {
                        id: requisitionId,
                    },
                    data: {
                        candidateSubmissionStatus: "CERRADA",

                        // Conserva siempre la fecha del primer cierre.
                        candidateSubmissionClosedAt:
                            requisition.candidateSubmissionClosedAt ??
                            closedAt,

                        // Solo registra justificación si el primer cierre fue tardío.
                        candidateSubmissionLateReason:
                            isLateFirstClosure
                                ? cleanLateReason
                                : requisition.candidateSubmissionLateReason,
                    },
                    select: {
                        id: true,
                        status: true,
                        candidateSubmissionStatus: true,
                        candidateSubmissionClosedAt: true,
                        candidateSubmissionDeadlineAt: true,
                        candidateSubmissionLateReason: true,
                        updatedAt: true,

                        _count: {
                            select: {
                                candidates: true,
                            },
                        },
                    },
                });

            // Solo registra en el historial los cierres posteriores a una reapertura.
            if (!isFirstClosure) {
                await tx.personnelCandidateSubmissionHistory.create({
                    data: {
                        requisitionId,
                        action: "CIERRE",
                        reason: null,
                        performedById: authenticatedUser.id,
                        performedAt: closedAt,
                    },
                });
            }

            return updated;
        });

    // Notifica al usuario que creó la requisición.
    await notifyCandidatesUploadedService(
        requisition.createdById,
        requisition.id,
        requisition.position.name
    );

    return updatedRequisition;
};

// Reabre el proceso de cargue de candidatos de una requisición.
export const reopenPersonnelRequisitionCandidatesService = async (
    requisitionId: number,
    authenticatedUser: PersonnelCandidateAuthenticatedUser,
    reason: string
) => {
    // Solo el Auxiliar de Talento Humano activo puede reabrir el cargue.
    await validatePersonnelCandidateManager(
        prisma,
        authenticatedUser.id
    );

    const requisition =
        await prisma.personnelRequisition.findUnique({
            where: {
                id: requisitionId,
            },
            select: {
                id: true,
                status: true,
                createdById: true,
                candidateSubmissionStatus: true,

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

    // Solo las requisiciones aprobadas pueden tener
    // nuevamente habilitado el cargue de candidatos.
    if (requisition.status !== "APROBADA") {
        throw new Error(
            "Solo se puede reabrir el cargue de una requisición aprobada"
        );
    }

    // El cargue debe haber sido habilitado previamente.
    if (
        requisition.candidateSubmissionStatus ===
        "NO_INICIADA"
    ) {
        throw new Error(
            "El cargue de candidatos todavía no está habilitado"
        );
    }

    // Evita intentar reabrir un cargue que ya se encuentra abierto.
    if (
        requisition.candidateSubmissionStatus ===
        "ABIERTA"
    ) {
        throw new Error(
            "El cargue de candidatos ya se encuentra abierto"
        );
    }

    const cleanReason = reason?.trim();

    if (!cleanReason) {
        throw new Error(
            "Debe indicar el motivo para reabrir el cargue de candidatos"
        );
    }

    if (cleanReason.length < 3) {
        throw new Error(
            "El motivo de reapertura debe tener mínimo 3 caracteres"
        );
    }

    if (cleanReason.length > 500) {
        throw new Error(
            "El motivo de reapertura no puede superar los 500 caracteres"
        );
    }

    const reopenedAt = new Date();

    const updatedRequisition =
        await prisma.$transaction(async (tx) => {
            const updated =
                await tx.personnelRequisition.update({
                    where: {
                        id: requisitionId,
                    },
                    data: {
                        candidateSubmissionStatus: "ABIERTA",
                    },
                    select: {
                        id: true,
                        status: true,
                        candidateSubmissionStatus: true,
                        candidateSubmissionClosedAt: true,
                        updatedAt: true,

                        _count: {
                            select: {
                                candidates: true,
                            },
                        },
                    },
                });

            // Guarda esta reapertura como un registro independiente.
            await tx.personnelCandidateSubmissionHistory.create({
                data: {
                    requisitionId,
                    action: "REAPERTURA",
                    reason: cleanReason,
                    performedById: authenticatedUser.id,
                    performedAt: reopenedAt,
                },
            });

            return updated;
        });

    // Notifica al mismo usuario creador que recibe
    // la notificación cuando el cargue es cerrado.
    await notifyCandidatesReopenedService(
        requisition.createdById,
        requisition.id,
        requisition.position.name
    );

    return updatedRequisition;
};



// Elimina un candidato registrado en una requisición de personal.
export const deletePersonnelRequisitionCandidateService =
    async (
        requisitionId: number,
        candidateId: number,
        authenticatedUser: PersonnelCandidateAuthenticatedUser
    ) => {
        // Solo el Auxiliar de Talento Humano activo puede eliminar candidatos.
        await validatePersonnelCandidateManager(
            prisma,
            authenticatedUser.id
        );

        const requisition =
            await prisma.personnelRequisition.findUnique({
                where: {
                    id: requisitionId,
                },
                select: {
                    id: true,
                    status: true,
                    candidateSubmissionStatus: true,
                },
            });

        if (!requisition) {
            throw new Error(
                "La requisición de personal no existe"
            );
        }

        if (requisition.status !== "APROBADA") {
            throw new Error(
                "Solo se pueden eliminar candidatos de una requisición aprobada"
            );
        }

        if (
            requisition.candidateSubmissionStatus ===
            "NO_INICIADA"
        ) {
            throw new Error(
                "El cargue de candidatos todavía no está habilitado"
            );
        }

        if (
            requisition.candidateSubmissionStatus ===
            "CERRADA"
        ) {
            throw new Error(
                "No se pueden eliminar candidatos porque el cargue ya fue cerrado"
            );
        }

        const candidate =
            await prisma.personnelRequisitionCandidate.findFirst({
                where: {
                    id: candidateId,
                    requisitionId,
                },
                select: {
                    id: true,
                    requisitionId: true,
                    name: true,
                    originalName: true,
                    fileName: true,
                    fileUrl: true,

                    validation: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

        if (!candidate) {
            throw new Error(
                "El candidato no existe o no pertenece a esta requisición"
            );
        }

        if (candidate.validation) {
            throw new Error(
                "No se puede eliminar el candidato porque ya inició el proceso de validación"
            );
        }

        await prisma.personnelRequisitionCandidate.delete({
            where: {
                id: candidate.id,
            },
        });

        return candidate;
    };

// Actualiza los datos o la hoja de vida de un candidato.
export const updatePersonnelRequisitionCandidateService =
    async (
        data: UpdatePersonnelRequisitionCandidateData,
        authenticatedUser: PersonnelCandidateAuthenticatedUser
    ) => {
        // Solo el Auxiliar de Talento Humano activo puede editar candidatos.
        await validatePersonnelCandidateManager(
            prisma,
            authenticatedUser.id
        );

        const requisition =
            await prisma.personnelRequisition.findUnique({
                where: {
                    id: data.requisitionId,
                },
                select: {
                    id: true,
                    status: true,
                    candidateSubmissionStatus: true,
                },
            });

        if (!requisition) {
            throw new Error(
                "La requisición de personal no existe"
            );
        }

        if (requisition.status !== "APROBADA") {
            throw new Error(
                "Solo se pueden actualizar candidatos de una requisición aprobada"
            );
        }

        if (
            requisition.candidateSubmissionStatus ===
            "NO_INICIADA"
        ) {
            throw new Error(
                "El cargue de candidatos todavía no está habilitado"
            );
        }

        if (
            requisition.candidateSubmissionStatus ===
            "CERRADA"
        ) {
            throw new Error(
                "No se pueden actualizar candidatos porque el cargue ya fue cerrado"
            );
        }

        const currentCandidate =
            await prisma.personnelRequisitionCandidate.findFirst({
                where: {
                    id: data.candidateId,
                    requisitionId: data.requisitionId,
                },
                select: {
                    id: true,
                    fileName: true,
                    identificationTypeId: true,
                    identificationNumber: true,

                    validation: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

        if (!currentCandidate) {
            throw new Error(
                "El candidato no existe o no pertenece a esta requisición"
            );
        }

        if (currentCandidate.validation) {
            throw new Error(
                "No se puede actualizar el candidato porque ya inició el proceso de validación"
            );
        }

        const newFileName = data.fileName;

        if (
            data.name === undefined &&
            data.observation === undefined &&
            data.identificationTypeId === undefined &&
            data.identificationNumber === undefined &&
            newFileName === undefined
        ) {
            throw new Error(
                "Debe enviar al menos un dato para actualizar"
            );
        }

        const updateData: {
            identificationTypeId?: number;
            identificationNumber?: string;
            name?: string;
            observation?: string | null;
            originalName?: string;
            fileName?: string;
            fileUrl?: string;
            mimeType?: string;
            fileSize?: number;
        } = {};

        if (data.identificationTypeId !== undefined) {
            const identificationType =
                await prisma.identificationType.findFirst({
                    where: {
                        id: data.identificationTypeId,
                        isActive: true,
                    },
                    select: {
                        id: true,
                    },
                });

            if (!identificationType) {
                throw new Error(
                    "El tipo de identificación no existe o está inactivo"
                );
            }

            updateData.identificationTypeId =
                data.identificationTypeId;
        }

        if (data.identificationNumber !== undefined) {
            updateData.identificationNumber =
                data.identificationNumber;
        }

        if (
            data.identificationTypeId !== undefined ||
            data.identificationNumber !== undefined
        ) {
            const finalIdentificationTypeId =
                data.identificationTypeId ??
                currentCandidate.identificationTypeId;

            const finalIdentificationNumber =
                data.identificationNumber ??
                currentCandidate.identificationNumber;

            const duplicateCandidate =
                await prisma.personnelRequisitionCandidate.findFirst({
                    where: {
                        requisitionId: data.requisitionId,
                        identificationTypeId:
                            finalIdentificationTypeId,
                        identificationNumber:
                            finalIdentificationNumber,

                        NOT: {
                            id: currentCandidate.id,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (duplicateCandidate) {
                throw new Error(
                    "Ya existe un candidato con esta identificación en la requisición"
                );
            }
        }

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.observation !== undefined) {
            updateData.observation =
                data.observation;
        }

        if (newFileName !== undefined) {
            const newOriginalName =
                data.originalName;

            const newFileUrl =
                data.fileUrl;

            const newMimeType =
                data.mimeType;

            const newFileSize =
                data.fileSize;

            if (
                newOriginalName === undefined ||
                newFileUrl === undefined ||
                newMimeType === undefined ||
                newFileSize === undefined
            ) {
                throw new Error(
                    "La información de la nueva hoja de vida está incompleta"
                );
            }

            updateData.originalName =
                newOriginalName;

            updateData.fileName =
                newFileName;

            updateData.fileUrl =
                newFileUrl;

            updateData.mimeType =
                newMimeType;

            updateData.fileSize =
                newFileSize;
        }

        const updatedCandidate =
            await prisma.personnelRequisitionCandidate.update({
                where: {
                    id: currentCandidate.id,
                },
                data: updateData,
                select: {
                    id: true,
                    requisitionId: true,

                    identificationTypeId: true,
                    identificationNumber: true,

                    identificationType: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },

                    name: true,
                    observation: true,
                    originalName: true,
                    fileName: true,
                    fileUrl: true,
                    mimeType: true,
                    fileSize: true,
                    uploadedById: true,
                    createdAt: true,
                    updatedAt: true,
                    uploadedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

        return {
            candidate: updatedCandidate,

            // Se devuelve para eliminar el archivo anterior.
            previousFileName:
                newFileName !== undefined
                    ? currentCandidate.fileName
                    : null,
        };
    };