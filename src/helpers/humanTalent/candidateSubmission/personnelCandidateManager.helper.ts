import type { PrismaExecutor } from "../../../interfaces/humanTalent/requisitions/personnelRequisition.interface.js";

const HUMAN_TALENT_ASSISTANT_POSITION_CODE = "DPC-TH-0080";

// Valida que el usuario tenga activo el cargo de Auxiliar de Talento Humano.
export const validatePersonnelCandidateManager = async (
    prismaExecutor: PrismaExecutor,
    userId: number
) => {
    const assignment =
        await prismaExecutor.userPositionAssignment.findFirst({
            where: {
                userId,
                isActive: true,
                endDate: null,
                position: {
                    isActive: true,
                    code: HUMAN_TALENT_ASSISTANT_POSITION_CODE,
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
            "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
        );
    }

    return assignment;
};