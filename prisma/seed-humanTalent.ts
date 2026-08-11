import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/*
|--------------------------------------------------------------------------
| DEPARTAMENTOS Y ÁREAS
|--------------------------------------------------------------------------
|
| Se utilizan los códigos oficiales ORG-TH cuando están disponibles.
| Para las áreas que todavía no tienen código oficial se usan códigos
| internos temporales.
|
*/

const departments = [
    {
        code: "ORG-TH-0001",
        name: "Gerencia",
    },
    {
        code: "ORG-TH-0003",
        name: "Dirección de Operaciones",
    },
    {
        code: "ORG-TH-0012",
        name: "Producción",
    },
    {
        code: "ORG-TH-0008",
        name: "Aseguramiento de Calidad",
    },
    {
        code: "ORG-TH-0010",
        name: "Control de Calidad",
    },
    {
        code: "ORG-TH-0013",
        name: "Planeación y Distribución",
    },
    {
        code: "ORG-TH-0011",
        name: "Mantenimiento",
    },
    {
        code: "ORG-TH-0009",
        name: "Investigación & Desarrollo",
    },
    {
        code: "PLANEACION_CONTROL_PRODUCCION",
        name: "Planeación y Control de la Producción",
    },
    {
        code: "ORG-TH-0015",
        name: "Sistema de Gestión Integral SST-GA",
    },
    {
        code: "ORG-TH-0014",
        name: "Asuntos Regulatorios",
    },
    {
        code: "ORG-TH-0004",
        name: "Dirección Comercial",
    },
    {
        code: "NUEVOS_NEGOCIOS",
        name: "Nuevos Negocios",
    },
    {
        code: "VENTAS_FARMA_CONSUMO",
        name: "Ventas Farma y Consumo",
    },
    {
        code: "MERCADEO_PRODUCTO",
        name: "Mercadeo / Producto",
    },
    {
        code: "ORG-TH-0002",
        name: "Gerencia Financiera",
    },
    {
        code: "CONTABILIDAD",
        name: "Contabilidad",
    },
    {
        code: "ORG-TH-0006",
        name: "Suministros",
    },
    {
        code: "ORG-TH-0005",
        name: "Talento Humano",
    },
    {
        code: "ORG-TH-0007",
        name: "Tecnología e Inteligencia de Negocios",
    },
];

/*
|--------------------------------------------------------------------------
| REQUERIMIENTOS FIJOS DE LOS PERFILES DE CARGO
|--------------------------------------------------------------------------
|
| Estos requerimientos son utilizados por todos los perfiles de cargo.
| Las descripciones específicas se registrarán posteriormente por cada
| revisión del perfil.
|
*/

const positionRequirements = [
    {
        name: "Formación académica",
    },
    {
        name: "Experiencia",
    },
    {
        name: "Conocimientos específicos",
    },
];

