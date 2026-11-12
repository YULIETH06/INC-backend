import { Prisma } from "@prisma/client";

import type {
    CurrentPositionProfileRevisionResult
} from "../../interfaces/positionManagement/positionProfileRevision.interface.js";

import prisma from "../../config/client.js";

import type {
    PrismaExecutor,
} from "../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

import {
    createAuditLog,
    shortenAuditText,
} from "../../helpers/audit/auditLog.helper.js";

import {
    AUDIT_ACTIONS,
    AUDIT_MODULES,
} from "../../constants/audit/auditLog.constants.js";

import type {
    AuditActor,
} from "../../interfaces/audit/auditLog.interface.js";

import type {
    AuditAction,
} from "../../constants/audit/auditLog.constants.js";

// Arma el texto "cargo – revisión N" con el que inicia cada descripción de la auditoría.
const getRevisionAuditLabel = async (
    prismaExecutor: PrismaExecutor,
    revisionId: number
) => {
    const revision =
        await prismaExecutor.positionProfileRevision.findUnique({
            where: {
                id: revisionId,
            },
            select: {
                revisionNumber: true,
                positionProfile: {
                    select: {
                        name: true,
                    },
                },
            },
        });

    return revision
        ? `${revision.positionProfile.name} – revisión ${revision.revisionNumber}`
        : `Revisión #${revisionId}`;
};

// Registra en la auditoría una acción sobre una revisión de perfil de cargo.
const registerRevisionAudit = async (
    prismaExecutor: PrismaExecutor,
    auditActor: AuditActor,
    action: AuditAction,
    revisionId: number,
    detail: string
) => {
    const revisionLabel =
        await getRevisionAuditLabel(
            prismaExecutor,
            revisionId
        );

    await createAuditLog(prismaExecutor, {
        actor: auditActor,
        module: AUDIT_MODULES.POSITION_MANAGEMENT,
        action,
        entityType: "PositionProfileRevision",
        entityId: revisionId,
        description: `${revisionLabel}: ${detail}`,
    });
};

// Obtiene la revisión vigente de un perfil de cargo.
export const getCurrentPositionProfileRevisionService = async (
    positionProfileId: number
): Promise<CurrentPositionProfileRevisionResult> => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    const positionProfile =
        await prisma.positionProfile.findFirst({
            where: {
                id: positionProfileId,
                isActive: true,
            },
            select: {
                id: true,
            },
        });

    if (!positionProfile) {
        throw new Error(
            "El perfil de cargo no existe o se encuentra inactivo"
        );
    }

    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                positionProfileId,
                status: "VIGENTE",
                deletedAt: null,
            },
            select: {
                id: true,
                positionProfileId: true,
                revisionNumber: true,
                revisionDate: true,
                status: true,
                changeObservation: true,
                updatedAt: true,
            },
            orderBy: {
                revisionNumber: "desc",
            },
        });

    return {
        revision,
    };
};

