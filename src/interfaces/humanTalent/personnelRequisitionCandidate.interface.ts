import type { Role } from "@prisma/client";

// Datos del usuario que intenta gestionar candidatos.
export interface PersonnelCandidateAuthenticatedUser {
    id: number;
    email: string;
    role: Role;
}

// Datos necesarios para registrar un candidato.
export interface CreatePersonnelRequisitionCandidateData {
    requisitionId: number;

    identificationTypeId: number;
    identificationNumber: string;

    name: string;
    observation: string | null;

    originalName: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;

    uploadedById: number;
}

// Datos permitidos para actualizar un candidato.
export interface UpdatePersonnelRequisitionCandidateData {
    requisitionId: number;
    candidateId: number;

    identificationTypeId?: number;
    identificationNumber?: string;

    name?: string;
    observation?: string | null;
    originalName?: string;
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
    fileSize?: number;
}