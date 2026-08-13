import type {
    CandidateApplicationConcept,
    CandidatePositionType
} from "@prisma/client";

// Datos necesarios para iniciar la validación de cargo y postulante.
export interface CreatePersonnelCandidateValidationData {
    candidateId: number;
    applicationConcept: CandidateApplicationConcept;
}

// Datos necesarios para guardar la validación de cargo.
export interface UpdatePersonnelCandidatePositionValidationData {
    candidateId: number;
    positionType: CandidatePositionType;
    changeControlCode: string | null;
}

// Resultado de la evaluación de una descripción de requisito.
export interface PersonnelCandidateRequirementValidationData {
    requirementDescriptionId: number;
    complies: boolean;
    evidence: string | null;
    gapClosure: string | null;
}

// Datos necesarios para completar la validación del postulante.
export interface CompletePersonnelCandidateValidationData {
    candidateId: number;
    isSuitable: boolean;
    requirementValidations: PersonnelCandidateRequirementValidationData[];
}