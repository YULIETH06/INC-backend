import fs from "fs/promises";
import path from "path";

import type { Response } from "express";

import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";

import {
    closePersonnelRequisitionCandidatesService,
    createPersonnelRequisitionCandidateService,
    deletePersonnelRequisitionCandidateService,
    getPersonnelRequisitionCandidatesService,
    reopenPersonnelRequisitionCandidatesService,
    updatePersonnelRequisitionCandidateService,
} from "../../services/humanTalent/personnelRequisitionCandidate.service.js";
import type { UpdatePersonnelRequisitionCandidateData } from "../../interfaces/humanTalent/personnelRequisitionCandidate.interface.js";
import {
    containsOnlyNumbers,
    containsOnlyLetters,
} from "../../utils/validators.js";

// Elimina del servidor un archivo que no pudo registrarse en la base de datos.
const removeUploadedCandidateFile = async (
    file?: Express.Multer.File
) => {
    if (!file?.path) {
        return;
    }

    try {
        await fs.unlink(file.path);
    } catch (error) {
        // No interrumpe la respuesta si el archivo ya no existe.
        if (
            !(
                error instanceof Error &&
                "code" in error &&
                error.code === "ENOENT"
            )
        ) {
            console.error(
                "No se pudo eliminar la hoja de vida:",
                error
            );
        }
    }
};

// Registra un candidato y su hoja de vida.
export const createPersonnelRequisitionCandidate =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                await removeUploadedCandidateFile(req.file);

                return res.status(401).json({
                    message: "Usuario no autenticado",
                });
            }

            const requisitionId = Number(req.params.id);

            if (
                !requisitionId ||
                Number.isNaN(requisitionId)
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El id de la requisición no es válido",
                });
            }

            const body = req.body ?? {};

            const name =
                typeof body.name === "string"
                    ? body.name.trim()
                    : "";

            const observation =
                typeof body.observation === "string"
                    ? body.observation.trim()
                    : "";

            const identificationTypeId = Number(
                body.identificationTypeId
            );

            const identificationNumber =
                typeof body.identificationNumber === "string"
                    ? body.identificationNumber.trim()
                    : "";

            if (!name) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato es obligatorio",
                });
            }

            if (name.length < 3) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato debe tener mínimo 3 caracteres",
                });
            }

            if (name.length > 150) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato no puede superar los 150 caracteres",
                });
            }

            if (!containsOnlyLetters(name)) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato solo puede contener letras",
                });
            }

            if (
                !Number.isInteger(identificationTypeId) ||
                identificationTypeId <= 0
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El tipo de identificación no es válido",
                });
            }

            if (!identificationNumber) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El número de identificación es obligatorio",
                });
            }

            if (identificationNumber.length > 50) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El número de identificación no puede superar los 50 caracteres",
                });
            }

            if (
                !containsOnlyNumbers(
                    identificationNumber
                )
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El número de identificación solo puede contener números",
                });
            }

            if (observation.length > 500) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "La observación no puede superar los 500 caracteres",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    message:
                        "La hoja de vida es obligatoria",
                });
            }

            const candidate =
                await createPersonnelRequisitionCandidateService(
                    {
                        requisitionId,

                        identificationTypeId,
                        identificationNumber,

                        name,
                        observation: observation || null,

                        originalName: req.file.originalname,
                        fileName: req.file.filename,
                        fileUrl:
                            `/uploads/human-talent/candidates/${req.file.filename}`,
                        mimeType: req.file.mimetype,
                        fileSize: req.file.size,

                        uploadedById: req.user.id,
                    },
                    req.user
                );

            return res.status(201).json({
                message:
                    "Candidato registrado correctamente",
                candidate,
            });
        } catch (error) {
            await removeUploadedCandidateFile(req.file);

            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al registrar el candidato",
            });
        }
    };

