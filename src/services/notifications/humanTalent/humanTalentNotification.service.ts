import { NotificationType } from "@prisma/client";
import { createNotificationService } from "../notification.service.js";

// Notifica al aprobador actual que tiene una requisición pendiente.
export const notifyRequisitionPendingApprovalService = async (
    userId: number,
    requisitionId: number,
    createdByName: string,
    positionName: string,
    departmentName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_PENDING_APPROVAL,
        title: `Requisición #${requisitionId} pendiente de aprobación`,
        message: `${createdByName} creó una requisición para el cargo ${positionName} en el área ${departmentName}.`,
    });
};

// Notifica al creador que su requisición fue rechazada o cancelada.
export const notifyRequisitionRejectedService = async (
    userId: number,
    requisitionId: number,
    decidedByName: string,
    decision: "RECHAZADA" | "CANCELADA",
    comment?: string | null
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_REJECTED,
        title:
            decision === "RECHAZADA"
                ? `Requisición #${requisitionId} rechazada`
                : `Requisición #${requisitionId} cancelada`,
        message:
            decision === "RECHAZADA"
                ? `${decidedByName} rechazó tu requisición de personal.${comment ? ` Motivo: ${comment}` : ""}`
                : `${decidedByName} canceló tu requisición de personal.${comment ? ` Motivo: ${comment}` : ""}`,
    });
};

// Notifica al siguiente aprobador que la requisición avanzó a su paso.
export const notifyRequisitionNextApprovalService = async (
    userId: number,
    requisitionId: number,
    decidedByName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_PENDING_APPROVAL,
        title: `Requisición #${requisitionId} pendiente de aprobación`,
        message: `${decidedByName} aprobó la requisición. Ahora requiere tu aprobación para continuar el flujo.`,
    });
};

// Notifica al Auxiliar TH que la requisición está lista para confirmación.
export const notifyRequisitionReadyForHumanTalentService = async (
    userId: number,
    requisitionId: number,
    positionName: string,
    departmentName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.HIRING_CONFIRMATION_PENDING,
        title: `Requisición #${requisitionId} lista para confirmación`,
        message: `La requisición para el cargo ${positionName} en el área ${departmentName} ya fue aprobada y está pendiente de confirmación por Talento Humano.`,
    });
};

// Notifica al Jefe TH que tiene una confirmación de contratación pendiente.
export const notifyHiringConfirmationPendingService = async (
    userId: number,
    requisitionId: number,
    positionName: string,
    departmentName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.HIRING_CONFIRMATION_PENDING,
        title: `Confirmación pendiente - Requisición #${requisitionId}`,
        message: `La confirmación de contratación para el cargo ${positionName} en el área ${departmentName} está pendiente de aprobación.`,
    });
};

// Notifica al creador que la confirmación fue rechazada o cancelada.
export const notifyHiringConfirmationRejectedService = async (
    userId: number,
    requisitionId: number,
    decidedByName: string,
    decision: "RECHAZADA" | "CANCELADA",
    comment?: string | null
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.HIRING_CONFIRMATION_REJECTED,
        title:
            decision === "RECHAZADA"
                ? `Confirmación rechazada - Requisición #${requisitionId}`
                : `Confirmación cancelada - Requisición #${requisitionId}`,
        message:
            decision === "RECHAZADA"
                ? `${decidedByName} rechazó la confirmación de contratación.${comment ? ` Motivo: ${comment}` : ""}`
                : `${decidedByName} canceló la confirmación de contratación.${comment ? ` Motivo: ${comment}` : ""}`,
    });
};

// Notifica al creador que la requisición fue aprobada completamente.
export const notifyHiringConfirmationApprovedService = async (
    userId: number,
    requisitionId: number
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.HIRING_CONFIRMATION_APPROVED,
        title: `Requisición #${requisitionId} aprobada completamente`,
        message: "La requisición de personal fue aprobada completamente por Talento Humano.",
    });
};