/*
|--------------------------------------------------------------------------
| CARGOS APROBADORES
|--------------------------------------------------------------------------
|
| Esta variable permite identificar fácilmente los cargos aprobadores.
| Cada cargo tiene relacionado el departamento o área al cual pertenece.
|
*/
const approverPositionProfiles = [
    {
        code: "SUBGERENTE_GENERAL",
        name: "Subgerente General",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "DPC-TH-0002",
        name: "Director de Operaciones",
        homeDepartmentCode: "ORG-TH-0003",
    },
    {
        code: "DPC-TH-0008",
        name: "Jefe de Producción",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0005",
        name: "Jefe de Aseguramiento de Calidad",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0006",
        name: "Jefe de Control de Calidad",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0009",
        name: "Jefe de Planeación y Distribución",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0007",
        name: "Jefe de Mantenimiento",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0004",
        name: "Jefe de Investigación & Desarrollo",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0132",
        name: "Coordinador de Planeación y Control de la Producción",
        homeDepartmentCode: "PLANEACION_CONTROL_PRODUCCION",
    },
    {
        code: "DPC-TH-0028",
        name: "Coordinador de Sistemas de Gestión Integral SST-GA",
        homeDepartmentCode: "ORG-TH-0015",
    },
    {
        code: "DPC-TH-0076",
        name: "Coordinador de Asuntos Regulatorios",
        homeDepartmentCode: "ORG-TH-0014",
    },
    {
        code: "DPC-TH-0073",
        name: "Gerente Ejecutivo",
        homeDepartmentCode: "ORG-TH-0004",
    },
    {
        code: "DPC-TH-0012",
        name: "Jefe de Nuevos Negocios",
        homeDepartmentCode: "NUEVOS_NEGOCIOS",
    },
    {
        code: "DPC-TH-0060",
        name: "Jefe Nacional de Ventas Farma y Consumo",
        homeDepartmentCode: "VENTAS_FARMA_CONSUMO",
    },
    {
        code: "DPC-TH-0059",
        name: "Jefe de Producto",
        homeDepartmentCode: "MERCADEO_PRODUCTO",
    },
    {
        code: "GERENTE_FINANCIERO",
        name: "Gerente Financiero",
        homeDepartmentCode: "ORG-TH-0002",
    },
    {
        code: "JEFE_CONTABILIDAD",
        name: "Jefe de Contabilidad",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "DPC-TH-0033",
        name: "Jefe de Suministros",
        homeDepartmentCode: "ORG-TH-0006",
    },
    {
        code: "DPC-TH-0003",
        name: "Jefe de Talento Humano",
        homeDepartmentCode: "ORG-TH-0005",
    },
    {
        code: "DPC-TH-0169",
        name: "Jefe de Tecnología e Inteligencia de Negocio",
        homeDepartmentCode: "ORG-TH-0007",
    },
];

