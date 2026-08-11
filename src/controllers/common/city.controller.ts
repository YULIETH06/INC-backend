import type { Request, Response } from "express";
import { getActiveCitiesService } from "../../services/common/city.service.js";

export const getActiveCities = async (req: Request, res: Response) => {
    try {
        const cities = await getActiveCitiesService();

        return res.status(200).json({
            message: "Ciudades obtenidas correctamente",
            cities,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener las ciudades",
            error,
        });
    }
};