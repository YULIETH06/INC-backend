import prisma from "../../../config/client.js";

import type {
    PersonnelCandidateAuthenticatedUser,
} from "../../../interfaces/humanTalent/candidateSubmission/personnelRequisitionCandidate.interface.js";

import {
    validatePersonnelCandidateValidationAccess,
} from "../../../helpers/humanTalent/candidateValidation/personnelCandidateValidationAccess.helper.js";

// Obtiene los candidatos preseleccionados disponibles para validación de cargo y postulante.
export const getPersonnelCandidateValidationsService = async (
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    const access =
        await validatePersonnelCandidateValidationAccess(
            prisma,
            authenticatedUser.id,
            authenticatedUser.role
        );

    const candidates =
        await prisma.personnelRequisitionCandidate.findMany({
            where: {
                isPreselected: true,
                requisition: {
                    status: "APROBADA",

                    ...(
                        access.canViewAllValidations
                            ? {}
                            : {
                                createdById:
                                    authenticatedUser.id,
                            }
                    ),
                },
            },
            select: {
                id: true,
                requisitionId: true,
                identificationNumber: true,
                name: true,
                createdAt: true,

                identificationType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },

                requisition: {
                    select: {
                        id: true,
                        candidateSubmissionStatus: true,

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
                    },
                },

                validation: {
                    select: {
                        id: true,
                        applicationConcept: true,
                        positionType: true,
                        isPositionProfileCurrent: true,
                        isSuitable: true,
                        completedStep: true,
                        validatedAt: true,

                        technicalEvaluation: {
                            select: {
                                status: true,
                                isSuitable: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    const formattedCandidates =
        candidates.map(
            (candidate) => {
                let validationStatus =
                    "SIN_INICIAR";

                if (
                    candidate.validation
                        ?.completedStep === 1
                ) {
                    validationStatus =
                        "CONCEPTO_APLICACION_COMPLETADO";
                }

                if (
                    candidate.validation
                        ?.completedStep === 2
                ) {
                    validationStatus =
                        "VALIDACION_CARGO_COMPLETADA";
                }

                if (
                    candidate.validation
                        ?.completedStep === 3
                ) {
                    const technicalStatus =
                        candidate.validation
                            .technicalEvaluation
                            ?.status;

                    if (!technicalStatus) {
                        validationStatus =
                            "VALIDACION_COMPLETADA";
                    }

                    if (
                        technicalStatus ===
                        "EN_REGISTRO"
                    ) {
                        validationStatus =
                            "EVALUACION_TECNICA_EN_REGISTRO";
                    }

                    if (
                        technicalStatus ===
                        "PENDIENTE_APROBACION"
                    ) {
                        validationStatus =
                            "EVALUACION_TECNICA_PENDIENTE_APROBACION";
                    }
                }

                if (
                    candidate.validation
                        ?.completedStep === 4
                ) {
                    validationStatus =
                        "EVALUACION_TECNICA_COMPLETADA";
                }

                return {
                    ...candidate,
                    validationStatus,
                };
            }
        );

    return {
        candidates:
            formattedCandidates,

        canManageValidation:
            access.canManageValidation,
    };
};

// Obtiene el detalle de la validación de un candidato preseleccionado.
export const getPersonnelCandidateValidationDetailService = async (
    candidateId: number,
    authenticatedUser: PersonnelCandidateAuthenticatedUser
) => {
    const access =
        await validatePersonnelCandidateValidationAccess(
            prisma,
            authenticatedUser.id,
            authenticatedUser.role
        );

    const candidate =
        await prisma.personnelRequisitionCandidate.findFirst({
            where: {
                id: candidateId,
                isPreselected: true,

                requisition: {
                    status: "APROBADA",

                    ...(
                        access.canViewAllValidations
                            ? {}
                            : {
                                createdById:
                                    authenticatedUser.id,
                            }
                    ),
                },
            },

            select: {
                id: true,
                requisitionId: true,
                identificationNumber: true,
                name: true,

                identificationType: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },

                requisition: {
                    select: {
                        id: true,
                        candidateSubmissionStatus: true,
                        positionRevisionId: true,
                        createdById: true,

                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },

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
                                revisionNumber: true,
                                status: true,

                                requirementDescriptions: {
                                    where: {
                                        deletedAt:
                                            null,
                                    },

                                    select: {
                                        id: true,
                                        description: true,

                                        requirement: {
                                            select: {
                                                id: true,
                                                name: true,
                                            },
                                        },
                                    },

                                    orderBy: {
                                        id: "asc",
                                    },
                                },
                            },
                        },
                    },
                },

                validation: {
                    select: {
                        id: true,
                        applicationConcept: true,
                        positionType: true,
                        changeControlCode: true,
                        isPositionProfileCurrent: true,
                        isSuitable: true,
                        completedStep: true,
                        validatedAt: true,

                        performedBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },

                        requirementValidations: {
                            select: {
                                id: true,
                                requirementDescriptionId: true,
                                complies: true,
                                evidence: true,
                                gapClosure: true,
                            },
                        },

                        technicalEvaluation: {
                            select: {
                                id: true,

                                interviewScore: true,
                                interviewRecordedAt: true,

                                examScore: true,
                                examRecordedAt: true,

                                status: true,
                                isSuitable: true,

                                enteredById: true,

                                enteredBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },

                                approvedById: true,

                                approvedBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },

                                approvedAt: true,
                            },
                        },
                    },
                },
            },
        });

    if (!candidate) {
        throw new Error(
            "El candidato no existe, no ha sido preseleccionado o no está disponible para validación"
        );
    }

    return {
        candidate,

        canManageValidation:
            access.canManageValidation,

        canApproveTechnicalEvaluation:
            candidate.requisition.createdById ===
            authenticatedUser.id,
    };
};