// Crea una nueva revisión en borrador para un perfil de cargo.
export const createPositionProfileRevisionService = async (
    positionProfileId: number,
    changeObservation: string | undefined,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    const normalizedChangeObservation =
        changeObservation?.trim() || null;

    if (
        normalizedChangeObservation &&
        normalizedChangeObservation.length > 500
    ) {
        throw new Error(
            "La observación del cambio no puede superar los 500 caracteres"
        );
    }

    /*
     * La transacción evita que se creen simultáneamente
     * dos borradores para el mismo perfil de cargo.
     */
    const revision = await prisma.$transaction(
        async (transaction) => {
            /*
             * Verifica que el perfil de cargo exista
             * y se encuentre activo.
             */
            const positionProfile =
                await transaction.positionProfile.findFirst({
                    where: {
                        id: positionProfileId,
                        isActive: true,
                    },
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                });

            if (!positionProfile) {
                throw new Error(
                    "El perfil de cargo no existe o se encuentra inactivo"
                );
            }

            /*
             * Solo puede existir un borrador activo
             * por perfil de cargo.
             */
            const activeDraft =
                await transaction.positionProfileRevision.findFirst({
                    where: {
                        positionProfileId,
                        status: "BORRADOR",
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        revisionNumber: true,
                    },
                });

            if (activeDraft) {
                throw new Error(
                    "El perfil de cargo ya tiene una revisión activa en estado borrador"
                );
            }

            /*
             * Busca el número de revisión más alto.
             *
             * También tiene en cuenta las revisiones eliminadas
             * lógicamente para no reutilizar números anteriores.
             */
            const lastRevision =
                await transaction.positionProfileRevision.aggregate({
                    where: {
                        positionProfileId,
                    },
                    _max: {
                        revisionNumber: true,
                    },
                });

            const nextRevisionNumber =
                (lastRevision._max.revisionNumber ?? 0) + 1;

            /*
             * Crea la nueva revisión.
             *
             * revisionDate se genera automáticamente.
             * La revisión siempre inicia como BORRADOR.
             */
            const createdRevision =
                await transaction.positionProfileRevision.create({
                    data: {
                        positionProfileId,
                        revisionNumber: nextRevisionNumber,
                        status: "BORRADOR",
                        changeObservation:
                            normalizedChangeObservation,
                    },
                    select: {
                        id: true,
                        positionProfileId: true,
                        revisionNumber: true,
                        revisionDate: true,
                        status: true,
                        changeObservation: true,
                        deletedAt: true,
                        updatedAt: true,
                        positionProfile: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                homeDepartmentId: true,
                            },
                        },
                    },
                });

            await registerRevisionAudit(
                transaction,
                auditActor,
                AUDIT_ACTIONS.POSITION_REVISION_CREATED,
                createdRevision.id,
                "nueva revisión en borrador"
            );

            return createdRevision;
        },
        {
            isolationLevel:
                Prisma.TransactionIsolationLevel.Serializable,
        }
    );

    return revision;
};

// Obtiene las revisiones activas de un perfil de cargo.
export const getPositionProfileRevisionsService = async (
    positionProfileId: number
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    const positionProfile =
        await prisma.positionProfile.findUnique({
            where: {
                id: positionProfileId,
            },
            select: {
                id: true,
                code: true,
                name: true,
                isActive: true,
                homeDepartmentId: true,
            },
        });

    if (!positionProfile) {
        throw new Error(
            "El perfil de cargo no existe"
        );
    }

    const revisions =
        await prisma.positionProfileRevision.findMany({
            where: {
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                positionProfileId: true,
                revisionNumber: true,
                revisionDate: true,
                status: true,
                changeObservation: true,
                updatedAt: true,
            },
            orderBy: {
                revisionNumber: "desc",
            },
        });

    return {
        positionProfile,
        revisions,
    };
};