/*
|--------------------------------------------------------------------------
| TODOS LOS CARGOS
|--------------------------------------------------------------------------
|
| Esta es la variable utilizada por el seed para cargar todos los cargos
| Cada cargo tiene relacionado el departamento o área al cual pertenece.
|
*/
const positionProfiles = [

    ...approverPositionProfiles,

    // ORG-TH-0001
    {
        code: "DPC-TH-0030",
        name: "Coordinador de Gestión de Proyectos P.M.O.",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "DPC-TH-0069",
        name: "Control Interno",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "TEMP-GER-0001",
        name: "Coordinador de Seguridad Física",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "TEMP-GER-0002",
        name: "Asistente de Control Interno",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "TEMP-GER-0003",
        name: "Seguridad",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "TEMP-GER-0004",
        name: "Asistente de Gerencia",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "DPC-TH-0104",
        name: "Operario de Servicios Generales",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "DPC-TH-0068",
        name: "Auxiliar de Gerencia",
        homeDepartmentCode: "ORG-TH-0001",
    },
    {
        code: "TEMP-GER-0005",
        name: "Mensajero",
        homeDepartmentCode: "ORG-TH-0001",
    },
    // ORG-TH-0012
    {
        code: "DPC-TH-0139",
        name: "Secretaria de Dirección de Operaciones",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0159",
        name: "Analista de Documentación Técnica de Producción",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0163",
        name: "Estudiante en Práctica Químico Farmacéutico",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "TEMP-PROD-0001",
        name: "Coordinador de Producción de Sólidos y Semisólidos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0150",
        name: "Supervisor de Producción de Sólidos y Semisólidos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0084",
        name: "Auxiliar de Sólidos y Semisólidos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "TEMP-PROD-0002",
        name: "Operario de Sólidos y Semisólidos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0144",
        name: "Operario de Planta",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0152",
        name: "Inspector de Pesaje",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0153",
        name: "Auxiliar de Pesaje",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "TEMP-PROD-0003",
        name: "Coordinador de Producción Estériles, Cosméticos y Líquidos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0151",
        name: "Supervisor de Producción Estériles, Líquidos y Cosméticos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0156",
        name: "Auxiliar de Llenado Aséptico",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0085",
        name: "Auxiliar de Estériles, Líquidos y Cosméticos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0157",
        name: "Operario de Estériles, Líquidos y Cosméticos",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0027",
        name: "Supervisor de Acabado",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "TEMP-PROD-0004",
        name: "Líder de Acabado",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0062",
        name: "Operario Línea 1",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0063",
        name: "Operario de Línea 2",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0155",
        name: "Auxiliar de Producción",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "DPC-TH-0146",
        name: "Operario de Ropería",
        homeDepartmentCode: "ORG-TH-0012",
    },
    {
        code: "TEMP-PROD-0005",
        name: "Operario de Servicios Generales - Producción",
        homeDepartmentCode: "ORG-TH-0012",
    },
    // ORG-TH-0008
    {
        code: "DPC-TH-0070",
        name: "Secretaria de Aseguramiento de Calidad",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0019",
        name: "Coordinador de Disposición de Producto",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0053",
        name: "Analista de Disposición de Productos",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0054",
        name: "Analista de Liberación e Inspección",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0067",
        name: "Inspector de BPM",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0083",
        name: "Estudiante en Práctica Auxiliar de Disposición de Producto",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0020",
        name: "Coordinador de Cumplimiento",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0051",
        name: "Analista de Cumplimiento",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0055",
        name: "Analista de Proveedores",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0077",
        name: "Analista de Documentación",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0110",
        name: "Estudiante en Práctica Auxiliar de Documentación",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0021",
        name: "Coordinador de Validaciones",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0145",
        name: "Líder de Equipos y Sistemas de Apoyo Crítico",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0109",
        name: "Inspector de Equipos y Sistemas de Apoyo Crítico",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0140",
        name: "Analista de Metrología y Calificaciones",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0000",
        name: "Estudiante en Práctica de Equipos y Sistemas de Apoyo Crítico",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0107",
        name: "Analista de Validación de Procesos 1",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0074",
        name: "Analista de Validación de Procesos 2",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0111",
        name: "Estudiante en Práctica en Validación de Procesos",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0112",
        name: "Analista de Validaciones de Sistemas Computarizados",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0001",
        name: "Estudiante en Práctica de Sistemas Computarizados",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0022",
        name: "Coordinador de Validaciones Microbiológicas",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0108",
        name: "Analista de Validaciones Microbiológicas",
        homeDepartmentCode: "ORG-TH-0008",
    },
    {
        code: "DPC-TH-0148",
        name: "Estudiante en Prácticas de Microbiología",
        homeDepartmentCode: "ORG-TH-0008",
    },
    // ORG-TH-0010
    {
        code: "DPC-TH-0161",
        name: "Secretaria de Control de Calidad",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0015",
        name: "Coordinador de Estabilidad",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0096",
        name: "Analista de Estabilidad",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0124",
        name: "Analista de Estabilidad Junior",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0087",
        name: "Técnico de Estabilidad",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0105",
        name: "Inspector de Control en Proceso",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0016",
        name: "Coordinador de Control de Calidad de Productos",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-H-0098",
        name: "Analista de Producto Senior",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0102",
        name: "Analista de Documentación Técnica 1",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0100",
        name: "Técnico de Control Fisicoquímico",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0095",
        name: "Auxiliar de Laboratorio",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0162",
        name: "Auxiliar de Laboratorio 2",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0017",
        name: "Coordinador de Control de Calidad de Materiales",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0097",
        name: "Analista de Reactivos",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0164",
        name: "Analista de Documentación Técnica 2",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0103",
        name: "Analista de Materiales Senior",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0086",
        name: "Analista de Materiales Junior",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0106",
        name: "Técnico de Muestreo e Inspección",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0121",
        name: "Técnico de Control de Materiales",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0045",
        name: "Analista de Documentación Técnica",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0101",
        name: "Estudiante en Práctica de Documentación Técnica",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0018",
        name: "Coordinador de Control de Calidad Microbiológico",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0099",
        name: "Analista de Microbiología",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0036",
        name: "Técnico de Microbiología",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0093",
        name: "Auxiliar de Control de Microbiología",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0149",
        name: "Estudiante en Prácticas de Microbiología",
        homeDepartmentCode: "ORG-TH-0010",
    },
    {
        code: "DPC-TH-0057",
        name: "Analista de Gestión del Riesgo de Control de Calidad",
        homeDepartmentCode: "ORG-TH-0010",
    },
    // ORG-TH-0013
    {
        code: "DPC-TH-0131",
        name: "Supervisor de Almacén de Materiales",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0135",
        name: "Auxiliar de Materia Prima y Material de Envase",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0136",
        name: "Auxiliar de Material de Empaque",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0137",
        name: "Aprendiz de Almacén de Materiales",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0138",
        name: "Estudiante en Práctica de Planeación",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0123",
        name: "Líder de Despacho",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0160",
        name: "Operario de Línea Institucional",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0044",
        name: "Auxiliar de Transacciones de Inventario",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0134",
        name: "Auxiliar de Despacho",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0133",
        name: "Auxiliar de Alistamiento",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0166",
        name: "Analista de Planeación de Materiales Senior",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0147",
        name: "Supervisor de Despacho y Producto Terminado",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0113",
        name: "Analista de Planeación de Materiales Junior",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0072",
        name: "Auxiliar Logístico",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0167",
        name: "Auxiliar de Planeación y Distribución",
        homeDepartmentCode: "ORG-TH-0013",
    },
    {
        code: "DPC-TH-0091",
        name: "Aprendiz de Planeación y Distribución",
        homeDepartmentCode: "ORG-TH-0013",
    },
    // ORG-TH-0011
    {
        code: "DPC-TH-0090",
        name: "Secretaria de Mantenimiento",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0023",
        name: "Coordinador de Mantenimiento de Planta Interna",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0041",
        name: "Técnico Electromecánico",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0127",
        name: "Estudiante en Prácticas de Mantenimiento",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0130",
        name: "Técnico de Mantenimiento en Instalaciones",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0092",
        name: "Analista de Mantenimiento",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0024",
        name: "Coordinador de Pisos Técnicos y Áreas Externas de Planta",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0165",
        name: "Técnico de Refrigeración",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0126",
        name: "Auxiliar de Refrigeración",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0125",
        name: "Técnico Electricista",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0129",
        name: "Estudiante en Práctica de Ingeniería",
        homeDepartmentCode: "ORG-TH-0011",
    },
    {
        code: "DPC-TH-0128",
        name: "Auxiliar de Logística",
        homeDepartmentCode: "ORG-TH-0011",
    },
    // ORG-TH-0009
    {
        code: "DPC-TH-0114",
        name: "Secretaria de Investigación & Desarrollo",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0031",
        name: "Formulador Técnico",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0120",
        name: "Estudiante en Práctica de Química y Farmacia",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0119",
        name: "Analista de Documentación Técnica I&D",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0014",
        name: "Coordinador de Desarrollo y Validación de Técnicas Analíticas",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0115",
        name: "Analista de Desarrollo de Técnicas Analíticas",
        homeDepartmentCode: "ORG-TH-0009",
    },
    {
        code: "DPC-TH-0116",
        name: "Analista de Validación de Técnicas Analíticas",
        homeDepartmentCode: "ORG-TH-0009",
    },
    // ORG-TH-0014
    {
        code: "DPC-TH-0082",
        name: "Analista de Asuntos Regulatorios",
        homeDepartmentCode: "ORG-TH-0014",
    },
    {
        code: "DPC-TH-0049",
        name: "Analista de Asuntos Regulatorios de Nuevos Negocios",
        homeDepartmentCode: "ORG-TH-0014",
    },
    {
        code: "DPC-TH-0081",
        name: "Analista Junior de Asuntos Regulatorios",
        homeDepartmentCode: "ORG-TH-0014",
    },
    // NUEVOS_NEGOCIOS
    {
        code: "DPC-TH-0035",
        name: "Asistente de Proyectos",
        homeDepartmentCode: "NUEVOS_NEGOCIOS",
    },
    // VENTAS_FARMA_CONSUMO
    {
        code: "DPC-TH-0013",
        name: "Jefe de Distrito",
        homeDepartmentCode: "VENTAS_FARMA_CONSUMO",
    },
    {
        code: "DPC-TH-0048",
        name: "Ejecutivo de Cuenta",
        homeDepartmentCode: "VENTAS_FARMA_CONSUMO",
    },
    {
        code: "DPC-TH-0046",
        name: "Visitador Médico",
        homeDepartmentCode: "VENTAS_FARMA_CONSUMO",
    },
    {
        code: "DPC-TH-0079",
        name: "Transferencista",
        homeDepartmentCode: "VENTAS_FARMA_CONSUMO",
    },
    // MERCADEO_PRODUCTO
    {
        code: "DPC-TH-0064",
        name: "Asistente de Mercadeo",
        homeDepartmentCode: "MERCADEO_PRODUCTO",
    },
    {
        code: "DPC-TH-0040",
        name: "Diseñador Gráfico Senior",
        homeDepartmentCode: "MERCADEO_PRODUCTO",
    },
    {
        code: "DPC-TH-0050",
        name: "Diseñador Gráfico Junior",
        homeDepartmentCode: "MERCADEO_PRODUCTO",
    },
    {
        code: "DPC-TH-0075",
        name: "Auxiliar de Mercadeo",
        homeDepartmentCode: "MERCADEO_PRODUCTO",
    },
    // CONTABILIDAD
    {
        code: "TEMP-CONT-0001",
        name: "Coordinador de Nómina",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0002",
        name: "Asistente de Nómina",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0003",
        name: "Auxiliar Contable",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0004",
        name: "Analista Contable de Costos e Inventarios",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0005",
        name: "Analista Contable",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0006",
        name: "Analista de Tesorería",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0007",
        name: "Aprendiz Administrativo de Contabilidad",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0008",
        name: "Coordinador de Cartera y Facturación",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0009",
        name: "Asistente de Cartera y Facturación",
        homeDepartmentCode: "CONTABILIDAD",
    },
    {
        code: "TEMP-CONT-0010",
        name: "Auxiliar de Facturación",
        homeDepartmentCode: "CONTABILIDAD",
    },
    // ORG-TH-0006
    {
        code: "DPC-TH-0038",
        name: "Analista de Suministros 1",
        homeDepartmentCode: "ORG-TH-0006",
    },
    {
        code: "DPC-TH-0039",
        name: "Analista de Suministros 2",
        homeDepartmentCode: "ORG-TH-0006",
    },
    {
        code: "DPC-TH-0034",
        name: "Auxiliar de Comercio Exterior y Servicios",
        homeDepartmentCode: "ORG-TH-0006",
    },
    {
        code: "DPC-TH-0037",
        name: "Auxiliar de Suministros",
        homeDepartmentCode: "ORG-TH-0006",
    },
    {
        code: "DPC-TH-0143",
        name: "Aprendiz Auxiliar Administrativo de Suministros",
        homeDepartmentCode: "ORG-TH-0006",
    },
    // ORG-TH-0005
    {
        code: "DPC-TH-0058",
        name: "Analista de Capacitación y Entrenamiento",
        homeDepartmentCode: "ORG-TH-0005",
    },
    {
        code: "DPC-TH-0042",
        name: "Auxiliar de Documentación de Talento Humano",
        homeDepartmentCode: "ORG-TH-0005",
    },
    {
        code: "DPC-TH-0118",
        name: "Analista de Talento Humano",
        homeDepartmentCode: "ORG-TH-0005",
    },
    {
        code: "DPC-TH-0080",
        name: "Auxiliar de Talento Humano",
        homeDepartmentCode: "ORG-TH-0005",
    },
    {
        code: "DPC-TH-0117",
        name: "Aprendiz de Talento Humano",
        homeDepartmentCode: "ORG-TH-0005",
    },
    // ORG-TH-0007
    {
        code: "DPC-TH-0122",
        name: "Coordinador de Eficiencia y Productividad",
        homeDepartmentCode: "ORG-TH-0007",
    },
    {
        code: "DPC-TH-0078",
        name: "Analista de Inteligencia de Negocios",
        homeDepartmentCode: "ORG-TH-0007",
    },
    {
        code: "DPC-TH-0170",
        name: "Analista de Eficiencia Operativa",
        homeDepartmentCode: "ORG-TH-0007",
    },
    {
        code: "DPC-TH-0142",
        name: "Líder de Soporte Técnico",
        homeDepartmentCode: "ORG-TH-0007",
    },
    {
        code: "DPC-TH-0089",
        name: "Auxiliar de Tecnología e Información",
        homeDepartmentCode: "ORG-TH-0007",
    },
    {
        code: "DPC-TH-0065",
        name: "Aprendiz de Tecnología",
        homeDepartmentCode: "ORG-TH-0007",
    },
];