// Obtiene los candidatos registrados en una requisición de personal.
export const getPersonnelRequisitionCandidates =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Usuario no autenticado",
                });
            }

            const requisitionId = Number(req.params.id);

            if (
                !Number.isInteger(requisitionId) ||
                requisitionId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "El id de la requisición no es válido",
                });
            }

            const result =
                await getPersonnelRequisitionCandidatesService(
                    requisitionId,
                    req.user
                );

            return res.status(200).json({
                message:
                    "Candidatos obtenidos correctamente",
                candidates: result.candidates,
                isCandidateManager: result.isCandidateManager,
            });
        } catch (error) {
            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al obtener los candidatos",
            });
        }
    };

// Cierra el proceso de cargue de candidatos de una requisición.
export const closePersonnelRequisitionCandidates =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Usuario no autenticado",
                });
            }

            const requisitionId = Number(req.params.id);

            if (
                !Number.isInteger(requisitionId) ||
                requisitionId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "El id de la requisición no es válido",
                });
            }

            const requisition =
                await closePersonnelRequisitionCandidatesService(
                    requisitionId,
                    req.user
                );

            return res.status(200).json({
                message:
                    "Cargue de candidatos cerrado correctamente",
                requisition,
            });
        } catch (error) {
            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al cerrar el cargue de candidatos",
            });
        }
    };

// Reabre el proceso de cargue de candidatos de una requisición.
export const reopenPersonnelRequisitionCandidates =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            // Valida que exista un usuario autenticado.
            if (!req.user) {
                return res.status(401).json({
                    message: "Usuario no autenticado",
                });
            }

            const requisitionId = Number(req.params.id);

            // Valida que el id recibido sea un número entero válido.
            if (
                !Number.isInteger(requisitionId) ||
                requisitionId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "El id de la requisición no es válido",
                });
            }

            // Reabre el cargue de candidatos de la requisición.
            const requisition =
                await reopenPersonnelRequisitionCandidatesService(
                    requisitionId,
                    req.user
                );

            return res.status(200).json({
                message:
                    "Cargue de candidatos reabierto correctamente",
                requisition,
            });
        } catch (error) {
            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al reabrir el cargue de candidatos",
            });
        }
    };

// Elimina del servidor la hoja de vida de un candidato registrado.
const removeStoredCandidateFile = async (
    fileName: string
) => {
    const filePath = path.join(
        process.cwd(),
        "uploads",
        "human-talent",
        "candidates",
        fileName
    );

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (
            !(
                error instanceof Error &&
                "code" in error &&
                error.code === "ENOENT"
            )
        ) {
            console.error(
                "No se pudo eliminar la hoja de vida del candidato:",
                error
            );
        }
    }
};

// Elimina un candidato y su hoja de vida de una requisición.
export const deletePersonnelRequisitionCandidate =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Usuario no autenticado",
                });
            }

            const requisitionId = Number(req.params.id);
            const candidateId = Number(
                req.params.candidateId
            );

            if (
                !Number.isInteger(requisitionId) ||
                requisitionId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "El id de la requisición no es válido",
                });
            }

            if (
                !Number.isInteger(candidateId) ||
                candidateId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "El id del candidato no es válido",
                });
            }

            const candidate =
                await deletePersonnelRequisitionCandidateService(
                    requisitionId,
                    candidateId,
                    req.user
                );

            await removeStoredCandidateFile(
                candidate.fileName
            );

            return res.status(200).json({
                message:
                    "Candidato eliminado correctamente",
                candidate,
            });
        } catch (error) {
            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al eliminar el candidato",
            });
        }
    };