// Agrega una descripción a un requisito dentro de una revisión en borrador.
export const createPositionRequirementDescriptionService = async (
    positionProfileId: number,
    revisionId: number,
    requirementId: number,
    description: string,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    if (
        !Number.isInteger(requirementId) ||
        requirementId <= 0
    ) {
        throw new Error(
            "El id del requisito no es válido"
        );
    }

    const normalizedDescription = description.trim();

    if (!normalizedDescription) {
        throw new Error(
            "La descripción del requisito es obligatoria"
        );
    }

    if (normalizedDescription.length > 500) {
        throw new Error(
            "La descripción del requisito no puede superar los 500 caracteres"
        );
    }

    /*
     * Verifica que la revisión exista, pertenezca al cargo indicado
     * y no se encuentre eliminada lógicamente.
     */
    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                id: revisionId,
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
                revisionNumber: true,
            },
        });

    if (!revision) {
        throw new Error(
            "La revisión del perfil de cargo no existe"
        );
    }

    /*
     * Las descripciones solamente pueden modificarse
     * mientras la revisión esté en estado BORRADOR.
     */
    if (revision.status !== "BORRADOR") {
        throw new Error(
            "Solo se pueden agregar descripciones a una revisión en estado BORRADOR"
        );
    }

    const requirement =
        await prisma.positionRequirement.findUnique({
            where: {
                id: requirementId,
            },
            select: {
                id: true,
                name: true,
            },
        });

    if (!requirement) {
        throw new Error(
            "El requisito del perfil de cargo no existe"
        );
    }

    return prisma.$transaction(async (tx) => {
        const createdDescription =
            await tx.positionRequirementDescription.create({
                data: {
                    revisionId,
                    requirementId,
                    description: normalizedDescription,
                },
                select: {
                    id: true,
                    revisionId: true,
                    requirementId: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    requirement: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        await registerRevisionAudit(
            tx,
            auditActor,
            AUDIT_ACTIONS.POSITION_REQUIREMENT_ADDED,
            revisionId,
            `${requirement.name}: ${shortenAuditText(normalizedDescription)}`
        );

        return createdDescription;
    });
};

// Obtiene el detalle de una revisión con sus requisitos y descripciones.
export const getPositionProfileRevisionDetailService = async (
    positionProfileId: number,
    revisionId: number
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    /*
     * Verifica que la revisión exista, pertenezca al perfil
     * indicado y no esté eliminada lógicamente.
     */
    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                id: revisionId,
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                positionProfileId: true,
                revisionNumber: true,
                revisionDate: true,
                status: true,
                changeObservation: true,
                updatedAt: true,
                positionProfile: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        isActive: true,
                        homeDepartmentId: true,
                    },
                },
            },
        });

    if (!revision) {
        throw new Error(
            "La revisión del perfil de cargo no existe"
        );
    }

    /*
     * Obtiene todos los requisitos fijos.
     *
     * Cada requisito incluye únicamente las descripciones
     * activas que pertenecen a la revisión consultada.
     */
    const requirements =
        await prisma.positionRequirement.findMany({
            select: {
                id: true,
                name: true,
                descriptions: {
                    where: {
                        revisionId,
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        revisionId: true,
                        requirementId: true,
                        description: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: [
                        {
                            createdAt: "asc",
                        },
                        {
                            id: "asc",
                        },
                    ],
                },
            },
            orderBy: {
                id: "asc",
            },
        });

    /*
 * Obtiene todos los tipos de competencia configurados.
 *
 * Cada tipo incluye únicamente las competencias activas
 * asociadas a la revisión consultada.
 */
    const competencies =
        await prisma.competencyType.findMany({
            select: {
                id: true,
                name: true,
                positionCompetencyDescriptions: {
                    where: {
                        revisionId,
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        revisionId: true,
                        competencyTypeId: true,
                        competency: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: [
                        {
                            createdAt: "asc",
                        },
                        {
                            id: "asc",
                        },
                    ],
                },
            },
            orderBy: {
                id: "asc",
            },
        });

    return {
        ...revision,
        requirements,
        competencies,
    };
};

// Actualiza una descripción de un requisito dentro de una revisión en borrador.
export const updatePositionRequirementDescriptionService = async (
    positionProfileId: number,
    revisionId: number,
    requirementId: number,
    descriptionId: number,
    description: string,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    if (
        !Number.isInteger(requirementId) ||
        requirementId <= 0
    ) {
        throw new Error(
            "El id del requisito no es válido"
        );
    }

    if (
        !Number.isInteger(descriptionId) ||
        descriptionId <= 0
    ) {
        throw new Error(
            "El id de la descripción no es válido"
        );
    }

    const normalizedDescription = description.trim();

    if (!normalizedDescription) {
        throw new Error(
            "La descripción del requisito es obligatoria"
        );
    }

    if (normalizedDescription.length > 500) {
        throw new Error(
            "La descripción del requisito no puede superar los 500 caracteres"
        );
    }

    /*
     * Verifica que la descripción exista, pertenezca al requisito
     * y a la revisión indicados, y no esté eliminada.
     */
    const requirementDescription =
        await prisma.positionRequirementDescription.findFirst({
            where: {
                id: descriptionId,
                revisionId,
                requirementId,
                deletedAt: null,
                revision: {
                    positionProfileId,
                    deletedAt: null,
                },
            },
            select: {
                id: true,
                revisionId: true,
                requirementId: true,
                description: true,
                requirement: {
                    select: {
                        name: true,
                    },
                },
                revision: {
                    select: {
                        status: true,
                    },
                },
            },
        });

    if (!requirementDescription) {
        throw new Error(
            "La descripción del requisito no existe"
        );
    }

    /*
     * Solo se pueden modificar descripciones
     * de revisiones en estado BORRADOR.
     */
    if (
        requirementDescription.revision.status !==
        "BORRADOR"
    ) {
        throw new Error(
            "Solo se pueden actualizar descripciones de una revisión en estado BORRADOR"
        );
    }

    return prisma.$transaction(async (tx) => {
        const updatedDescription =
            await tx.positionRequirementDescription.update({
                where: {
                    id: descriptionId,
                },
                data: {
                    description: normalizedDescription,
                },
                select: {
                    id: true,
                    revisionId: true,
                    requirementId: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    requirement: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        // Solo se registra si el texto realmente cambió.
        if (
            requirementDescription.description !==
            normalizedDescription
        ) {
            await registerRevisionAudit(
                tx,
                auditActor,
                AUDIT_ACTIONS.POSITION_REQUIREMENT_UPDATED,
                revisionId,
                `${requirementDescription.requirement.name}: ${shortenAuditText(requirementDescription.description, 80)} → ${shortenAuditText(normalizedDescription, 80)}`
            );
        }

        return updatedDescription;
    });
};

// Elimina lógicamente una descripción de una revisión en borrador.
export const deletePositionRequirementDescriptionService = async (
    positionProfileId: number,
    revisionId: number,
    requirementId: number,
    descriptionId: number,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    if (
        !Number.isInteger(requirementId) ||
        requirementId <= 0
    ) {
        throw new Error(
            "El id del requisito no es válido"
        );
    }

    if (
        !Number.isInteger(descriptionId) ||
        descriptionId <= 0
    ) {
        throw new Error(
            "El id de la descripción no es válido"
        );
    }

    /*
     * Verifica que la descripción exista, no esté eliminada
     * y pertenezca al cargo, revisión y requisito indicados.
     */
    const requirementDescription =
        await prisma.positionRequirementDescription.findFirst({
            where: {
                id: descriptionId,
                revisionId,
                requirementId,
                deletedAt: null,
                revision: {
                    positionProfileId,
                    deletedAt: null,
                },
            },
            select: {
                id: true,
                revisionId: true,
                requirementId: true,
                description: true,
                requirement: {
                    select: {
                        name: true,
                    },
                },
                revision: {
                    select: {
                        status: true,
                    },
                },
            },
        });

    if (!requirementDescription) {
        throw new Error(
            "La descripción del requisito no existe"
        );
    }

    /*
     * Las descripciones únicamente pueden eliminarse
     * cuando la revisión está en estado BORRADOR.
     */
    if (
        requirementDescription.revision.status !==
        "BORRADOR"
    ) {
        throw new Error(
            "Solo se pueden eliminar descripciones de una revisión en estado BORRADOR"
        );
    }

    return prisma.$transaction(async (tx) => {
        const deletedDescription =
            await tx.positionRequirementDescription.update({
                where: {
                    id: descriptionId,
                },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    revisionId: true,
                    requirementId: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    requirement: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        await registerRevisionAudit(
            tx,
            auditActor,
            AUDIT_ACTIONS.POSITION_REQUIREMENT_DELETED,
            revisionId,
            `${requirementDescription.requirement.name}: eliminó "${shortenAuditText(requirementDescription.description)}"`
        );

        return deletedDescription;
    });
};

// Agrega una competencia dentro de una revisión en borrador.
export const createPositionCompetencyDescriptionService = async (
    positionProfileId: number,
    revisionId: number,
    competencyTypeId: number,
    competency: string,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    if (
        !Number.isInteger(competencyTypeId) ||
        competencyTypeId <= 0
    ) {
        throw new Error(
            "El id del tipo de competencia no es válido"
        );
    }

    const normalizedCompetency =
        competency.trim();

    if (!normalizedCompetency) {
        throw new Error(
            "La competencia es obligatoria"
        );
    }

    if (normalizedCompetency.length > 500) {
        throw new Error(
            "La competencia no puede superar los 500 caracteres"
        );
    }

    /*
     * Verifica que la revisión exista, pertenezca al cargo
     * indicado y no esté eliminada lógicamente.
     */
    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                id: revisionId,
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
                revisionNumber: true,
            },
        });

    if (!revision) {
        throw new Error(
            "La revisión del perfil de cargo no existe"
        );
    }

    /*
     * Las competencias solamente pueden asociarse
     * mientras la revisión esté en estado BORRADOR.
     */
    if (revision.status !== "BORRADOR") {
        throw new Error(
            "Solo se pueden agregar competencias a una revisión en estado BORRADOR"
        );
    }

    /*
     * Verifica que el tipo de competencia exista.
     */
    const competencyType =
        await prisma.competencyType.findUnique({
            where: {
                id: competencyTypeId,
            },
            select: {
                id: true,
                name: true,
            },
        });

    if (!competencyType) {
        throw new Error(
            "El tipo de competencia no existe"
        );
    }

    /*
     * Evita registrar dos veces la misma competencia
     * dentro de la misma revisión y tipo.
     */
    const existingCompetency =
        await prisma.positionCompetencyDescription.findFirst({
            where: {
                revisionId,
                competencyTypeId,
                competency: normalizedCompetency,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

    if (existingCompetency) {
        throw new Error(
            "La competencia ya se encuentra asociada a esta revisión"
        );
    }

    return prisma.$transaction(async (tx) => {
        const createdCompetency =
            await tx.positionCompetencyDescription.create({
                data: {
                    revisionId,
                    competencyTypeId,
                    competency: normalizedCompetency,
                },
                select: {
                    id: true,
                    revisionId: true,
                    competencyTypeId: true,
                    competency: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    competencyType: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        await registerRevisionAudit(
            tx,
            auditActor,
            AUDIT_ACTIONS.POSITION_COMPETENCY_ADDED,
            revisionId,
            `${competencyType.name}: ${shortenAuditText(normalizedCompetency)}`
        );

        return createdCompetency;
    });
};

// Actualiza la descripción de una competencia asociada a una revisión en borrador.
export const updatePositionCompetencyDescriptionService = async (
    positionProfileId: number,
    revisionId: number,
    competencyDescriptionId: number,
    competency: string,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    if (
        !Number.isInteger(competencyDescriptionId) ||
        competencyDescriptionId <= 0
    ) {
        throw new Error(
            "El id de la competencia no es válido"
        );
    }

    const normalizedCompetency =
        competency.trim();

    if (!normalizedCompetency) {
        throw new Error(
            "La competencia es obligatoria"
        );
    }

    if (normalizedCompetency.length > 500) {
        throw new Error(
            "La competencia no puede superar los 500 caracteres"
        );
    }

    /*
     * Verifica que la revisión exista, pertenezca al cargo
     * indicado y no esté eliminada lógicamente.
     */
    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                id: revisionId,
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
            },
        });

    if (!revision) {
        throw new Error(
            "La revisión del perfil de cargo no existe"
        );
    }

    /*
     * Las competencias solamente pueden editarse
     * mientras la revisión esté en estado BORRADOR.
     */
    if (revision.status !== "BORRADOR") {
        throw new Error(
            "Solo se pueden actualizar competencias de una revisión en estado BORRADOR"
        );
    }

    /*
     * Busca la competencia asociada a la revisión.
     */
    const existingCompetency =
        await prisma.positionCompetencyDescription.findFirst({
            where: {
                id: competencyDescriptionId,
                revisionId,
                deletedAt: null,
            },
            select: {
                id: true,
                competencyTypeId: true,
                competency: true,
                competencyType: {
                    select: {
                        name: true,
                    },
                },
            },
        });

    if (!existingCompetency) {
        throw new Error(
            "La competencia no existe en la revisión"
        );
    }

    /*
     * Evita que la actualización genere una competencia
     * duplicada dentro del mismo tipo y revisión.
     */
    const duplicatedCompetency =
        await prisma.positionCompetencyDescription.findFirst({
            where: {
                revisionId,
                competencyTypeId:
                    existingCompetency.competencyTypeId,
                competency: normalizedCompetency,
                deletedAt: null,

                NOT: {
                    id: competencyDescriptionId,
                },
            },
            select: {
                id: true,
            },
        });

    if (duplicatedCompetency) {
        throw new Error(
            "La competencia ya se encuentra asociada a esta revisión"
        );
    }

    return prisma.$transaction(async (tx) => {
        const updatedCompetency =
            await tx.positionCompetencyDescription.update({
                where: {
                    id: competencyDescriptionId,
                },
                data: {
                    competency: normalizedCompetency,
                },
                select: {
                    id: true,
                    revisionId: true,
                    competencyTypeId: true,
                    competency: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                    competencyType: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        // Solo se registra si el texto realmente cambió.
        if (
            existingCompetency.competency !==
            normalizedCompetency
        ) {
            await registerRevisionAudit(
                tx,
                auditActor,
                AUDIT_ACTIONS.POSITION_COMPETENCY_UPDATED,
                revisionId,
                `${existingCompetency.competencyType.name}: ${shortenAuditText(existingCompetency.competency, 80)} → ${shortenAuditText(normalizedCompetency, 80)}`
            );
        }

        return updatedCompetency;
    });
};

// Elimina lógicamente una competencia asociada a una revisión en borrador.
export const deletePositionCompetencyDescriptionService = async (
    positionProfileId: number,
    revisionId: number,
    competencyDescriptionId: number,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    if (
        !Number.isInteger(competencyDescriptionId) ||
        competencyDescriptionId <= 0
    ) {
        throw new Error(
            "El id de la competencia no es válido"
        );
    }

    /*
     * Verifica que la revisión exista, pertenezca al cargo
     * indicado y no esté eliminada lógicamente.
     */
    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                id: revisionId,
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
            },
        });

    if (!revision) {
        throw new Error(
            "La revisión del perfil de cargo no existe"
        );
    }

    /*
     * Las competencias solamente pueden eliminarse
     * mientras la revisión esté en estado BORRADOR.
     */
    if (revision.status !== "BORRADOR") {
        throw new Error(
            "Solo se pueden eliminar competencias de una revisión en estado BORRADOR"
        );
    }

    /*
     * Verifica que la competencia pertenezca a la revisión
     * y que no haya sido eliminada anteriormente.
     */
    const existingCompetency =
        await prisma.positionCompetencyDescription.findFirst({
            where: {
                id: competencyDescriptionId,
                revisionId,
                deletedAt: null,
            },
            select: {
                id: true,
                competency: true,
                competencyType: {
                    select: {
                        name: true,
                    },
                },
            },
        });

    if (!existingCompetency) {
        throw new Error(
            "La competencia no existe en la revisión"
        );
    }

    /*
     * Eliminación lógica.
     */
    return prisma.$transaction(async (tx) => {
        const deletedCompetency =
            await tx.positionCompetencyDescription.update({
                where: {
                    id: competencyDescriptionId,
                },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    revisionId: true,
                    competencyTypeId: true,
                    competency: true,
                    deletedAt: true,
                },
            });

        await registerRevisionAudit(
            tx,
            auditActor,
            AUDIT_ACTIONS.POSITION_COMPETENCY_DELETED,
            revisionId,
            `${existingCompetency.competencyType.name}: eliminó "${shortenAuditText(existingCompetency.competency)}"`
        );

        return deletedCompetency;
    });
};

// Actualiza la observación de una revisión en estado BORRADOR.
export const updatePositionProfileRevisionService = async (
    positionProfileId: number,
    revisionId: number,
    changeObservation: string | null,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    const normalizedChangeObservation =
        typeof changeObservation === "string"
            ? changeObservation.trim() || null
            : null;

    if (
        normalizedChangeObservation &&
        normalizedChangeObservation.length > 500
    ) {
        throw new Error(
            "La observación del cambio no puede superar los 500 caracteres"
        );
    }

    /*
     * Verifica que la revisión exista, pertenezca al perfil
     * indicado y no esté eliminada lógicamente.
     */
    const revision =
        await prisma.positionProfileRevision.findFirst({
            where: {
                id: revisionId,
                positionProfileId,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
            },
        });

    if (!revision) {
        throw new Error(
            "La revisión del perfil de cargo no existe"
        );
    }

    /*
     * Una revisión solamente puede modificarse
     * mientras permanezca en estado BORRADOR.
     */
    if (revision.status !== "BORRADOR") {
        throw new Error(
            "Solo se puede actualizar una revisión en estado BORRADOR"
        );
    }

    return prisma.$transaction(async (tx) => {
        const updatedRevision =
            await tx.positionProfileRevision.update({
                where: {
                    id: revisionId,
                },
                data: {
                    changeObservation:
                        normalizedChangeObservation,
                },
                select: {
                    id: true,
                    positionProfileId: true,
                    revisionNumber: true,
                    revisionDate: true,
                    status: true,
                    changeObservation: true,
                    deletedAt: true,
                    updatedAt: true,
                    positionProfile: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            homeDepartmentId: true,
                        },
                    },
                },
            });

        await registerRevisionAudit(
            tx,
            auditActor,
            AUDIT_ACTIONS.POSITION_REVISION_UPDATED,
            revisionId,
            "actualizó la observación del cambio"
        );

        return updatedRevision;
    });
};

// Publica una revisión de perfil de cargo en estado BORRADOR.
export const publishPositionProfileRevisionService = async (
    positionProfileId: number,
    revisionId: number,
    auditActor: AuditActor
) => {
    if (
        !Number.isInteger(positionProfileId) ||
        positionProfileId <= 0
    ) {
        throw new Error(
            "El id del perfil de cargo no es válido"
        );
    }

    if (
        !Number.isInteger(revisionId) ||
        revisionId <= 0
    ) {
        throw new Error(
            "El id de la revisión no es válido"
        );
    }

    return prisma.$transaction(
        async (transaction) => {
            /*
             * Verifica que la revisión exista, pertenezca al cargo
             * y no se encuentre eliminada lógicamente.
             */
            const revision =
                await transaction.positionProfileRevision.findFirst({
                    where: {
                        id: revisionId,
                        positionProfileId,
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        status: true,
                        revisionNumber: true,
                    },
                });

            if (!revision) {
                throw new Error(
                    "La revisión del perfil de cargo no existe"
                );
            }

            /*
             * Solamente una revisión en estado BORRADOR
             * puede publicarse.
             */
            if (revision.status !== "BORRADOR") {
                throw new Error(
                    "Solo se puede publicar una revisión en estado BORRADOR"
                );
            }

            /*
             * Obtiene los requisitos fijos y verifica que cada uno
             * tenga al menos una descripción activa en la revisión.
             */
            const requirements =
                await transaction.positionRequirement.findMany({
                    select: {
                        id: true,
                        name: true,
                        descriptions: {
                            where: {
                                revisionId,
                                deletedAt: null,
                            },
                            select: {
                                id: true,
                            },
                            take: 1,
                        },
                    },
                    orderBy: {
                        id: "asc",
                    },
                });

            if (requirements.length === 0) {
                throw new Error(
                    "No existen requisitos configurados para los perfiles de cargo"
                );
            }

            const missingRequirements = requirements
                .filter((requirement) => {
                    return requirement.descriptions.length === 0;
                })
                .map((requirement) => {
                    return requirement.name;
                });

            if (missingRequirements.length > 0) {
                throw new Error(
                    `No se puede publicar la revisión. Faltan descripciones para: ${missingRequirements.join(", ")}`
                );
            }

            /*
            * Obtiene todos los tipos de competencia configurados y verifica
            * que cada uno tenga al menos una competencia activa en la revisión.
            */
            const competencyTypes =
                await transaction.competencyType.findMany({
                    select: {
                        id: true,
                        name: true,
                    },
                    orderBy: {
                        id: "asc",
                    },
                });

            if (competencyTypes.length === 0) {
                throw new Error(
                    "No existen tipos de competencia configurados"
                );
            }

            /*
             * Agrupa las competencias activas de la revisión por tipo.
             */
            const competencyCounts =
                await transaction.positionCompetencyDescription.groupBy({
                    by: ["competencyTypeId"],
                    where: {
                        revisionId,
                        deletedAt: null,
                    },
                    _count: {
                        id: true,
                    },
                });

            /*
             * Identifica los tipos de competencia que no tienen
             * ninguna competencia activa asociada a la revisión.
             */
            const missingCompetencyTypes =
                competencyTypes
                    .filter((competencyType) => {
                        const competencyCount =
                            competencyCounts.find(
                                (item) =>
                                    item.competencyTypeId ===
                                    competencyType.id
                            );

                        return (
                            !competencyCount ||
                            competencyCount._count.id === 0
                        );
                    })
                    .map((competencyType) => {
                        return competencyType.name;
                    });

            if (missingCompetencyTypes.length > 0) {
                throw new Error(
                    `No se puede publicar la revisión. Faltan competencias para: ${missingCompetencyTypes.join(", ")}`
                );
            }

            /*
             * La revisión vigente anterior del mismo cargo,
             * si existe, pasa a estado OBSOLETA.
             */
            const obsoleteResult =
                await transaction.positionProfileRevision.updateMany({
                    where: {
                        positionProfileId,
                        status: "VIGENTE",
                        deletedAt: null,
                        id: {
                            not: revisionId,
                        },
                    },
                    data: {
                        status: "OBSOLETA",
                    },
                });

            /*
             * La revisión seleccionada pasa a estado VIGENTE.
             */
            const publishedRevision =
                await transaction.positionProfileRevision.update({
                    where: {
                        id: revisionId,
                    },
                    data: {
                        status: "VIGENTE",
                    },
                    select: {
                        id: true,
                        positionProfileId: true,
                        revisionNumber: true,
                        revisionDate: true,
                        status: true,
                        changeObservation: true,
                        deletedAt: true,
                        updatedAt: true,
                        positionProfile: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                homeDepartmentId: true,
                            },
                        },
                    },
                });

            await registerRevisionAudit(
                transaction,
                auditActor,
                AUDIT_ACTIONS.POSITION_REVISION_PUBLISHED,
                revisionId,
                obsoleteResult.count > 0
                    ? "publicada (la revisión anterior quedó obsoleta)"
                    : "publicada"
            );

            return publishedRevision;
        },
        {
            isolationLevel:
                Prisma.TransactionIsolationLevel.Serializable,
        }
    );
};