/*
|--------------------------------------------------------------------------
| ESTRUCTURA JERÁRQUICA
|--------------------------------------------------------------------------
|
| responsiblePositionCode:
| Cargo que aprueba directamente las solicitudes del departamento.
|
| parentDepartmentCode:
| Departamento superior al cual debe subir posteriormente la solicitud.
|
*/

const departmentStructure = [
    {
        departmentCode: "ORG-TH-0001",
        parentDepartmentCode: null,
        responsiblePositionCode: "SUBGERENTE_GENERAL",
    },
    {
        departmentCode: "ORG-TH-0003",
        parentDepartmentCode: "ORG-TH-0001",
        responsiblePositionCode: "DPC-TH-0002",
    },
    {
        departmentCode: "ORG-TH-0012",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0008",
    },
    {
        departmentCode: "ORG-TH-0008",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0005",
    },
    {
        departmentCode: "ORG-TH-0010",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0006",
    },
    {
        departmentCode: "ORG-TH-0013",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0009",
    },
    {
        departmentCode: "ORG-TH-0011",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0007",
    },
    {
        departmentCode: "ORG-TH-0009",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0004",
    },
    {
        departmentCode: "PLANEACION_CONTROL_PRODUCCION",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0132",
    },
    {
        departmentCode: "ORG-TH-0015",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0028",
    },
    {
        departmentCode: "ORG-TH-0014",
        parentDepartmentCode: "ORG-TH-0003",
        responsiblePositionCode: "DPC-TH-0076",
    },
    {
        departmentCode: "ORG-TH-0004",
        parentDepartmentCode: "ORG-TH-0001",
        responsiblePositionCode: "DPC-TH-0073",
    },
    {
        departmentCode: "NUEVOS_NEGOCIOS",
        parentDepartmentCode: "ORG-TH-0004",
        responsiblePositionCode: "DPC-TH-0012",
    },
    {
        departmentCode: "VENTAS_FARMA_CONSUMO",
        parentDepartmentCode: "ORG-TH-0004",
        responsiblePositionCode: "DPC-TH-0060",
    },
    {
        departmentCode: "MERCADEO_PRODUCTO",
        parentDepartmentCode: "ORG-TH-0004",
        responsiblePositionCode: "DPC-TH-0059",
    },
    {
        departmentCode: "ORG-TH-0002",
        parentDepartmentCode: "ORG-TH-0001",
        responsiblePositionCode: "GERENTE_FINANCIERO",
    },
    {
        departmentCode: "CONTABILIDAD",
        parentDepartmentCode: "ORG-TH-0002",
        responsiblePositionCode: "JEFE_CONTABILIDAD",
    },
    {
        departmentCode: "ORG-TH-0006",
        parentDepartmentCode: "ORG-TH-0001",
        responsiblePositionCode: "DPC-TH-0033",
    },
    {
        departmentCode: "ORG-TH-0005",
        parentDepartmentCode: "ORG-TH-0001",
        responsiblePositionCode: "DPC-TH-0003",
    },
    {
        departmentCode: "ORG-TH-0007",
        parentDepartmentCode: "ORG-TH-0001",
        responsiblePositionCode: "DPC-TH-0169",
    },
];

