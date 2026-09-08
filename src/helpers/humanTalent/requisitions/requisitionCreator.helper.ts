import { Role } from "@prisma/client";
import {
    ALLOWED_REQUISITION_CREATOR_POSITION_CODES,
} from "../../../constants/humanTalent/personnelRequisition.constants.js";

import type { PrismaExecutor } from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";


// Valida que el usuario tenga un cargo activo autorizado para crear requisiciones.
export const validatePersonnelRequisitionCreator = async (
    prismaExecutor: PrismaExecutor,
    userId: number
) => {
    // Validar si es administrador
    const user = await prismaExecutor.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
        },
    });

    if (user?.role === Role.ADMIN) {
        return null;
    }

    // Validar cargo autorizado
    const assignment = await prismaExecutor.userPositionAssignment.findFirst({
        where: {
            userId,
            isActive: true,
            endDate: null,
            position: {
                isActive: true,
                code: {
                    in: [
                        ...ALLOWED_REQUISITION_CREATOR_POSITION_CODES,
                    ],
                },
            },
        },
        select: {
            id: true,
            position: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
        },
        orderBy: {
            startDate: "desc",
        },
    });

    if (!assignment) {
        throw new Error(
            "No tienes un cargo autorizado para crear requisiciones de personal"
        );
    }

    return assignment;
};