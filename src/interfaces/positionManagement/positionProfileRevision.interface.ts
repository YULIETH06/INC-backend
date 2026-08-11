import type {
    PositionProfileRevisionStatus,
} from "@prisma/client";

// Datos permitidos para crear una revisión de un perfil de cargo.
export interface CreatePositionProfileRevisionBody {
    changeObservation?: string;
}

// Datos permitidos para agregar una descripción a un requisito.
export interface CreatePositionRequirementDescriptionBody {
    description: string;
}

// Datos permitidos para actualizar una descripción de un requisito.
export interface UpdatePositionRequirementDescriptionBody {
    description: string;
}

// Datos permitidos para actualizar una revisión en borrador.
export interface UpdatePositionProfileRevisionBody {
    changeObservation: string | null;
}

// Información de la revisión vigente de un perfil de cargo.
export interface CurrentPositionProfileRevision {
    id: number;
    positionProfileId: number;
    revisionNumber: number;
    revisionDate: Date;
    status: PositionProfileRevisionStatus;
    changeObservation: string | null;
    updatedAt: Date;
}

// Resultado de la consulta de la revisión vigente.
export interface CurrentPositionProfileRevisionResult {
    revision: CurrentPositionProfileRevision | null;
}