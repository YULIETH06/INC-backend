import prisma from "../../../config/client.js";

// Obtiene los ids de un departamento y todos sus hijos.
export const getDepartmentWithChildrenIds = async (
    departmentId: number
): Promise<number[]> => {
    const departmentIds: number[] = [departmentId];

    const children = await prisma.department.findMany({
        where: {
            parentDepartmentId: departmentId,
            isActive: true,
        },
        select: {
            id: true,
        },
    });

    for (const child of children) {
        const childIds = await getDepartmentWithChildrenIds(child.id);
        departmentIds.push(...childIds);
    }

    return departmentIds;
};

// Elimina ids repetidos.
export const removeDuplicatedIds = (ids: number[]) => {
    return [...new Set(ids)];
};