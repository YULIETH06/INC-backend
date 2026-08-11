import type { Response } from "express";

import { getActivePositionProfilesService } from "../../services/positionManagement/positionProfile.service.js";
import type { AuthRequest } from "../../interfaces/auth/auth.interface.js";


export const getActivePositionProfiles = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const departmentId = req.query.departmentId
            ? Number(req.query.departmentId)
            : undefined;

        if (req.query.departmentId && Number.isNaN(departmentId)) {
            return res.status(400).json({
                message: "El id del departamento no es válido",
            });
        }

        const positionProfiles = await getActivePositionProfilesService(
            req.user.id,
            req.user.role,
            departmentId
        );

        return res.status(200).json({
            message: "Perfiles de cargo obtenidos correctamente",
            positionProfiles,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los perfiles de cargo",
            error,
        });
    }
};