import {
    ALLOWED_REQUISITION_CREATOR_POSITION_CODES,
} from "../../../constants/humanTalent/personnelRequisition.constants.js";

import type { PrismaExecutor } from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";


// Valida que el usuario tenga un cargo activo autorizado para crear requisiciones.
// Solo los cargos autorizados pueden crear requisiciones; el rol ADMIN no es suficiente.
// Devuelve la asignación, porque su cargo queda como cargo responsable de la requisición.
export const validatePersonnelRequisitionCreator = async (
    prismaExecutor: PrismaExecutor,
    userId: number
) => {
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