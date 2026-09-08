# Documentación Técnica

## Descripción

Este documento describe la arquitectura general del backend, su organización interna, la distribución de carpetas y archivos, y la forma en que se estructuran los distintos módulos del sistema.

---

# Estructura general del backend

```txt
backend-inc/
│
├── docs/
├── node_modules/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

# Descripción de la estructura

| Archivo / Carpeta    | Descripción                                                |
| -------------------- | ---------------------------------------------------------- |
| docs                 | Documentación técnica del proyecto                         |
| node_modules         | Dependencias instaladas del proyecto                       |
| prisma               | Configuración de Prisma y migraciones                      |
| prisma/migrations    | Historial de migraciones de base de datos                  |
| prisma/schema.prisma | Definición de modelos, enums, relaciones y conexión Prisma |
| src                  | Código fuente principal del backend                        |
| .env                 | Variables de entorno                                       |
| .gitignore           | Archivos ignorados por Git                                 |
| package.json         | Dependencias y scripts del proyecto                        |
| package-lock.json    | Control de versiones exactas de dependencias               |
| prisma.config.ts     | Configuración personalizada de Prisma                      |
| tsconfig.json        | Configuración de TypeScript                                |

---

# Estructura interna de src

Se organizó la estructura principal del backend dentro de la carpeta `src` para separar responsabilidades y mantener una arquitectura escalable.

### Estructura

```txt
src/
│
├── server.ts
├── app.ts
│
├── config/
│   ├── client.ts
│   └── socket.ts
│
├── constants/
│   └── humanTalent/
│       └── personnelRequisition.constants.ts
│
├── controllers/
│   │
│   ├── auth/
│   │   └── auth.controller.ts
│   │
│   ├── common/
│   │   ├── city.controller.ts
│   │   └── identificationType.controller.ts
│   │
│   ├── humanTalent/
│   │   ├── candidateSubmission/
│   │   │   └── personnelRequisitionCandidate.controller.ts
│   │   ├── candidateValidation/
│   │   │   └── personnelCandidateValidation.controller.ts
│   │   └── requisitions/
│   │       ├── department.controller.ts
│   │       ├── personnelHiringConfirmation.controller.ts
│   │       └── personnelRequisition.controller.ts
│   │
│   ├── notifications/
│   │   └── notification.controller.ts
│   │
│   ├── positionManagement/
│   │   ├── positionProfile.controller.ts
│   │   └── positionProfileRevision.controller.ts
│   │
│   ├── pqrs/
│   │   ├── pqr.controller.ts
│   │   └── pqrMessage.controller.ts
│   │
│   └── users/
│       ├── profile.controller.ts
│       ├── user.controller.ts
│       └── userBulk.controller.ts
│
├── interfaces/
│   │
│   ├── auth/
│   │   └── auth.interface.ts
│   │
│   ├── humanTalent/
│   │   ├── candidateSubmission/
│   │   │   └── personnelRequisitionCandidate.interface.ts
│   │   ├── candidateValidation/
│   │   │   └── personnelCandidateValidation.interface.ts
│   │   └── requisitions/
│   │       ├── personnelHiringConfirmation.interface.ts
│   │       └── personnelRequisition.interface.ts
│   │
│   ├── notifications/
│   │   └── notification.interface.ts
│   │
│   ├── positionManagement/
│   │   └── positionProfileRevision.interface.ts
│   │
│   ├── pqrs/
│   │   ├── pqr.interface.ts
│   │   └── pqrMessage.interface.ts
│   │
│   ├── users/
│   │   └── userBulk.interface.ts
│   │
│   └── sockets/
│       └── socket.interface.ts
│
├── middlewares/
│   ├── auth/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── socketAuth.middleware.ts
│   │
│   ├── errors/
│   │
│   ├── uploads/
│   │   ├── humanTalent/
│   │   │   └── uploadPersonnelCandidate.middleware.ts
│   │   ├── pqrs/
│   │   │   └── pqrAttachmentUpload.middleware.ts
│   │   └── users/
│   │       └── userSignatureUpload.middleware.ts
│   │
│   ├── validation/
│   │
│   └── index.ts
│
├── routes/
│   ├── auth/
│   │   └── auth.routes.ts
│   │
│   ├── common/
│   │   ├── city.routes.ts
│   │   └── identificationType.routes.ts
│   │
│   ├── humanTalent/
│   │   ├── candidateSubmission/
│   │   │   └── personnelRequisitionCandidate.routes.ts
│   │   ├── candidateValidation/
│   │   │   └── personnelCandidateValidation.routes.ts
│   │   └── requisitions/
│   │       ├── department.routes.ts
│   │       ├── personnelHiringConfirmation.routes.ts
│   │       └── personnelRequisition.routes.ts
│   │
│   ├── notifications/
│   │   └── notification.routes.ts
│   │
│   ├── positionManagement/
│   │   ├── positionProfile.routes.ts
│   │   └── positionProfileRevision.routes.ts
│   │
│   ├── pqrs/
│   │   ├── pqr.routes.ts
│   │   └── pqrMessage.routes.ts
│   │
│   ├── users/
│   │   ├── profile.routes.ts
│   │   └── user.routes.ts
│   │
│   └── index.ts
│
├── services/
│   │
│   ├── auth/
│   │   └── auth.service.ts
│   │
│   ├── common/
│   │   ├── city.service.ts
│   │   └── identificationType.service.ts
│   │
│   ├── humanTalent/
│   │   ├── candidateSubmission/
│   │   │   └── personnelRequisitionCandidate.service.ts
│   │   ├── candidateValidation/
│   │   │   └── personnelCandidateValidation.service.ts
│   │   └── requisitions/
│   │       ├── department.service.ts
│   │       ├── personnelHiringConfirmation.service.ts
│   │       └── personnelRequisition.service.ts
│   │
│   ├── notifications/
│   │   ├── humanTalent/
│   │   │   └── humanTalentNotification.service.ts
│   │   ├── pqrs/
│   │   │   └── pqrNotification.service.ts
│   │   └── notification.service.ts
│   │
│   ├── positionManagement/
│   │   ├── positionProfile.service.ts
│   │   └── positionProfileRevision.service.ts
│   │
│   ├── pqrs/
│   │   ├── pqr.service.ts
│   │   ├── pqrAttachment.service.ts
│   │   └── pqrMessage.service.ts
│   │
│   └── users/
│       ├── user.service.ts
│       └── userBulk.service.ts
│
├── sockets/
│   ├── notifications/
│   │   └── notification.socket.ts
│   ├── pqrs/
│   │   └── pqr.socket.ts
│   └── index.socket.ts
│
├── helpers/
│   └── humanTalent/
│       ├── candidateSubmission/
│       │   └── personnelCandidateManager.helper.ts
│       ├── candidateValidation/
│       │   └── personnelCandidateValidationAccess.helper.ts
│       └── requisitions/
│           ├── departmentHierarchy.helper.ts
│           ├── hiringConfirmationApprovalFlow.helper.ts
│           ├── requisitionApprovalFlow.helper.ts
│           └── requisitionCreator.helper.ts
│
└── utils/
    └── validators.ts
