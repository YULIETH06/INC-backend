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

// Datos para registrar las notas de la Evaluación Técnica - Fase 4.
export interface SavePersonnelCandidateTechnicalEvaluationData {
    candidateId: number;
    interviewScore?: number | null;
    examScore?: number | null;

    examEvidence?: {
        originalName: string;
        fileName: string;
        fileUrl: string;
        mimeType: string;
        fileSize: number;
    };
}

// Datos para aprobar la Evaluación Técnica - Fase 4.
export interface ApprovePersonnelCandidateTechnicalEvaluationData {
    candidateId: number;
    isSuitable: boolean;
}
// Datos de una prueba psicotécnica individual - Fase 5.
export interface PersonnelCandidatePsychotechnicalTestData {
    appliedTest: string;
    evaluationAspects: string;
    resultDescription: string;
}

// Datos para registrar múltiples pruebas psicotécnicas - Fase 5.
export interface CreatePersonnelCandidatePsychotechnicalTestsData {
    candidateId: number;
    psychotechnicalTests: PersonnelCandidatePsychotechnicalTestData[];
}

// Resultado permitido para una competencia evaluada - Fase 5.
export type PersonnelCandidateCompetencyResult =
    | "Destacada"
    | "Por destacar";


// Datos de una competencia individual evaluada - Fase 5.
export interface PersonnelCandidateCompetencyValidationData {
    competencyDescriptionId: number;
    result: PersonnelCandidateCompetencyResult;
}


// Datos para registrar múltiples competencias - Fase 5.
export interface SavePersonnelCandidateCompetencyValidationsData {
    candidateId: number;
    competencyValidations: PersonnelCandidateCompetencyValidationData[];
}

// Datos para finalizar la Evaluación de Competencias - Fase 5.
export interface CompletePersonnelCandidateCompetencyEvaluationData {
    candidateId: number;
    generalConcept: string;
    isSuitable: boolean;
}