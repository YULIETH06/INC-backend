import prisma from "../../config/client.js";

export const getActiveCitiesService = async () => {
    const cities = await prisma.city.findMany({
        where: {
            isActive: true,
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    return cities;
};