```

---

# Descripción de carpetas

| Carpeta     | Descripción                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| config      | Configuraciones generales del proyecto, cliente Prisma y configuración de Socket.IO |
| constants   | Constantes de negocio reutilizables y valores compartidos entre módulos             |
| controllers | Controladores de las peticiones HTTP, organizados por módulo y proceso              |
| helpers     | Funciones auxiliares de negocio específicas de cada proceso                         |
| interfaces  | Interfaces y tipados TypeScript reutilizables                                       |
| middlewares | Middlewares personalizados para autenticación, validaciones y cargas de archivos    |
| routes      | Definición y agrupación de rutas de la API por módulo y proceso                     |
| services    | Lógica de negocio y conexión con Prisma                                             |
| sockets     | Eventos de Socket.IO organizados por funcionalidad                                  |
| utils       | Utilidades generales reutilizables                                                  |

---

# Arquitectura utilizada

```txt
Route -> Controller -> Service -> Prisma
```

Para la funcionalidad de chat en tiempo real se utiliza la siguiente arquitectura:

```txt
Socket.IO -> Socket Middleware JWT -> Socket Event -> Service -> Prisma
```

---

# Archivos principales

## src/app.ts

Archivo encargado de:

* Inicializar Express.
* Configurar middlewares.
* Configurar CORS.
* Registrar rutas.
* Exportar la aplicación.

---

## src/server.ts

Archivo principal encargado de:

* Importar la aplicación.
* Crear el servidor HTTP.
* Definir puerto.
* Inicializar Socket.IO.
* Levantar el servidor.

---

## src/config/client.ts

Archivo encargado de crear y exportar la instancia de Prisma Client.


---

## src/config/socket.ts

Archivo encargado de inicializar Socket.IO dentro del servidor HTTP.

Funciones principales:

* Crear la instancia de Socket.IO.
* Configurar CORS para permitir conexión desde el frontend.
* Aplicar el middleware de autenticación por JWT para sockets.
* Registrar los eventos de Socket.IO del sistema, incluyendo chat de PQR y notificaciones.

---

# Validadores reutilizables

## src/utils/validators.ts

Este archivo centraliza validaciones genéricas que pueden utilizarse desde diferentes módulos del backend.

Actualmente incluye funciones reutilizables para:

* Validar textos que solo deben contener letras, espacios, tildes y `ñ`.
* Validar textos que solo deben contener números.
* Validar el formato básico de un correo electrónico.

Estas funciones se reutilizan, entre otros casos, para validar nombres de usuarios y candidatos, números de identificación y correos electrónicos, evitando repetir expresiones regulares en controladores o servicios.

---

# Variables de entorno

## Archivo

```txt
.env
```

## Variables

```env
PORT=4000
DATABASE_URL=
JWT_SECRET=
```

## Descripción

| Variable     | Descripción                                               |
| ------------ | --------------------------------------------------------- |
| PORT         | Puerto donde se ejecuta el backend                        |
| DATABASE_URL | URL de conexión a MySQL utilizada por Prisma              |
| JWT_SECRET   | Clave secreta utilizada para generar y validar tokens JWT |

---

# Configuración de Prisma

## Archivo `schema.prisma`

El archivo `schema.prisma` define:

* El proveedor de base de datos.
* Los modelos de Prisma.
* Los enums.
* Las relaciones entre tablas.
* La generación del cliente Prisma.

---
