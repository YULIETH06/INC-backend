import prisma from "../../../config/client.js";

import {
    getDepartmentWithChildrenIds,
    removeDuplicatedIds,
} from "../../../helpers/humanTalent/requisitions/departmentHierarchy.helper.js";

// Obtiene áreas/departamentos activos según el cargo del usuario.
export const getActiveDepartmentsService = async (
    userId: number,
    userRole: string
) => {
    if (userRole === "ADMIN") {
        return prisma.department.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                code: true,
                name: true,
                parentDepartmentId: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    const activeAssignments = await prisma.userPositionAssignment.findMany({
        where: {
            userId,
            isActive: true,
            endDate: null,
        },
        select: {
            positionId: true,
        },
    });

    const activePositionIds = activeAssignments.map((assignment) => {
        return assignment.positionId;
    });

    if (activePositionIds.length === 0) {
        return [];
    }

    const responsibleDepartments = await prisma.department.findMany({
        where: {
            isActive: true,
            responsiblePositionId: {
                in: activePositionIds,
            },
        },
        select: {
            id: true,
        },
    });

    const visibleDepartmentIds: number[] = [];

    for (const department of responsibleDepartments) {
        const departmentIds = await getDepartmentWithChildrenIds(department.id);
        visibleDepartmentIds.push(...departmentIds);
    }

    const uniqueDepartmentIds = removeDuplicatedIds(visibleDepartmentIds);

    if (uniqueDepartmentIds.length === 0) {
        return [];
    }

    const departments = await prisma.department.findMany({
        where: {
            id: {
                in: uniqueDepartmentIds,
            },
            isActive: true,
        },
        select: {
            id: true,
            code: true,
            name: true,
            parentDepartmentId: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    return departments;
};