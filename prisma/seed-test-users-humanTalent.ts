import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// Contraseña encriptada por defecto para los usuarios de prueba.
const defaultPasswordHash =
    "$2a$12$Pcuc4uRUqBmV4EPN1JMkMem.J6.QVtDYGoKJApbVtp7LKdQHvFqki";

// Usuarios de prueba con su cargo activo.
const testUsers = [
    {
        name: "Subgerente General",
        email: "subgerente.general@incobra.com",
        role: Role.USER,
        positionCode: "SUBGERENTE_GENERAL",
    },

    {
        name: "Director de Operaciones",
        email: "director.operaciones@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0002",
    },
    {
        name: "Jefe de Producción",
        email: "jefe.produccion@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0008",
    },
    {
        name: "Jefe de Aseguramiento de Calidad",
        email: "jefe.aseguramiento@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0005",
    },
    {
        name: "Jefe de Control de Calidad",
        email: "jefe.controlcalidad@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0006",
    },
    {
        name: "Jefe de Planeación y Distribución",
        email: "jefe.planeacion@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0009",
    },
    {
        name: "Jefe de Mantenimiento",
        email: "jefe.mantenimiento@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0007",
    },
    {
        name: "Jefe de Investigación y Desarrollo",
        email: "jefe.investigacion@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0004",
    },
    {
        name: "Coordinador Planeación Producción",
        email: "coordinador.planeacionproduccion@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0132",
    },
    {
        name: "Coordinador SST-GA",
        email: "coordinador.sstga@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0028",
    },
    {
        name: "Coordinador  de Asuntos Regulatorios",
        email: "Coordinador.asuntosR@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0076"
    },

    {
        name: "Gerente Ejecutivo",
        email: "gerente.ejecutivo@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0073",
    },
    {
        name: "Jefe de Nuevos Negocios",
        email: "jefe.nuevosnegocios@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0012",
    },
    {
        name: "Jefe Nacional Ventas Farma",
        email: "jefe.ventasfarma@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0060",
    },
    {
        name: "Jefe de Producto",
        email: "jefe.producto@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0059",
    },

    {
        name: "Gerente Financiero",
        email: "gerente.financiero@incobra.com",
        role: Role.USER,
        positionCode: "GERENTE_FINANCIERO",
    },
    {
        name: "Jefe de Contabilidad",
        email: "jefe.contabilidad@incobra.com",
        role: Role.USER,
        positionCode: "JEFE_CONTABILIDAD",
    },

    {
        name: "Jefe de Suministros",
        email: "jefe.suministros@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0033",
    },

    {
        name: "Jefe de Talento Humano",
        email: "jefe.talentohumano@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0003",
    },

    {
        name: "Jefe de Tecnología",
        email: "jefe.tecnologia@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0169",
    },

    {
        name: "Auxiliar de Talento Humano",
        email: "auxiliar.talentohumano@incobra.com",
        role: Role.USER,
        positionCode: "DPC-TH-0080",
    },
];

// Ejecuta la creación de usuarios de prueba y sus asignaciones de cargo.
const main = async () => {
    for (const testUser of testUsers) {
        const position = await prisma.positionProfile.findUnique({
            where: {
                code: testUser.positionCode,
            },
        });

        if (!position) {
            throw new Error(
                `No se encontró el cargo con código ${testUser.positionCode}. Primero ejecuta el seed de estructura organizacional.`
            );
        }

        const user = await prisma.user.upsert({
            where: {
                email: testUser.email,
            },
            update: {
                name: testUser.name,
                password: defaultPasswordHash,
                role: testUser.role,
            },
            create: {
                name: testUser.name,
                email: testUser.email,
                password: defaultPasswordHash,
                role: testUser.role,
            },
        });

        const activeAssignment = await prisma.userPositionAssignment.findFirst({
            where: {
                userId: user.id,
                positionId: position.id,
                isActive: true,
            },
        });

        if (activeAssignment) {
            await prisma.userPositionAssignment.update({
                where: {
                    id: activeAssignment.id,
                },
                data: {
                    endDate: null,
                    isActive: true,
                },
            });
        } else {
            await prisma.userPositionAssignment.create({
                data: {
                    userId: user.id,
                    positionId: position.id,
                    isActive: true,
                },
            });
        }
    }

    console.log("Seed de usuarios de prueba ejecutado correctamente.");
};

main()
    .catch((error) => {
        console.error("Error ejecutando el seed de usuarios de prueba:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });