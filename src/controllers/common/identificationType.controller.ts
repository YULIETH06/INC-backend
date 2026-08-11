import type { Request, Response } from "express";

import {
    getActiveIdentificationTypesService
} from "../../services/common/identificationType.service.js";

export const getActiveIdentificationTypes =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const identificationTypes =
                await getActiveIdentificationTypesService();

            return res.status(200).json({
                message:
                    "Tipos de identificación obtenidos correctamente",
                identificationTypes,
            });
        } catch (error) {
            return res.status(500).json({
                message:
                    "Error al obtener los tipos de identificación",
                error,
            });
        }
    };