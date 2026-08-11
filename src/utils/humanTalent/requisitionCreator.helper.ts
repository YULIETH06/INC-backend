import { Role } from "@prisma/client";
import type { PrismaExecutor } from "../../interfaces/humanTalent/personnelRequisition.interface.js";

// Cargos autorizados para crear requisiciones de personal.
const allowedRequisitionCreatorPositionCodes = [
    "SUBGERENTE_GENERAL", // Subgerente General

    "DPC-TH-0002", // Director de Operaciones
    "DPC-TH-0008", // Jefe de Producción
    "DPC-TH-0005", // Jefe de Aseguramiento de Calidad
    "DPC-TH-0006", // Jefe de Control de Calidad
    "DPC-TH-0009", // Jefe de Planeación y Distribución
    "DPC-TH-0007", // Jefe de Mantenimiento
    "DPC-TH-0004", // Jefe de Investigación & Desarrollo
    "DPC-TH-0132", // Coordinador de Planeación y Control de la Producción
    "DPC-TH-0028", // Coordinador de Sistemas de Gestión Integral SST-GA
    "DPC-TH-0076", // Coordinador de Asuntos Regulatorios

    "DPC-TH-0073", // Gerente Ejecutivo
    "DPC-TH-0012", // Jefe de Nuevos Negocios
    "DPC-TH-0060", // Jefe Nacional de Ventas Farma y Consumo
    "DPC-TH-0059", // Jefe de Producto

    "GERENTE_FINANCIERO", // Gerente Financiero
    "JEFE_CONTABILIDAD", // Jefe de Contabilidad

    "DPC-TH-0033", // Jefe de Suministros
    "DPC-TH-0003", // Jefe de Talento Humano
    "DPC-TH-0169", // Jefe de Tecnología e Inteligencia de Negocio
];

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
                    in: allowedRequisitionCreatorPositionCodes,
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