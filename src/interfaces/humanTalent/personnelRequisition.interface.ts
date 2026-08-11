import type {
  ApprovalDecision,
  ContractType,
  DirectContractType,
  InternContractType,
  Prisma,
  PrismaClient,
  RequisitionReason,
} from "@prisma/client";

// Datos necesarios para crear una requisición de personal.
export interface CreatePersonnelRequisitionData {
  departmentId: number;
  positionId: number;
  positionRevisionId: number;

  reason: RequisitionReason;
  otherReason: string;
  cityId: number;

  contractType: ContractType;
  directContractType: DirectContractType | null;
  contractDurationMonths: number | null;
  internContractType: InternContractType | null;

  proposedSalary: number;
  createdById: number;
}

// Datos necesarios para aprobar, rechazar o cancelar una requisición.
export interface DecidePersonnelRequisitionData {
  requisitionId: number;
  decision: ApprovalDecision;
  comment?: string | null;
  decidedById: number;
}

// Ejecutor de Prisma que permite trabajar con el cliente normal o dentro de una transacción.
export type PrismaExecutor =
  | PrismaClient
  | Prisma.TransactionClient;

// Campos necesarios del departamento para construir el flujo de aprobación.
export const departmentApprovalSelect = {
  id: true,
  name: true,
  parentDepartmentId: true,
  responsiblePositionId: true,
} as const satisfies Prisma.DepartmentSelect;

// Tipo del departamento usado para construir el flujo de aprobación.
export type DepartmentApprovalData =
  Prisma.DepartmentGetPayload<{
    select: typeof departmentApprovalSelect;
  }>;

// Datos básicos de una asignación activa de usuario a cargo.
export interface ActivePositionAssignment {
  id: number;
  userId: number;
}

// Paso calculado para el flujo de aprobación de una requisición.
export interface RequisitionApprovalFlowStep {
  approvalOrder: number;
  departmentId: number;
  approverPositionId: number;
  approverAssignmentId: number;
  approverUserId: number;
}