const main = async () => {
    /*
    |--------------------------------------------------------------------------
    | CREAR O ACTUALIZAR DEPARTAMENTOS
    |--------------------------------------------------------------------------
    */

    for (const department of departments) {
        await prisma.department.upsert({
            where: {
                code: department.code,
            },
            update: {
                name: department.name,
                isActive: true,
            },
            create: {
                code: department.code,
                name: department.name,
                isActive: true,
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CREAR O ACTUALIZAR REQUERIMIENTOS FIJOS
    |--------------------------------------------------------------------------
    */

    for (const requirement of positionRequirements) {
        await prisma.positionRequirement.upsert({
            where: {
                name: requirement.name,
            },
            update: {},
            create: {
                name: requirement.name,
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CREAR O ACTUALIZAR CARGOS
    |--------------------------------------------------------------------------
    */

    for (const position of positionProfiles) {
        const homeDepartment = await prisma.department.findUnique({
            where: {
                code: position.homeDepartmentCode,
            },
        });

        if (!homeDepartment) {
            throw new Error(
                `No se encontró el departamento base ${position.homeDepartmentCode} para el cargo ${position.code}`,
            );
        }

        await prisma.positionProfile.upsert({
            where: {
                code: position.code,
            },
            update: {
                name: position.name,
                homeDepartmentId: homeDepartment.id,
                isActive: true,
            },
            create: {
                code: position.code,
                name: position.name,
                homeDepartmentId: homeDepartment.id,
                isActive: true,
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIGURAR JERARQUÍA Y APROBADORES
    |--------------------------------------------------------------------------
    */

    for (const item of departmentStructure) {
        const department = await prisma.department.findUnique({
            where: {
                code: item.departmentCode,
            },
        });

        if (!department) {
            throw new Error(
                `No se encontró el departamento ${item.departmentCode}`,
            );
        }

        const parentDepartment = item.parentDepartmentCode
            ? await prisma.department.findUnique({
                where: {
                    code: item.parentDepartmentCode,
                },
            })
            : null;

        if (item.parentDepartmentCode && !parentDepartment) {
            throw new Error(
                `No se encontró el departamento padre ${item.parentDepartmentCode}`,
            );
        }

        const responsiblePosition =
            await prisma.positionProfile.findUnique({
                where: {
                    code: item.responsiblePositionCode,
                },
            });

        if (!responsiblePosition) {
            throw new Error(
                `No se encontró el cargo responsable ${item.responsiblePositionCode}`,
            );
        }

        await prisma.department.update({
            where: {
                id: department.id,
            },
            data: {
                parentDepartmentId: parentDepartment?.id ?? null,
                responsiblePositionId: responsiblePosition.id,
            },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIGURAR FLUJO DE TALENTO HUMANO
    |--------------------------------------------------------------------------
    */

    const auxiliaryHumanTalentPosition =
        await prisma.positionProfile.findUnique({
            where: {
                code: "DPC-TH-0080",
            },
        });

    const chiefHumanTalentPosition =
        await prisma.positionProfile.findUnique({
            where: {
                code: "DPC-TH-0003",
            },
        });

    if (!auxiliaryHumanTalentPosition) {
        throw new Error(
            "No se encontró el cargo Auxiliar de Talento Humano DPC-TH-0080.",
        );
    }

    if (!chiefHumanTalentPosition) {
        throw new Error(
            "No se encontró el cargo Jefe de Talento Humano DPC-TH-0003.",
        );
    }

    await prisma.humanTalentWorkflowConfig.upsert({
        where: {
            id: 1,
        },
        update: {
            name: "Flujo principal de Talento Humano",
            analystPositionId: auxiliaryHumanTalentPosition.id,
            chiefPositionId: chiefHumanTalentPosition.id,
            isActive: true,
        },
        create: {
            id: 1,
            name: "Flujo principal de Talento Humano",
            analystPositionId: auxiliaryHumanTalentPosition.id,
            chiefPositionId: chiefHumanTalentPosition.id,
            isActive: true,
        },
    });

    console.log(
        "Seed de estructura organizacional ejecutado correctamente.",
    );
};

main()
    .catch((error) => {
        console.error(
            "Error ejecutando el seed de estructura organizacional:",
            error,
        );

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });