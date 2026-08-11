import type { Response } from "express";

import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";
import type { CreatePositionProfileRevisionBody, CreatePositionRequirementDescriptionBody, UpdatePositionProfileRevisionBody, UpdatePositionRequirementDescriptionBody } from "../../interfaces/positionManagement/positionProfileRevision.interface.js";

import {
    createPositionProfileRevisionService,
    createPositionRequirementDescriptionService,
    deletePositionProfileRevisionService,
    deletePositionRequirementDescriptionService,
    getCurrentPositionProfileRevisionService,
    getPositionProfileRevisionDetailService,
    getPositionProfileRevisionsService,
    publishPositionProfileRevisionService,
    updatePositionProfileRevisionService,
    updatePositionRequirementDescriptionService,
} from "../../services/positionManagement/positionProfileRevision.service.js";

// Crea una nueva revisión en borrador para un perfil de cargo.
export const createPositionProfileRevision = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(req.params.positionProfileId);

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message: "El id del perfil de cargo no es válido",
            });
        }

        const {
            changeObservation,
        } = (req.body ?? {}) as CreatePositionProfileRevisionBody;

        if (
            changeObservation !== undefined &&
            typeof changeObservation !== "string"
        ) {
            return res.status(400).json({
                message: "La observación del cambio debe ser un texto",
            });
        }

        const revision =
            await createPositionProfileRevisionService(
                positionProfileId,
                changeObservation
            );

        return res.status(201).json({
            message:
                "Revisión del perfil de cargo creada correctamente",
            revision,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "El perfil de cargo no existe o se encuentra inactivo"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El perfil de cargo ya tiene una revisión activa en estado borrador"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "La observación del cambio no puede superar los 500 caracteres"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al crear la revisión del perfil de cargo",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Obtiene las revisiones de un perfil de cargo.
export const getPositionProfileRevisions = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(req.params.positionProfileId);

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        const result =
            await getPositionProfileRevisionsService(
                positionProfileId
            );

        return res.status(200).json({
            message:
                "Revisiones del perfil de cargo obtenidas correctamente",
            positionProfile: result.positionProfile,
            revisions: result.revisions,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "El perfil de cargo no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al obtener las revisiones del perfil de cargo",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Obtiene la revisión vigente de un perfil de cargo.
export const getCurrentPositionProfileRevision = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        const result =
            await getCurrentPositionProfileRevisionService(
                positionProfileId
            );

        if (!result.revision) {
            return res.status(200).json({
                message:
                    "El perfil de cargo no tiene una revisión vigente",
                revision: null,
            });
        }

        return res.status(200).json({
            message:
                "Revisión vigente del perfil de cargo obtenida correctamente",
            revision: result.revision,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "El perfil de cargo no existe o se encuentra inactivo"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al obtener la revisión vigente del perfil de cargo",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Agrega una descripción a un requisito de una revisión en borrador.
export const createPositionRequirementDescription = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(req.params.positionProfileId);
        const revisionId = Number(req.params.revisionId);
        const requirementId = Number(req.params.requirementId);

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message: "El id de la revisión no es válido",
            });
        }

        if (
            !Number.isInteger(requirementId) ||
            requirementId <= 0
        ) {
            return res.status(400).json({
                message: "El id del requisito no es válido",
            });
        }

        const {
            description,
        } = (req.body ?? {}) as CreatePositionRequirementDescriptionBody;

        if (typeof description !== "string") {
            return res.status(400).json({
                message:
                    "La descripción del requisito debe ser un texto",
            });
        }

        const requirementDescription =
            await createPositionRequirementDescriptionService(
                positionProfileId,
                revisionId,
                requirementId,
                description
            );

        return res.status(201).json({
            message:
                "Descripción del requisito registrada correctamente",
            requirementDescription,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La revisión del perfil de cargo no existe" ||
                error.message ===
                "El requisito del perfil de cargo no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Solo se pueden agregar descripciones a una revisión en estado BORRADOR"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido" ||
                error.message ===
                "El id del requisito no es válido" ||
                error.message ===
                "La descripción del requisito es obligatoria" ||
                error.message ===
                "La descripción del requisito no puede superar los 500 caracteres"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al registrar la descripción del requisito",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Obtiene el detalle de una revisión de un perfil de cargo.
export const getPositionProfileRevisionDetail = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        const revisionId = Number(
            req.params.revisionId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la revisión no es válido",
            });
        }

        const revision =
            await getPositionProfileRevisionDetailService(
                positionProfileId,
                revisionId
            );

        return res.status(200).json({
            message:
                "Detalle de la revisión obtenido correctamente",
            revision,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La revisión del perfil de cargo no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al obtener el detalle de la revisión",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Actualiza una descripción de un requisito de una revisión en borrador.
export const updatePositionRequirementDescription = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        const revisionId = Number(
            req.params.revisionId
        );

        const requirementId = Number(
            req.params.requirementId
        );

        const descriptionId = Number(
            req.params.descriptionId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la revisión no es válido",
            });
        }

        if (
            !Number.isInteger(requirementId) ||
            requirementId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del requisito no es válido",
            });
        }

        if (
            !Number.isInteger(descriptionId) ||
            descriptionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la descripción no es válido",
            });
        }

        const {
            description,
        } = (req.body ?? {}) as UpdatePositionRequirementDescriptionBody;

        if (typeof description !== "string") {
            return res.status(400).json({
                message:
                    "La descripción del requisito debe ser un texto",
            });
        }

        const requirementDescription =
            await updatePositionRequirementDescriptionService(
                positionProfileId,
                revisionId,
                requirementId,
                descriptionId,
                description
            );

        return res.status(200).json({
            message:
                "Descripción del requisito actualizada correctamente",
            requirementDescription,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La descripción del requisito no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Solo se pueden actualizar descripciones de una revisión en estado BORRADOR"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido" ||
                error.message ===
                "El id del requisito no es válido" ||
                error.message ===
                "El id de la descripción no es válido" ||
                error.message ===
                "La descripción del requisito es obligatoria" ||
                error.message ===
                "La descripción del requisito no puede superar los 500 caracteres"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al actualizar la descripción del requisito",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Elimina lógicamente una descripción de una revisión en borrador.
export const deletePositionRequirementDescription = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        const revisionId = Number(
            req.params.revisionId
        );

        const requirementId = Number(
            req.params.requirementId
        );

        const descriptionId = Number(
            req.params.descriptionId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la revisión no es válido",
            });
        }

        if (
            !Number.isInteger(requirementId) ||
            requirementId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del requisito no es válido",
            });
        }

        if (
            !Number.isInteger(descriptionId) ||
            descriptionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la descripción no es válido",
            });
        }

        const requirementDescription =
            await deletePositionRequirementDescriptionService(
                positionProfileId,
                revisionId,
                requirementId,
                descriptionId
            );

        return res.status(200).json({
            message:
                "Descripción del requisito eliminada correctamente",
            requirementDescription,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La descripción del requisito no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Solo se pueden eliminar descripciones de una revisión en estado BORRADOR"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido" ||
                error.message ===
                "El id del requisito no es válido" ||
                error.message ===
                "El id de la descripción no es válido"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al eliminar la descripción del requisito",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Actualiza la observación de una revisión en borrador.
export const updatePositionProfileRevision = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        const revisionId = Number(
            req.params.revisionId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la revisión no es válido",
            });
        }

        const body =
            (req.body ?? {}) as Partial<UpdatePositionProfileRevisionBody>;

        if (
            !Object.prototype.hasOwnProperty.call(
                body,
                "changeObservation"
            )
        ) {
            return res.status(400).json({
                message:
                    "Debe enviar la observación del cambio",
            });
        }

        if (
            body.changeObservation !== null &&
            typeof body.changeObservation !== "string"
        ) {
            return res.status(400).json({
                message:
                    "La observación del cambio debe ser un texto o null",
            });
        }

        const revision =
            await updatePositionProfileRevisionService(
                positionProfileId,
                revisionId,
                body.changeObservation
            );

        return res.status(200).json({
            message:
                "Revisión del perfil de cargo actualizada correctamente",
            revision,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La revisión del perfil de cargo no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Solo se puede actualizar una revisión en estado BORRADOR"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido" ||
                error.message ===
                "La observación del cambio no puede superar los 500 caracteres"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al actualizar la revisión del perfil de cargo",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Elimina lógicamente una revisión de perfil de cargo en borrador.
export const deletePositionProfileRevision = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        const revisionId = Number(
            req.params.revisionId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la revisión no es válido",
            });
        }

        const revision =
            await deletePositionProfileRevisionService(
                positionProfileId,
                revisionId
            );

        return res.status(200).json({
            message:
                "Revisión del perfil de cargo eliminada correctamente",
            revision,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La revisión del perfil de cargo no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Solo se puede eliminar una revisión en estado BORRADOR"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido"
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al eliminar la revisión del perfil de cargo",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

// Publica una revisión de perfil de cargo.
export const publishPositionProfileRevision = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const positionProfileId = Number(
            req.params.positionProfileId
        );

        const revisionId = Number(
            req.params.revisionId
        );

        if (
            !Number.isInteger(positionProfileId) ||
            positionProfileId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id del perfil de cargo no es válido",
            });
        }

        if (
            !Number.isInteger(revisionId) ||
            revisionId <= 0
        ) {
            return res.status(400).json({
                message:
                    "El id de la revisión no es válido",
            });
        }

        const revision =
            await publishPositionProfileRevisionService(
                positionProfileId,
                revisionId
            );

        return res.status(200).json({
            message:
                "Revisión del perfil de cargo publicada correctamente",
            revision,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message ===
                "La revisión del perfil de cargo no existe"
            ) {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Solo se puede publicar una revisión en estado BORRADOR"
            ) {
                return res.status(409).json({
                    message: error.message,
                });
            }

            if (
                error.message ===
                "El id del perfil de cargo no es válido" ||
                error.message ===
                "El id de la revisión no es válido" ||
                error.message ===
                "No existen requisitos configurados para los perfiles de cargo" ||
                error.message.startsWith(
                    "No se puede publicar la revisión."
                )
            ) {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message:
                "Error al publicar la revisión del perfil de cargo",
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};