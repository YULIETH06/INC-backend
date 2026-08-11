import type {
    ApprovalDecision,
    ContractType,
    DirectContractType,
    InternContractType,
} from "@prisma/client";

// Datos necesarios para crear la confirmación final de contratación.
export interface CreatePersonnelHiringConfirmationData {
    requisitionId: number;
    contractType: ContractType;
    directContractType: DirectContractType | null;
    contractDurationMonths: number | null;
    internContractType: InternContractType | null;
    approvedSalary: number;
    createdById: number;
}

// Datos necesarios para aprobar, rechazar o cancelar una confirmación de contratación.
export interface DecidePersonnelHiringConfirmationData {
    hiringConfirmationId: number;
    decision: ApprovalDecision;
    comment?: string | null;
    decidedById: number;
}

// Datos básicos de una asignación activa de usuario a cargo para Talento Humano.
export interface HumanTalentActiveAssignment {
    id: number;
    userId: number;
}

// Paso calculado para el flujo de aprobación de la confirmación de contratación.
export interface HiringConfirmationApprovalFlowStep {
    approvalOrder: number;
    approverPositionId: number;
    approverAssignmentId: number;
    approverUserId: number;
    isAutoApproved: boolean;
}