import prisma from "../../config/client.js";

import {
    getDepartmentWithChildrenIds,
    removeDuplicatedIds,
} from "../../helpers/humanTalent/requisitions/departmentHierarchy.helper.js";

// Obtiene cargos activos según el departamento seleccionado y permisos del usuario.
export const getActivePositionProfilesService = async (
    userId: number,
    userRole: string,
    departmentId?: number
) => {
    if (!departmentId) {
        return [];
    }

    // Obtiene el departamento seleccionado y sus áreas hijas.
    const selectedDepartmentIds = await getDepartmentWithChildrenIds(departmentId);

    if (userRole === "ADMIN") {
        return prisma.positionProfile.findMany({
            where: {
                isActive: true,
                homeDepartmentId: {
                    in: selectedDepartmentIds,
                },
            },
            select: {
                id: true,
                code: true,
                name: true,
                homeDepartmentId: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    // Consulta los cargos activos que tiene el usuario autenticado
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

    // Extrae solo los ids de los cargos activos del usuario
    const activePositionIds = activeAssignments.map((assignment) => {
        return assignment.positionId;
    });

    if (activePositionIds.length === 0) {
        return [];
    }

    // Busca los departamentos donde el cargo activo del usuario aparece como responsable.
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

    //  Aquí se guardan los departamentos y áreas que el usuario tiene permitido consultar.
    const allowedDepartmentIds: number[] = [];

    //  Por cada departamento donde el usuario es responsable, se agregan también sus áreas hijas.
    for (const department of responsibleDepartments) {
        const departmentIds = await getDepartmentWithChildrenIds(department.id);
        allowedDepartmentIds.push(...departmentIds);
    }

    /*
     * Elimina ids repetidos para evitar consultas duplicadas.
     */
    const uniqueAllowedDepartmentIds = removeDuplicatedIds(allowedDepartmentIds);

    /*
     * Valida si el departamento seleccionado pertenece
     * a los departamentos permitidos para el usuario.
     */
    const canAccessSelectedDepartment = selectedDepartmentIds.some((id) => {
        return uniqueAllowedDepartmentIds.includes(id);
    });

    /*
     * Si el usuario no tiene permiso sobre ese departamento,
     * no se devuelven cargos.
     */
    if (!canAccessSelectedDepartment) {
        return [];
    }

    /*
     * Cruza los departamentos seleccionados con los permitidos.
     *
     * Esto evita que el usuario consulte cargos
     * de áreas que no le corresponden.
     */
    const validDepartmentIds = selectedDepartmentIds.filter((id) => {
        return uniqueAllowedDepartmentIds.includes(id);
    });

    /*
     * Consulta los cargos activos que pertenecen
     * a los departamentos válidos.
     *
     * homeDepartmentId es el departamento o área
     * al que pertenece el cargo.
     */
    const positionProfiles = await prisma.positionProfile.findMany({
        where: {
            isActive: true,
            homeDepartmentId: {
                in: validDepartmentIds,
            },
        },
        select: {
            id: true,
            code: true,
            name: true,
            homeDepartmentId: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    return positionProfiles;
};