// Notifica al Auxiliar de Talento Humano que tiene un cargue de candidatos pendiente.
export const notifyCandidateUploadPendingService = async (
    userId: number,
    requisitionId: number,
    positionName: string,
    departmentName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_CANDIDATES_PENDING,
        title: `Cargue de candidatos pendiente - Requisición #${requisitionId}`,
        message:
            `La requisición para el cargo ${positionName} ` +
            `en el área ${departmentName} fue aprobada. ` +
            "Debes iniciar el cargue de candidatos.",
    });
};

// Notifica al Jefe de Talento Humano que no existe un auxiliar activo.
export const notifyCandidateUploadWithoutAssistantService = async (
    userId: number,
    requisitionId: number,
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_CANDIDATES_WITHOUT_ASSISTANT,
        title: `Requisición #${requisitionId} sin auxiliar activo`,
        message:
            `La requisición fue aprobada pero actualmente no existe un Auxiliar de Talento Humano activo para realizar el cargue de candidatos.`,
    });
};

// Notifica al creador que los candidatos ya fueron cargados.
export const notifyCandidatesUploadedService = async (
    userId: number,
    requisitionId: number,
    positionName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_CANDIDATES_CLOSED,
        title:
            `Candidatos disponibles - ` +
            `Requisición #${requisitionId}`,
        message:
            `Los candidatos para el cargo ${positionName} ` +
            `ya fueron cargados. Puedes consultar las ` +
            `hojas de vida registradas en la requisición.`,
    });
};

// Notifica al creador que el cargue de candidatos fue reabierto.
export const notifyCandidatesReopenedService = async (
    userId: number,
    requisitionId: number,
    positionName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_CANDIDATES_REOPENED,
        title:
            `Cargue de candidatos reabierto - ` +
            `Requisición #${requisitionId}`,
        message:
            `Talento Humano reabrió el cargue de candidatos para el cargo ${positionName} ` +
            `para realizar ajustes. Te notificaremos cuando los candidatos estén disponibles nuevamente.`,
    });
};

// Notifica al creador de la requisición que tiene una Evaluación Técnica pendiente.
export const notifyCandidateTechnicalEvaluationPendingService = async (
    userId: number,
    requisitionId: number,
    candidateName: string,
    positionName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.CANDIDATE_TECHNICAL_EVALUATION_PENDING,
        title:
            `Evaluación técnica pendiente - ` +
            `Requisición #${requisitionId}`,
        message:
            `La Evaluación Técnica del postulante ${candidateName} ` +
            `para el cargo ${positionName} está lista y requiere tu validación.`,
    });
};

// Notifica al Auxiliar de Talento Humano que se confirmó una preselección.
export const notifyCandidatesPreselectedService = async (
    userId: number,
    requisitionId: number,
    candidateCount: number,
    positionName: string
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.REQUISITION_CANDIDATES_PRESELECTED,
        title:
            `Preselección confirmada - ` +
            `Requisición #${requisitionId}`,
        message:
            candidateCount === 1
                ? `Se preseleccionó 1 candidato para el cargo ${positionName}. ` +
                `Ya puedes iniciar el proceso de validación de cargo y postulante.`
                : `Se preseleccionaron ${candidateCount} candidatos para el cargo ${positionName}. ` +
                `Ya puedes iniciar el proceso de validación de cargo y postulante.`,
    });
};

// Notifica al Auxiliar de Talento Humano que la Evaluación Técnica fue confirmada.
export const notifyCandidateTechnicalEvaluationConfirmedService = async (
    userId: number,
    requisitionId: number,
    candidateName: string,
    positionName: string,
    isSuitable: boolean
) => {
    return createNotificationService({
        userId,
        personnelRequisitionId: requisitionId,
        type: NotificationType.CANDIDATE_TECHNICAL_EVALUATION_CONFIRMED,
        title:
            `Evaluación técnica confirmada - ` +
            `Requisición #${requisitionId}`,
        message:
            isSuitable
                ? `Se confirmó la Evaluación Técnica de ${candidateName} para el cargo ${positionName}. ` +
                `El postulante puede continuar en el proceso.`
                : `Se confirmó la Evaluación Técnica de ${candidateName} para el cargo ${positionName}. ` +
                `El postulante no continuará en el proceso.`,
    });
};