// Actualiza los datos o la hoja de vida de un candidato.
export const updatePersonnelRequisitionCandidate =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (!req.user) {
                await removeUploadedCandidateFile(req.file);

                return res.status(401).json({
                    message: "Usuario no autenticado",
                });
            }

            const requisitionId = Number(req.params.id);
            const candidateId = Number(
                req.params.candidateId
            );

            if (
                !Number.isInteger(requisitionId) ||
                requisitionId <= 0
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El id de la requisición no es válido",
                });
            }

            if (
                !Number.isInteger(candidateId) ||
                candidateId <= 0
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El id del candidato no es válido",
                });
            }

            const body = req.body ?? {};

            const hasIdentificationTypeId =
                Object.prototype.hasOwnProperty.call(
                    body,
                    "identificationTypeId"
                );

            const hasIdentificationNumber =
                Object.prototype.hasOwnProperty.call(
                    body,
                    "identificationNumber"
                );

            const hasName =
                Object.prototype.hasOwnProperty.call(
                    body,
                    "name"
                );

            const hasObservation =
                Object.prototype.hasOwnProperty.call(
                    body,
                    "observation"
                );

            const hasFile = Boolean(req.file);

            if (
                !hasName &&
                !hasObservation &&
                !hasIdentificationTypeId &&
                !hasIdentificationNumber &&
                !hasFile
            ) {
                return res.status(400).json({
                    message:
                        "Debe enviar al menos un dato para actualizar",
                });
            }

            const identificationTypeId =
                hasIdentificationTypeId
                    ? Number(body.identificationTypeId)
                    : undefined;

            const identificationNumber =
                hasIdentificationNumber &&
                    typeof body.identificationNumber === "string"
                    ? body.identificationNumber.trim()
                    : undefined;

            const name =
                hasName &&
                    typeof body.name === "string"
                    ? body.name.trim()
                    : "";

            const observation =
                hasObservation &&
                    typeof body.observation === "string"
                    ? body.observation.trim()
                    : "";

            if (
                hasIdentificationTypeId &&
                (
                    identificationTypeId === undefined ||
                    !Number.isInteger(identificationTypeId) ||
                    identificationTypeId <= 0
                )
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El tipo de identificación no es válido",
                });
            }

            if (
                hasIdentificationNumber &&
                !identificationNumber
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El número de identificación es obligatorio",
                });
            }

            if (
                identificationNumber &&
                identificationNumber.length > 50
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El número de identificación no puede superar los 50 caracteres",
                });
            }

            if (
                identificationNumber &&
                !containsOnlyNumbers(
                    identificationNumber
                )
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El número de identificación solo puede contener números",
                });
            }

            if (hasName && !name) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato es obligatorio",
                });
            }

            if (
                hasName &&
                name.length < 3
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato debe tener mínimo 3 caracteres",
                });
            }

            if (
                hasName &&
                name.length > 150
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato no puede superar los 150 caracteres",
                });
            }

            if (
                hasName &&
                !containsOnlyLetters(name)
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "El nombre del candidato solo puede contener letras",
                });
            }

            if (
                hasObservation &&
                observation.length > 500
            ) {
                await removeUploadedCandidateFile(req.file);

                return res.status(400).json({
                    message:
                        "La observación no puede superar los 500 caracteres",
                });
            }

            const updateData:
                UpdatePersonnelRequisitionCandidateData = {
                requisitionId,
                candidateId,
            };

            if (identificationTypeId !== undefined) {
                updateData.identificationTypeId =
                    identificationTypeId;
            }

            if (identificationNumber !== undefined) {
                updateData.identificationNumber =
                    identificationNumber;
            }

            if (hasName) {
                updateData.name = name;
            }

            if (hasObservation) {
                updateData.observation =
                    observation || null;
            }

            if (req.file) {
                updateData.originalName =
                    req.file.originalname;

                updateData.fileName =
                    req.file.filename;

                updateData.fileUrl =
                    `/uploads/human-talent/candidates/${req.file.filename}`;

                updateData.mimeType =
                    req.file.mimetype;

                updateData.fileSize =
                    req.file.size;
            }

            const result =
                await updatePersonnelRequisitionCandidateService(
                    updateData,
                    req.user
                );

            if (result.previousFileName) {
                await removeStoredCandidateFile(
                    result.previousFileName
                );
            }

            return res.status(200).json({
                message:
                    "Candidato actualizado correctamente",
                candidate: result.candidate,
            });
        } catch (error) {
            await removeUploadedCandidateFile(req.file);

            return res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Error al actualizar el candidato",
            });
        }
    };