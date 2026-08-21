import type { Response } from "express";

// import { getActiveDepartmentsService } from "../../../services/humanTalent/department.service.js";
import type { AuthRequest } from "../../../interfaces/auth/auth.interface.js";
import { getActiveDepartmentsService } from "../../../services/humanTalent/requisitions/department.service.js";


export const getActiveDepartments = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado",
            });
        }

        const departments = await getActiveDepartmentsService(
            req.user.id,
            req.user.role
        );

        return res.status(200).json({
            message: "Áreas obtenidas correctamente",
            departments,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener las áreas",
            error,
        });
    }
};