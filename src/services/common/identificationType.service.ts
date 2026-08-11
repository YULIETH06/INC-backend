import prisma from "../../config/client.js";

export const getActiveIdentificationTypesService =
    async () => {
        const identificationTypes =
            await prisma.identificationType.findMany({
                where: {
                    isActive: true,
                },
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
                orderBy: {
                    name: "asc",
                },
            });

        return identificationTypes;
    };