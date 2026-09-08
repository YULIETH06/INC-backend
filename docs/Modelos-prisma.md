# Documentación de modelos de tablas Prisma

## Descripción general

Este documento describe los modelos principales definidos en el archivo `schema.prisma`.

El sistema está dividido en dos módulos principales:

1. **Módulo PQR**
   - Gestión de solicitudes, mensajes, adjuntos, notificaciones y lectura de chats.

2. **Módulo Talento Humano**
   - Gestión de requisiciones de personal, estructura organizacional, cargos, revisiones de perfiles, tipos de identificación, asignaciones de usuarios a cargos, aprobaciones, firmas, confirmación de contratación, presentación de candidatos, historial de cargues, preselección de candidatos, validación de cargo y postulante y evaluación técnica.

---

# Modelo User

## Descripción

El modelo `User` representa a los usuarios registrados en el sistema.

Los usuarios tienen un rol general del sistema, pero los cargos organizacionales no se guardan directamente en este modelo.

La relación entre una persona y un cargo se maneja mediante el modelo `UserPositionAssignment`.

Esto permite manejar:

- Historial de cargos.
- Cambio de responsables.
- Múltiples cargos activos si la empresa lo requiere.
- Separación entre usuarios del sistema y cargos de la empresa.

## Campos principales

| Campo                                  | Tipo                                  | Descripción                                                           |
| -------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| id                                     | Int                                   | Identificador único del usuario                                       |
| name                                   | String                                | Nombre del usuario                                                    |
| email                                  | String                                | Correo electrónico único del usuario                                  |
| password                               | String                                | Contraseña encriptada del usuario                                     |
| role                                   | Role                                  | Rol general del sistema: USER, ADMIN o AGENT                          |
| signatureUrl                           | String?                               | Ruta de la imagen de la firma registrada por el usuario               |
| pqrsCreated                            | PQR[]                                 | PQR creadas por el usuario                                            |
| pqrsAssigned                           | PQR[]                                 | PQR asignadas al usuario cuando actúa como agente                     |
| pqrMessages                            | PqrMessage[]                          | Mensajes enviados por el usuario en chats de PQR                      |
| notifications                          | Notification[]                        | Notificaciones recibidas por el usuario                               |
| pqrChatReads                           | PqrChatRead[]                         | Registros de lectura de chats de PQR                                  |
| positionAssignments                    | UserPositionAssignment[]              | Asignaciones de cargos del usuario                                    |
| personnelRequisitions                  | PersonnelRequisition[]                | Requisiciones de personal creadas por el usuario                      |
| assignedRequisitionApprovals           | PersonnelRequisitionApproval[]        | Aprobaciones de requisiciones asignadas al usuario                    |
| decidedRequisitionApprovals            | PersonnelRequisitionApproval[]        | Aprobaciones de requisiciones decididas por el usuario                |
| hiringConfirmations                    | PersonnelHiringConfirmation[]         | Confirmaciones de contratación creadas por el usuario                 |
| assignedHiringConfirmationApprovals    | PersonnelHiringConfirmationApproval[] | Aprobaciones de confirmación de contratación asignadas al usuario     |
| decidedHiringConfirmationApprovals     | PersonnelHiringConfirmationApproval[] | Aprobaciones de confirmación de contratación decididas por el usuario |
| uploadedPersonnelRequisitionCandidates | PersonnelRequisitionCandidate[]       | Candidatos y hojas de vida cargados por el usuario                    |
| candidateSubmissionHistory             | PersonnelCandidateSubmissionHistory[] | Acciones de reapertura y cierres posteriores realizadas por el usuario |
| preselectedPersonnelRequisitionCandidates | PersonnelRequisitionCandidate[]     | Candidatos cuya preselección fue confirmada por el usuario            |
| closedCandidateSubmissionBatches       | PersonnelCandidateSubmissionBatch[]   | Cargues de candidatos cerrados por el usuario                         |
| performedPersonnelCandidateValidations | PersonnelCandidateValidation[]        | Validaciones de candidatos finalizadas por el usuario                 |
| enteredPersonnelCandidateTechnicalEvaluations | PersonnelCandidateTechnicalEvaluation[] | Evaluaciones técnicas diligenciadas por el usuario                    |
| approvedPersonnelCandidateTechnicalEvaluations | PersonnelCandidateTechnicalEvaluation[] | Evaluaciones técnicas confirmadas por el usuario                      |
| createdAt                              | DateTime                              | Fecha de creación del usuario                                         |
| updatedAt                              | DateTime                              | Fecha de última actualización del usuario                             |

---

# Modelo PQR

## Descripción

El modelo `PQR` representa las solicitudes creadas por los usuarios dentro del módulo de PQR.

Una PQR puede tener mensajes, archivos adjuntos por medio de los mensajes, notificaciones y registros de lectura del chat.

## Campos principales

| Campo         | Tipo           | Descripción                            |
| ------------- | -------------- | -------------------------------------- |
| id            | Int            | Identificador único de la PQR          |
| caseType      | PqrCaseType    | Tipo de caso de la PQR                 |
| description   | String         | Descripción de la solicitud            |
| status        | PqrStatus      | Estado actual de la PQR                |
| createdAt     | DateTime       | Fecha de creación de la PQR            |
| updatedAt     | DateTime       | Fecha de última actualización          |
| userId        | Int            | Usuario que creó la PQR                |
| user          | User           | Relación con el usuario creador        |
| assignedToId  | Int?           | Usuario agente asignado a la PQR       |
| assignedTo    | User?          | Relación con el agente asignado        |
| priority      | PqrPriority?   | Prioridad de la PQR                    |
| rating        | Int?           | Calificación dada por el usuario       |
| ratingComment | String?        | Comentario opcional de la calificación |
| ratedAt       | DateTime?      | Fecha de calificación                  |
| messages      | PqrMessage[]   | Mensajes asociados a la PQR            |
| notifications | Notification[] | Notificaciones relacionadas con la PQR |
| chatReads     | PqrChatRead[]  | Registros de lectura del chat          |

---

# Modelo PqrMessage

## Descripción

El modelo `PqrMessage` representa los mensajes enviados dentro del chat de una PQR.

Un mensaje pertenece a una PQR y a un usuario remitente. También puede tener archivos adjuntos.

## Campos principales

| Campo       | Tipo                   | Descripción                         |
| ----------- | ---------------------- | ----------------------------------- |
| id          | Int                    | Identificador único del mensaje     |
| content     | String?                | Contenido del mensaje               |
| createdAt   | DateTime               | Fecha de creación del mensaje       |
| pqrId       | Int                    | Identificador de la PQR relacionada |
| pqr         | PQR                    | Relación con la PQR                 |
| senderId    | Int                    | Usuario que envió el mensaje        |
| sender      | User                   | Relación con el usuario remitente   |
| attachments | PqrMessageAttachment[] | Archivos adjuntos del mensaje       |

---

# Modelo PqrChatRead

## Descripción

El modelo `PqrChatRead` representa la última lectura del chat de una PQR por parte de un usuario.

Sirve para saber si un usuario tiene mensajes pendientes por leer.

## Campos principales

| Campo      | Tipo     | Descripción                       |
| ---------- | -------- | --------------------------------- |
| id         | Int      | Identificador único del registro  |
| pqrId      | Int      | Identificador de la PQR           |
| userId     | Int      | Identificador del usuario         |
| lastReadAt | DateTime | Fecha y hora de la última lectura |
| pqr        | PQR      | Relación con la PQR               |
| user       | User     | Relación con el usuario           |

## Restricción única

```prisma
@@unique([pqrId, userId])
```

Esta restricción evita que un mismo usuario tenga más de un registro de lectura para la misma PQR.

---

# Modelo PqrMessageAttachment

## Descripción

El modelo `PqrMessageAttachment` representa los archivos adjuntos enviados dentro de los mensajes del chat de una PQR.

## Campos principales

| Campo        | Tipo              | Descripción                               |
| ------------ | ----------------- | ----------------------------------------- |
| id           | Int               | Identificador único del archivo adjunto   |
| fileName     | String            | Nombre generado para almacenar el archivo |
| originalName | String            | Nombre original del archivo               |
| fileUrl      | String            | Ruta o URL donde se almacena el archivo   |
| fileType     | PqrAttachmentType | Tipo de archivo adjunto                   |
| mimeType     | String            | Tipo MIME del archivo                     |
| fileSize     | Int               | Tamaño del archivo                        |
| createdAt    | DateTime          | Fecha de carga del archivo                |
| messageId    | Int               | Mensaje al que pertenece el archivo       |
| message      | PqrMessage        | Relación con el mensaje                   |

---

# Modelo Notification

## Descripción

El modelo `Notification` representa las notificaciones internas generadas para los usuarios.

Puede relacionarse con una PQR o con una requisición de personal, dependiendo del módulo que genere la notificación.

## Campos principales

| Campo                  | Tipo                  | Descripción                                       |
| ---------------------- | --------------------- | ------------------------------------------------- |
| id                     | Int                   | Identificador único de la notificación            |
| title                  | String                | Título de la notificación                         |
| message                | String                | Mensaje de la notificación                        |
| type                   | NotificationType      | Tipo de notificación                              |
| isRead                 | Boolean               | Indica si la notificación fue leída               |
| userId                 | Int                   | Usuario destinatario                              |
| pqrId                  | Int?                  | PQR relacionada, si aplica                        |
| personnelRequisitionId | Int?                  | Requisición de personal relacionada, si aplica    |
| createdAt              | DateTime              | Fecha de creación                                 |
| user                   | User                  | Relación con el usuario destinatario              |
| pqr                    | PQR?                  | Relación opcional con una PQR                     |
| personnelRequisition   | PersonnelRequisition? | Relación opcional con una requisición de personal |

## Tipos de notificación de Talento Humano

El enum `NotificationType` incluye actualmente los siguientes tipos relacionados con Talento Humano:

```txt
REQUISITION_PENDING_APPROVAL
REQUISITION_APPROVED
REQUISITION_REJECTED
HIRING_CONFIRMATION_PENDING
HIRING_CONFIRMATION_APPROVED
HIRING_CONFIRMATION_REJECTED
REQUISITION_CANDIDATES_PENDING
REQUISITION_CANDIDATES_WITHOUT_ASSISTANT
REQUISITION_CANDIDATES_CLOSED
REQUISITION_CANDIDATES_REOPENED
CANDIDATE_TECHNICAL_EVALUATION_PENDING
```

---

# Modelo Department

## Descripción

El modelo `Department` representa los departamentos o áreas de la empresa.

Este modelo es clave para el flujo de aprobación de requisiciones porque permite definir:

1. A qué departamento pertenece una requisición.
2. Qué cargo es responsable de aprobar en ese departamento.
3. Cuál es el departamento superior al que debe subir la aprobación.

## Campos principales

| Campo                 | Tipo                           | Descripción                                        |
| --------------------- | ------------------------------ | -------------------------------------------------- |
| id                    | Int                            | Identificador único del departamento               |
| code                  | String                         | Código único del departamento                      |
| name                  | String                         | Nombre del departamento                            |
| isActive              | Boolean                        | Indica si el departamento está activo              |
| parentDepartmentId    | Int?                           | Departamento superior o padre                      |
| parentDepartment      | Department?                    | Relación con el departamento superior              |
| childDepartments      | Department[]                   | Departamentos hijos o dependientes                 |
| responsiblePositionId | Int?                           | Cargo responsable de aprobar por este departamento |
| responsiblePosition   | PositionProfile?               | Relación con el cargo responsable                  |
| positions             | PositionProfile[]              | Cargos que tienen este departamento como base      |
| requisitions          | PersonnelRequisition[]         | Requisiciones creadas para este departamento       |
| requisitionApprovals  | PersonnelRequisitionApproval[] | Aprobaciones generadas para este departamento      |
| createdAt             | DateTime                       | Fecha de creación                                  |
| updatedAt             | DateTime                       | Fecha de última actualización                      |

## Ejemplo de jerarquía

```txt
Producción
Responsable: Jefe de Producción
Padre: Dirección de Operaciones

Dirección de Operaciones
Responsable: Director de Operaciones
Padre: Gerencia

Gerencia
Responsable: Subgerente General
Padre: ninguno
```

Con esta estructura, una requisición de Producción sube así:

```txt
Jefe de Producción
↓
Director de Operaciones
↓
Subgerente General
```

---

# Modelo PositionProfile

## Descripción

El modelo `PositionProfile` representa los cargos o perfiles de cargo de la empresa.

Los cargos son un catálogo. No dependen directamente de una persona y no deben eliminarse cuando cambia el empleado que ocupa el cargo.

La relación entre un usuario y un cargo se maneja mediante `UserPositionAssignment`.

## Campos principales

| Campo                       | Tipo                                  | Descripción                                                                    |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| id                          | Int                                   | Identificador único del cargo                                                  |
| code                        | String                                | Código único del cargo o perfil                                                |
| name                        | String                                | Nombre del cargo                                                               |
| isActive                    | Boolean                               | Indica si el cargo está activo                                                 |
| homeDepartmentId            | Int?                                  | Departamento base del cargo                                                    |
| homeDepartment              | Department?                           | Relación con el departamento base                                              |
| responsibleForDepartments   | Department[]                          | Departamentos donde este cargo es responsable                                  |
| userAssignments             | UserPositionAssignment[]              | Usuarios asignados histórica o actualmente a este cargo                        |
| requisitions                | PersonnelRequisition[]                | Requisiciones donde se solicita este cargo                                     |
| requisitionApprovals        | PersonnelRequisitionApproval[]        | Aprobaciones de requisición donde este cargo debe aprobar                      |
| hiringConfirmationApprovals | PersonnelHiringConfirmationApproval[] | Aprobaciones de contratación donde este cargo debe aprobar                     |
| humanTalentAnalystConfigs   | HumanTalentWorkflowConfig[]           | Configuraciones donde este cargo actúa como primer VoBo de Talento Humano      |
| humanTalentChiefConfigs     | HumanTalentWorkflowConfig[]           | Configuraciones donde este cargo actúa como aprobación final de Talento Humano |
| revisions                   | PositionProfileRevision[]             | Historial de revisiones asociadas con el perfil de cargo                       |
| createdAt                   | DateTime                              | Fecha de creación                                                              |
| updatedAt                   | DateTime                              | Fecha de última actualización                                                  |

---

# Modelo PositionRequirement

## Descripción

El modelo `PositionRequirement` representa los requisitos fijos utilizados en las revisiones de los perfiles de cargo.

Los requisitos se almacenan de forma independiente y pueden relacionarse con múltiples descripciones pertenecientes a diferentes revisiones.

Los requisitos configurados actualmente son:

```txt
Formación académica
Experiencia
Conocimientos específicos
```

## Campos principales

| Campo        | Tipo                             | Descripción                                                      |
| ------------ | -------------------------------- | ---------------------------------------------------------------- |
| id           | Int                              | Identificador único del requisito                                |
| name         | String                           | Nombre único del requisito                                       |
| descriptions | PositionRequirementDescription[] | Descripciones asociadas con el requisito en distintas revisiones |

---

# Modelo PositionProfileRevision

## Descripción

El modelo `PositionProfileRevision` representa una versión específica de un perfil de cargo.

Cada perfil puede tener varias revisiones para conservar su historial. Una revisión puede encontrarse en estado `BORRADOR`, `VIGENTE` u `OBSOLETA`.

Las requisiciones de personal quedan asociadas con la revisión utilizada al momento de su creación, permitiendo conservar la información histórica aunque posteriormente se publique una nueva revisión.

## Campos principales

| Campo                   | Tipo                             | Descripción                                            |
| ----------------------- | -------------------------------- | ------------------------------------------------------ |
| id                      | Int                              | Identificador único de la revisión                     |
| positionProfileId       | Int                              | Identificador del perfil de cargo                      |
| positionProfile         | PositionProfile                  | Relación con el perfil de cargo                        |
| revisionNumber          | Int                              | Número consecutivo de la revisión                      |
| revisionDate            | DateTime                         | Fecha de creación de la revisión                       |
| status                  | PositionProfileRevisionStatus    | Estado de la revisión: BORRADOR, VIGENTE u OBSOLETA    |
| changeObservation       | String?                          | Observación general o descripción del cambio           |
| deletedAt               | DateTime?                        | Fecha de eliminación lógica cuando aplica              |
| requirementDescriptions | PositionRequirementDescription[] | Descripciones de requisitos registradas en la revisión |
| requisitions            | PersonnelRequisition[]           | Requisiciones creadas utilizando esta revisión         |
| updatedAt               | DateTime                         | Fecha de última actualización                          |

## Restricción única

```prisma
@@unique([positionProfileId, revisionNumber])
```

Esta restricción evita que un mismo perfil de cargo tenga dos revisiones con el mismo número.

---

# Modelo PositionRequirementDescription

## Descripción

El modelo `PositionRequirementDescription` representa una descripción registrada para un requisito dentro de una revisión específica.

Una revisión puede tener varias descripciones para cada requisito. Las descripciones pueden eliminarse lógicamente mediante el campo `deletedAt`.

## Campos principales

| Campo         | Tipo                    | Descripción                                  |
| ------------- | ----------------------- | -------------------------------------------- |
| id            | Int                     | Identificador único de la descripción        |
| revisionId    | Int                     | Identificador de la revisión                 |
| revision      | PositionProfileRevision | Relación con la revisión del perfil de cargo |
| requirementId | Int                     | Identificador del requisito                  |
| requirement   | PositionRequirement     | Relación con el requisito                    |
| description   | String                  | Contenido de la descripción del requisito    |
| createdAt     | DateTime                | Fecha de creación                            |
| updatedAt     | DateTime                | Fecha de última actualización                |
| deletedAt     | DateTime?               | Fecha de eliminación lógica cuando aplica    |
| requirementValidations | PersonnelCandidateRequirementValidation[] | Evaluaciones de candidatos asociadas con esta descripción |

---

# Modelo UserPositionAssignment

## Descripción

El modelo `UserPositionAssignment` representa la asignación de un usuario a un cargo.

Este modelo permite manejar:

1. Cargo actual de un usuario.
2. Historial de cargos.
3. Múltiples cargos activos si la empresa lo requiere.
4. Cambio de responsables sin modificar el catálogo de cargos.

## Campos principales

| Campo                       | Tipo                                  | Descripción                                                   |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| id                          | Int                                   | Identificador único de la asignación                          |
| userId                      | Int                                   | Usuario asignado al cargo                                     |
| user                        | User                                  | Relación con el usuario                                       |
| positionId                  | Int                                   | Cargo asignado                                                |
| position                    | PositionProfile                       | Relación con el cargo                                         |
| startDate                   | DateTime                              | Fecha de inicio de la asignación                              |
| endDate                     | DateTime?                             | Fecha de finalización de la asignación                        |
| isActive                    | Boolean                               | Indica si la asignación está activa                           |
| requisitionApprovals        | PersonnelRequisitionApproval[]        | Aprobaciones de requisición relacionadas con esta asignación  |
| hiringConfirmationApprovals | PersonnelHiringConfirmationApproval[] | Aprobaciones de contratación relacionadas con esta asignación |
| createdAt                   | DateTime                              | Fecha de creación                                             |
| updatedAt                   | DateTime                              | Fecha de actualización                                        |

## Ejemplo

```txt
Usuario: María Pérez
Cargo: Jefe de Producción
isActive: true
```

Con esto, el sistema sabe que cuando una requisición necesita aprobación del cargo `Jefe de Producción`, debe notificar al usuario que tenga activa esa asignación.

---

# Modelo City

## Descripción

El modelo `City` representa las ciudades disponibles para crear requisiciones de personal.

Esta tabla permite controlar desde la base de datos qué ciudades se muestran en el formulario.

## Campos principales

| Campo        | Tipo                   | Descripción                         |
| ------------ | ---------------------- | ----------------------------------- |
| id           | Int                    | Identificador único de la ciudad    |
| name         | String                 | Nombre de la ciudad                 |
| isActive     | Boolean                | Indica si la ciudad está activa     |
| requisitions | PersonnelRequisition[] | Requisiciones asociadas a la ciudad |
| createdAt    | DateTime               | Fecha de creación                   |
| updatedAt    | DateTime               | Fecha de actualización              |

---

# Modelo IdentificationType

## Descripción

El modelo `IdentificationType` representa el catálogo de tipos de identificación.

Este catálogo permite reutilizar los tipos de documento sin guardar su nombre directamente en las tablas.

Cada tipo de identificación puede activarse o desactivarse mediante el campo `isActive`.

## Campos principales

| Campo      | Tipo                            | Descripción                                                      |
| ---------- | ------------------------------- | ---------------------------------------------------------------- |
| id         | Int                             | Identificador único del tipo de identificación                   |
| code       | String                          | Código único del tipo de identificación, por ejemplo `CC` o `CE` |
| name       | String                          | Nombre único del tipo de identificación                          |
| isActive   | Boolean                         | Indica si el tipo de identificación se encuentra activo          |
| candidates | PersonnelRequisitionCandidate[] | Candidatos registrados con este tipo de identificación           |
| createdAt  | DateTime                        | Fecha de creación                                                |
| updatedAt  | DateTime                        | Fecha de última actualización                                    |

## Restricciones principales

```prisma
code String @unique
name String @unique
```

Estas restricciones evitan registrar dos tipos de identificación con el mismo código o con el mismo nombre.

---

# Modelo PersonnelRequisition

## Descripción

El modelo `PersonnelRequisition` representa una requisición de personal creada por un usuario.

Una requisición pertenece a un departamento, solicita un cargo y queda asociada obligatoriamente con la revisión del perfil de cargo utilizada al momento de su creación.

También contiene una ciudad, un motivo, la descripción obligatoria de ese motivo, las condiciones de contratación, un salario propuesto y un estado general.

Además, controla el proceso de presentación de candidatos una vez la requisición ha sido aprobada completamente. Para la presentación inicial se conserva la fecha límite, la fecha del primer cierre y, cuando aplica, el motivo del retraso. Las reaperturas y los cierres posteriores se almacenan por separado en `PersonnelCandidateSubmissionHistory`.

Cada vez que el cargue de candidatos es cerrado, el sistema conserva una fotografía completa de los candidatos existentes en ese momento mediante `PersonnelCandidateSubmissionBatch`. Esto permite mantener un historial independiente de `Cargue 1`, `Cargue 2`, `Cargue 3`, etc., aunque posteriormente el cargue sea reabierto y algunos candidatos sean modificados o eliminados.

Después del cierre del cargue, el creador de la requisición puede realizar la preselección de uno o varios candidatos.

El flujo de aprobación de la requisición se genera a partir del departamento seleccionado y su jerarquía organizacional.

## Campos principales

| Campo                          | Tipo                                   | Descripción                                                                  |
| ------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------- |
| id                             | Int                                    | Identificador único de la requisición                                        |
| requestDate                    | DateTime                               | Fecha de solicitud                                                           |
| departmentId                   | Int                                    | Departamento para el cual se crea la requisición                             |
| department                     | Department                             | Relación con el departamento                                                 |
| positionId                     | Int                                    | Identificador del cargo solicitado                                           |
| position                       | PositionProfile                        | Relación con el cargo solicitado                                             |
| positionRevisionId             | Int                                    | Identificador obligatorio de la revisión utilizada                           |
| positionRevision               | PositionProfileRevision                | Relación obligatoria con la revisión del perfil de cargo                     |
| reason                         | RequisitionReason                      | Motivo seleccionado para crear la requisición                                |
| otherReason                    | String                                 | Descripción obligatoria correspondiente al motivo seleccionado               |
| cityId                         | Int                                    | Ciudad de la requisición                                                     |
| city                           | City                                   | Relación con la ciudad                                                       |
| contractType                   | ContractType?                          | Tipo principal de contratación                                               |
| directContractType             | DirectContractType?                    | Tipo de contrato directo                                                     |
| contractDurationMonths         | Int?                                   | Duración del contrato en meses cuando aplica                                 |
| internContractType             | InternContractType?                    | Tipo de practicante cuando aplica                                            |
| proposedSalary                 | Decimal                                | Salario propuesto                                                            |
| status                         | PersonnelRequisitionStatus             | Estado general de la requisición                                             |
| createdById                    | Int                                    | Usuario que creó la requisición                                              |
| createdBy                      | User                                   | Relación con el usuario creador                                              |
| approvals                      | PersonnelRequisitionApproval[]         | Pasos de aprobación de la requisición                                        |
| hiringConfirmation             | PersonnelHiringConfirmation?           | Confirmación de contratación asociada                                        |
| candidateSubmissionStatus      | CandidateSubmissionStatus              | Estado del proceso de cargue y presentación de candidatos                    |
| candidateSubmissionDeadlineAt  | DateTime?                              | Fecha y hora límite de la presentación inicial de candidatos                 |
| candidateSubmissionClosedAt    | DateTime?                              | Fecha y hora del primer cierre o presentación inicial; no cambia al reabrir  |
| candidateSubmissionLateReason  | String?                                | Justificación del retraso del primer cierre cuando se realiza fuera de plazo |
| candidateSubmissionHistory     | PersonnelCandidateSubmissionHistory[] | Historial de reaperturas y cierres posteriores al primer cierre              |
| candidates                     | PersonnelRequisitionCandidate[]        | Candidatos y hojas de vida asociados a la requisición                        |
| candidateSubmissionBatches     | PersonnelCandidateSubmissionBatch[]   | Historial de cargues cerrados asociados con la requisición                   |
| notifications                  | Notification[]                         | Notificaciones relacionadas con la requisición                               |
| createdAt                      | DateTime                               | Fecha de creación                                                            |
| updatedAt                      | DateTime                               | Fecha de actualización                                                       |

## Estados principales de la requisición

| Estado                                | Descripción                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------- |
| PENDIENTE_APROBACION                  | La requisición fue creada y está pendiente por iniciar o asignar aprobación |
| EN_APROBACION                         | La requisición está en flujo de aprobación jerárquica                       |
| PENDIENTE_CONFIRMACION_TALENTO_HUMANO | Ya fue aprobada por la jerarquía y espera confirmación de Talento Humano    |
| PENDIENTE_APROBACION_TALENTO_HUMANO   | La confirmación fue creada y espera aprobación final de Talento Humano      |
| APROBADA                              | La requisición fue aprobada completamente                                   |
| RECHAZADA                             | La requisición fue rechazada                                                |
| CANCELADA                             | La requisición fue cancelada                                                |

## Estados del cargue de candidatos

El cargue de candidatos se controla por separado del estado general de la requisición.

| Estado      | Descripción                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| NO_INICIADA | La requisición todavía no está habilitada para recibir candidatos                   |
| ABIERTA     | El Auxiliar de Talento Humano puede registrar o modificar candidatos                |
| CERRADA     | La presentación fue finalizada y los candidatos quedan bloqueados para modificación |

## Regla de presentación inicial

Cuando la requisición queda completamente `APROBADA`, el sistema habilita el cargue y calcula `candidateSubmissionDeadlineAt` con un plazo de **2 días hábiles**, contando de lunes a viernes y sin incluir el día de la aprobación.

La fecha límite corresponde al final del segundo día hábil.

El primer cierre se guarda únicamente en `PersonnelRequisition`:

```txt
candidateSubmissionClosedAt
candidateSubmissionLateReason
```

Si el primer cierre se realiza después de `candidateSubmissionDeadlineAt`, `candidateSubmissionLateReason` es obligatorio.

Una reapertura posterior no modifica `candidateSubmissionDeadlineAt`, no borra `candidateSubmissionClosedAt` y no genera un nuevo plazo de 2 días.

---

# Modelo PersonnelCandidateSubmissionHistory

## Descripción

El modelo `PersonnelCandidateSubmissionHistory` conserva las acciones realizadas después de la presentación inicial de candidatos.

El primer cierre no se duplica en esta tabla, porque su fecha y su posible justificación de retraso quedan almacenadas directamente en `PersonnelRequisition`.

El historial comienza cuando el cargue se reabre por primera vez. Cada acción se almacena como un registro independiente.

## Acciones permitidas

```txt
REAPERTURA
CIERRE
```

Estas acciones corresponden al enum:

```prisma
CandidateSubmissionHistoryAction
```

## Campos principales

| Campo         | Tipo                             | Descripción                                                       |
| ------------- | -------------------------------- | ----------------------------------------------------------------- |
| id            | Int                              | Identificador único del registro                                  |
| requisitionId | Int                              | Identificador de la requisición relacionada                       |
| requisition   | PersonnelRequisition             | Relación con la requisición                                       |
| action        | CandidateSubmissionHistoryAction | Acción registrada: `REAPERTURA` o `CIERRE`                        |
| reason        | String?                          | Motivo de la reapertura; es `null` para los registros de `CIERRE` |
| performedById | Int                              | Usuario que realizó la acción                                     |
| performedBy   | User                             | Relación con el usuario que realizó la acción                     |
| performedAt   | DateTime                         | Fecha y hora en que se realizó la acción                          |

## Reglas principales

- `REAPERTURA` requiere un motivo entre 3 y 500 caracteres.
- `CIERRE` se registra en el historial únicamente cuando corresponde a un cierre posterior a una reapertura.
- El primer cierre no genera un registro `CIERRE` en esta tabla.
- Cada reapertura y cada cierre posterior generan registros separados.
- Los registros se utilizan para conservar la trazabilidad sin modificar la fecha de la presentación inicial.

## Índices

```prisma
@@index([requisitionId])
@@index([performedById])
@@index([action])
@@index([performedAt])
```

---

# Modelo PersonnelCandidateSubmissionBatch

## Descripción

El modelo `PersonnelCandidateSubmissionBatch` representa cada cierre histórico del cargue de candidatos de una requisición.

Cada vez que el cargue pasa de estado `ABIERTA` a `CERRADA`, se genera un nuevo cargue numerado consecutivamente.

Ejemplo:

```txt
Cargue 1
Cargue 2
Cargue 3
```

Cada cargue conserva la fecha y hora del cierre, el usuario que realizó la acción y la fotografía completa de los candidatos existentes en ese momento.

Este historial es independiente de `PersonnelCandidateSubmissionHistory`, ya que este último conserva las acciones de reapertura y cierre del proceso, mientras que `PersonnelCandidateSubmissionBatch` conserva el contenido completo presentado en cada cierre.

## Campos principales

| Campo            | Tipo                                     | Descripción                                           |
| ---------------- | ---------------------------------------- | ----------------------------------------------------- |
| id               | Int                                      | Identificador único del cargue histórico              |
| requisitionId    | Int                                      | Identificador de la requisición relacionada           |
| requisition      | PersonnelRequisition                     | Relación con la requisición                           |
| submissionNumber | Int                                      | Número consecutivo del cargue                         |
| closedById       | Int                                      | Identificador del usuario que realizó el cierre       |
| closedBy         | User                                     | Usuario que realizó el cierre                         |
| closedAt         | DateTime                                 | Fecha y hora en que fue cerrado el cargue             |
| candidates       | PersonnelCandidateSubmissionBatchItem[] | Candidatos que formaban parte de ese cargue histórico |

## Restricción única

```prisma
@@unique([requisitionId, submissionNumber])
```

Esta restricción evita que una misma requisición tenga dos cargues con el mismo número.

Ejemplo:

```txt
Requisición 25
├── Cargue 1
├── Cargue 2
└── Cargue 3
```

## Índices

```prisma
@@index([requisitionId])
@@index([closedById])
@@index([closedAt])
```

---

# Modelo PersonnelCandidateSubmissionBatchItem

## Descripción

El modelo `PersonnelCandidateSubmissionBatchItem` representa un candidato dentro de la fotografía histórica de un cargue.

Cada registro conserva los principales datos identificadores del candidato tal como se encontraban al momento del cierre.

Esto permite mantener la trazabilidad histórica aunque posteriormente el candidato sea eliminado de la lista actual de candidatos de la requisición.

## Campos principales

| Campo                  | Tipo                                  | Descripción                                                 |
| ---------------------- | ------------------------------------- | ----------------------------------------------------------- |
| id                     | Int                                   | Identificador único del registro                            |
| submissionBatchId      | Int                                   | Identificador del cargue histórico                          |
| submissionBatch        | PersonnelCandidateSubmissionBatch    | Relación con el cargue histórico                            |
| itemNumber             | Int                                   | Número u orden del candidato dentro del cargue              |
| candidateId            | Int?                                  | Identificador del candidato actual, si todavía existe       |
| candidate              | PersonnelRequisitionCandidate?       | Relación opcional con el candidato actual                   |
| candidateName          | String                                | Nombre del candidato conservado históricamente              |
| identificationTypeCode | String                                | Código del tipo de identificación conservado históricamente |
| identificationNumber   | String                                | Número de identificación conservado históricamente          |

## Conservación histórica

La relación con `PersonnelRequisitionCandidate` utiliza:

```prisma
onDelete: SetNull
```

Si posteriormente un candidato es eliminado, el campo `candidateId` del registro histórico pasa a `null`, pero permanecen almacenados:

```txt
candidateName
identificationTypeCode
identificationNumber
```

## Restricción única

```prisma
@@unique([submissionBatchId, itemNumber])
```

Esta restricción evita repetir una misma posición dentro de un cargue.

## Índices

```prisma
@@index([submissionBatchId])
@@index([candidateId])
```

---

# Modelo PersonnelRequisitionCandidate

## Descripción

El modelo `PersonnelRequisitionCandidate` representa un candidato registrado para una requisición de personal.

Cada candidato queda identificado mediante un tipo de identificación y un número de identificación. También almacena el nombre, una observación opcional y la información de la hoja de vida cargada.

Además, conserva el estado definitivo de preselección del candidato. La preselección se realiza después del cierre del cargue y únicamente puede ser confirmada por el usuario que creó la requisición.

Una vez confirmada, la condición de preseleccionado se conserva permanentemente dentro de este proceso junto con la fecha y el usuario que realizó la acción.

## Campos principales

| Campo                | Tipo                                     | Descripción                                                               |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| id                   | Int                                      | Identificador único del candidato                                         |
| requisitionId        | Int                                      | Identificador de la requisición relacionada                               |
| requisition          | PersonnelRequisition                     | Relación con la requisición de personal                                   |
| identificationTypeId | Int                                      | Identificador del tipo de identificación                                  |
| identificationType   | IdentificationType                       | Relación con el tipo de identificación                                    |
| identificationNumber | String                                   | Número de identificación del candidato                                    |
| name                 | String                                   | Nombre completo del candidato                                             |
| observation          | String?                                  | Observación opcional registrada por Talento Humano                        |
| originalName         | String                                   | Nombre original de la hoja de vida cargada                                |
| fileName             | String                                   | Nombre generado por el backend para almacenar el archivo                  |
| fileUrl              | String                                   | Ruta donde se encuentra almacenada la hoja de vida                        |
| mimeType             | String                                   | Tipo MIME del archivo                                                     |
| fileSize             | Int                                      | Tamaño del archivo expresado en bytes                                     |
| uploadedById         | Int                                      | Identificador del usuario que realizó el cargue                           |
| uploadedBy           | User                                     | Relación con el usuario que registró al candidato                         |
| isPreselected        | Boolean                                  | Indica si el candidato fue confirmado como preseleccionado                |
| preselectedAt        | DateTime?                                | Fecha y hora en que se confirmó la preselección                           |
| preselectedById      | Int?                                     | Identificador del usuario que confirmó la preselección                    |
| preselectedBy        | User?                                    | Usuario que confirmó la preselección                                      |
| submissionBatchItems | PersonnelCandidateSubmissionBatchItem[] | Cargues históricos en los que apareció el candidato                      |
| validation           | PersonnelCandidateValidation?            | Relación opcional con la validación de cargo y postulante                 |
| createdAt            | DateTime                                 | Fecha y hora en que se registró el candidato                              |
| updatedAt            | DateTime                                 | Fecha y hora de la última modificación                                    |

## Información ingresada por el usuario

El formulario de cargue solicita:

```txt
Tipo de identificación
Número de identificación
Nombre
Hoja de vida
Observación
```

Ejemplo:

```txt
Tipo de identificación: CC
Número de identificación: 1045678901
Nombre: Carlos Gómez
Hoja de vida: Carlos_Gomez.pdf
Observación: Experiencia de 4 años
```

La observación es opcional.

## Información generada automáticamente

El backend obtiene o genera automáticamente:

```txt
requisitionId
originalName
fileName
fileUrl
mimeType
fileSize
uploadedById
createdAt
updatedAt
```

## Preselección del candidato

La preselección se realiza después de que el cargue de candidatos se encuentra en estado `CERRADA`.

Las reglas principales son:

- La preselección únicamente puede realizarla el usuario que creó la requisición.
- La requisición debe encontrarse completamente `APROBADA`.
- El creador puede seleccionar uno o varios candidatos y confirmar la preselección conjuntamente.
- Puede realizar nuevas preselecciones posteriores sobre candidatos que todavía no hayan sido preseleccionados.
- Los usuarios autorizados que participan en el flujo de la requisición pueden visualizar qué candidatos están preseleccionados.
- Si el cargue se reabre, los candidatos previamente preseleccionados no puede ser editado ni eliminado durante una reapertura.
- Los candidatos no preseleccionados pueden modificarse o eliminarse mientras el cargue permanezca `ABIERTA`.
- Durante una reapertura pueden agregarse nuevos candidatos.
- Cuando el cargue vuelve a cerrarse, el creador puede realizar nuevas preselecciones.

## Restricción única de identificación por requisición

```prisma
@@unique([requisitionId, identificationTypeId, identificationNumber])
```

Esta restricción evita registrar dentro de una misma requisición dos candidatos con la misma combinación de tipo y número de identificación.

El mismo número puede existir con otro tipo de identificación o dentro de otra requisición, porque la restricción incluye los tres campos.

## Índices

```prisma
@@index([requisitionId])
@@index([identificationTypeId])
@@index([uploadedById])
@@index([isPreselected])
@@index([preselectedById])
```

Estos índices facilitan las consultas por requisición, tipo de identificación, usuario que realizó el cargue, candidatos preseleccionados y usuario que confirmó la preselección.

---

# Modelo PersonnelCandidateValidation

## Descripción

El modelo `PersonnelCandidateValidation` representa el proceso general de validación de cargo y postulante asociado con un candidato preseleccionado.

Cada candidato puede tener como máximo una validación. El registro se crea al guardar la Fase 1 y conserva el avance general del proceso mediante `completedStep`.

## Fases

```txt
1 = Concepto de aplicación
2 = Validación de cargo
3 = Validación del postulante completada
4 = Evaluación Técnica confirmada
```

`completedStep` representa la última fase completamente finalizada.

En la Fase 4, `completedStep` permanece en `3` mientras las calificaciones están en registro o pendientes de aprobación. Solo cambia a `4` cuando el creador de la requisición confirma la Evaluación Técnica.

## Campos principales

| Campo                    | Tipo                                      | Descripción                                                                 |
| ------------------------ | ----------------------------------------- | --------------------------------------------------------------------------- |
| id                       | Int                                       | Identificador único de la validación                                        |
| candidateId              | Int                                       | Identificador único del candidato asociado                                  |
| candidate                | PersonnelRequisitionCandidate             | Relación con el candidato                                                   |
| applicationConcept       | CandidateApplicationConcept               | Concepto de aplicación seleccionado en la Fase 1                            |
| positionType             | CandidatePositionType?                    | Tipo de cargo seleccionado en la Fase 2                                     |
| changeControlCode        | String?                                   | Código de control de cambio cuando se selecciona `NUEVO_CARGO`              |
| isPositionProfileCurrent | Boolean?                                  | Indica si la revisión usada en la requisición coincide con la revisión VIGENTE al guardar la Fase 2 |
| isSuitable | Boolean? | Indica si el postulante fue considerado apto para continuar después de completar la Fase 3 |
| performedById            | Int?                                      | Usuario que completó la Fase 3                                              |
| performedBy              | User?                                     | Relación con el usuario que completó la Fase 3                              |
| completedStep            | Int                                       | Indica hasta qué fase del proceso de validación ha avanzado el postulante                                        |
| validatedAt              | DateTime?                                 | Fecha y hora en que se completó la Fase 3                                   |
| requirementValidations | PersonnelCandidateRequirementValidation[] | Contiene el resultado de cumplimiento de cada requisito evaluado durante la Fase 3 |
| technicalEvaluation | PersonnelCandidateTechnicalEvaluation? | Guarda la información de la Fase 4, incluyendo las calificaciones de entrevista y examen, el estado de la evaluación y la decisión sobre si el postulante puede continuar |
| createdAt                | DateTime                                  | Fecha de creación                                                           |
| updatedAt                | DateTime                                  | Fecha de última actualización                                               |

## Restricción única

```prisma
candidateId Int @unique
```

Esta restricción garantiza que un candidato no pueda tener más de una validación general.

## Índices

```prisma
@@index([performedById])
@@index([completedStep])
```

Estos índices facilitan las consultas por el usuario que realizó la validación y por la fase alcanzada dentro del proceso.

---

# Modelo PersonnelCandidateTechnicalEvaluation

## Descripción

El modelo `PersonnelCandidateTechnicalEvaluation` almacena la **Fase 4 - Evaluación Técnica** de un candidato.

Cada validación general puede tener como máximo una Evaluación Técnica.

La fase registra de forma independiente:

```txt
Entrevista
Examen
```

Cada calificación puede diligenciarse por separado. La fecha de cada componente se registra automáticamente la primera vez que se guarda su calificación.

Cuando ambas calificaciones se encuentran diligenciadas, la Evaluación Técnica pasa automáticamente a estado:

```txt
PENDIENTE_APROBACION
```

y el sistema notifica al usuario que creó la requisición.

El creador de la requisición es quien confirma si el postulante es apto para continuar en el proceso.

## Estados de la Evaluación Técnica

El enum `CandidateTechnicalEvaluationStatus` contiene:

```txt
EN_REGISTRO
PENDIENTE_APROBACION
APROBADA
```

| Estado                 | Descripción                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| EN_REGISTRO            | La evaluación está siendo diligenciada y todavía falta al menos una nota    |
| PENDIENTE_APROBACION   | Entrevista y examen ya fueron calificados y esperan confirmación del creador |
| APROBADA               | El creador de la requisición revisó y confirmó la Evaluación Técnica         |

> `APROBADA` indica que la Evaluación Técnica fue revisada y confirmada. No significa necesariamente que el candidato sea apto. El campo `isSuitable` puede ser `false` aunque el estado sea `APROBADA`.

## Campos principales

| Campo                  | Tipo                                   | Descripción                                                               |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| id                     | Int                                    | Identificador único de la Evaluación Técnica                              |
| candidateValidationId  | Int                                    | Identificador de la validación general asociada                           |
| candidateValidation    | PersonnelCandidateValidation           | Relación con la validación general                                        |
| interviewScore         | Decimal?                               | Calificación de la entrevista técnica                                     |
| interviewRecordedAt    | DateTime?                              | Fecha y hora de la primera captura de la calificación de entrevista       |
| examScore              | Decimal?                               | Calificación del examen técnico                                           |
| examRecordedAt         | DateTime?                              | Fecha y hora de la primera captura de la calificación del examen          |
| status                 | CandidateTechnicalEvaluationStatus     | Estado actual de la Evaluación Técnica                                    |
| enteredById            | Int                                    | Usuario que diligenció las calificaciones                                 |
| enteredBy              | User                                   | Relación con el usuario que diligenció las calificaciones                 |
| isSuitable             | Boolean?                               | Decisión del creador sobre si el postulante puede continuar               |
| approvedById           | Int?                                   | Usuario que confirmó la Evaluación Técnica                                |
| approvedBy             | User?                                  | Relación con el usuario que confirmó la Evaluación Técnica                |
| approvedAt             | DateTime?                              | Fecha y hora en que fue confirmada                                        |
| createdAt              | DateTime                               | Fecha de creación                                                         |
| updatedAt              | DateTime                               | Fecha de última actualización                                             |

## Restricción única

```prisma
candidateValidationId Int @unique
```

Esta restricción garantiza una sola Evaluación Técnica por cada validación de candidato.

## Índices

```prisma
@@index([enteredById])
@@index([approvedById])
@@index([status])
```

Estos índices facilitan las consultas por el usuario que diligenció la Evaluación Técnica, el usuario que la confirmó y su estado actual.

---

# Modelo PersonnelCandidateRequirementValidation

## Descripción

El modelo `PersonnelCandidateRequirementValidation` almacena la evaluación individual de cada descripción de requisito utilizada en la Fase 3.

Cada registro pertenece a una validación general y a una `PositionRequirementDescription` de la revisión exacta utilizada por la requisición.

## Campos principales

| Campo                    | Tipo                                   | Descripción                                               |
| ------------------------ | -------------------------------------- | --------------------------------------------------------- |
| id                       | Int                                    | Identificador único del resultado                         |
| candidateValidationId    | Int                                    | Identificador de la validación general                    |
| candidateValidation      | PersonnelCandidateValidation           | Relación con la validación general                        |
| requirementDescriptionId | Int                                    | Descripción exacta del requisito evaluado                 |
| requirementDescription   | PositionRequirementDescription         | Relación con la descripción del requisito                 |
| complies                 | Boolean                                | Indica si el candidato cumple la descripción              |
| evidence                 | String?                                | Evidencia obligatoria cuando `complies` es `true`         |
| gapClosure               | String?                                | Cierre de brecha obligatorio cuando `complies` es `false` |
| createdAt                | DateTime                               | Fecha de creación                                         |
| updatedAt                | DateTime                               | Fecha de actualización                                    |

## Restricción única

```prisma
@@unique([candidateValidationId, requirementDescriptionId])
```

Esta restricción evita evaluar dos veces la misma descripción dentro de una misma validación.

## Índices

```prisma
@@index([candidateValidationId])
@@index([requirementDescriptionId])
```

Estos índices facilitan las consultas de las evaluaciones por validación de candidato y por descripción del requisito evaluado.

## Regla de evidencia y cierre de brecha

```txt
complies = true
→ evidence obligatorio
→ gapClosure null

complies = false
→ evidence null
→ gapClosure obligatorio
```

---

# Modelo PersonnelRequisitionApproval

## Descripción

El modelo `PersonnelRequisitionApproval` representa cada paso de aprobación jerárquica de una requisición de personal.

Estos pasos ya no dependen de roles como `JEFE_AREA`, `JEFE_DEPARTAMENTO` o `GERENTE_GENERAL`.

Ahora se generan desde la estructura organizacional:

```txt
Department
↓
responsiblePosition
↓
parentDepartment
↓
responsiblePosition
```

## Campos principales

| Campo                | Tipo                    | Descripción                                               |
| -------------------- | ----------------------- | --------------------------------------------------------- |
| id                   | Int                     | Identificador único del paso de aprobación                |
| requisitionId        | Int                     | Requisición relacionada                                   |
| requisition          | PersonnelRequisition    | Relación con la requisición                               |
| approvalOrder        | Int                     | Orden del paso dentro del flujo                           |
| departmentId         | Int?                    | Departamento que origina este paso de aprobación          |
| department           | Department?             | Relación con el departamento del paso                     |
| approverPositionId   | Int                     | Cargo que debe aprobar este paso                          |
| approverPosition     | PositionProfile         | Relación con el cargo aprobador                           |
| approverAssignmentId | Int?                    | Asignación usuario-cargo usada para resolver el aprobador |
| approverAssignment   | UserPositionAssignment? | Relación con la asignación del aprobador                  |
| approverUserId       | Int?                    | Usuario asignado para aprobar                             |
| approverUser         | User?                   | Relación con el usuario aprobador asignado                |
| decision             | ApprovalDecision?       | Decisión tomada: aprobada, rechazada o cancelada          |
| comment              | String?                 | Comentario opcional de la decisión                        |
| decidedById          | Int?                    | Usuario que tomó la decisión                              |
| decidedBy            | User?                   | Relación con el usuario que decidió                       |
| assignedAt           | DateTime                | Fecha en que se asignó el paso                            |
| decidedAt            | DateTime?               | Fecha en que se tomó la decisión                          |
| isCurrent            | Boolean                 | Indica si este paso es el paso activo actualmente         |
| createdAt            | DateTime                | Fecha de creación                                         |
| updatedAt            | DateTime                | Fecha de actualización                                    |

## Restricción única

```prisma
@@unique([requisitionId, approvalOrder])
```

Esta restricción evita que una misma requisición tenga dos pasos con el mismo orden.

## Ejemplo

Para una requisición de Producción:

```txt
approvalOrder: 1
department: Producción
approverPosition: Jefe de Producción
isCurrent: true
```

```txt
approvalOrder: 2
department: Dirección de Operaciones
approverPosition: Director de Operaciones
isCurrent: false
```

```txt
approvalOrder: 3
department: Gerencia
approverPosition: Subgerente General
isCurrent: false
```

Cuando aprueba el paso 1, el paso 1 pasa a `isCurrent: false` y el paso 2 pasa a `isCurrent: true`.

---

# Modelo HumanTalentWorkflowConfig

## Descripción

El modelo `HumanTalentWorkflowConfig` define qué cargos participan en el cierre de Talento Humano después de que una requisición fue aprobada por la jerarquía organizacional.

En el flujo actual se usa un solo registro activo:

```txt
Auxiliar de Talento Humano
↓
Jefe de Talento Humano
```

Este modelo evita dejar estos cargos quemados directamente en el código.

## Campos principales

| Campo             | Tipo            | Descripción                                                       |
| ----------------- | --------------- | ----------------------------------------------------------------- |
| id                | Int             | Identificador único de la configuración                           |
| name              | String          | Nombre de la configuración                                        |
| analystPositionId | Int             | Cargo que realiza el primer VoBo o confirmación de Talento Humano |
| analystPosition   | PositionProfile | Relación con el cargo del primer VoBo                             |
| chiefPositionId   | Int             | Cargo que realiza la aprobación final de Talento Humano           |
| chiefPosition     | PositionProfile | Relación con el cargo aprobador final                             |
| isActive          | Boolean         | Indica si esta configuración está activa                          |
| createdAt         | DateTime        | Fecha de creación                                                 |
| updatedAt         | DateTime        | Fecha de actualización                                            |

## Ejemplo

```txt
name: Flujo principal de Talento Humano
analystPosition: Auxiliar de Talento Humano
chiefPosition: Jefe de Talento Humano
isActive: true
```

---

# Modelo PersonnelHiringConfirmation

## Descripción

El modelo `PersonnelHiringConfirmation` representa la confirmación de contratación que realiza Talento Humano cuando una requisición ya fue aprobada por la jerarquía.

Aquí se registran los datos finales o confirmados de contratación, como tipo de contrato, duración y salario aprobado.

## Campos principales

| Campo                  | Tipo                                  | Descripción                                  |
| ---------------------- | ------------------------------------- | -------------------------------------------- |
| id                     | Int                                   | Identificador único de la confirmación       |
| requisitionId          | Int                                   | Requisición relacionada                      |
| requisition            | PersonnelRequisition                  | Relación con la requisición                  |
| contractType           | ContractType                          | Tipo principal de contratación confirmado   |
| directContractType     | DirectContractType?                   | Tipo de contrato directo confirmado          |
| contractDurationMonths | Int?                                  | Duración del contrato en meses cuando aplica |
| internContractType     | InternContractType?                   | Tipo de practicante cuando aplica            |
| approvedSalary         | Decimal                               | Salario aprobado                             |
| status                 | PersonnelHiringConfirmationStatus     | Estado de la confirmación                    |
| createdById            | Int                                   | Usuario que creó la confirmación             |
| createdBy              | User                                  | Relación con el usuario creador              |
| approvals              | PersonnelHiringConfirmationApproval[] | Pasos de aprobación de la confirmación       |
| createdAt              | DateTime                              | Fecha de creación                            |
| updatedAt              | DateTime                              | Fecha de actualización                       |

## Estados principales

| Estado               | Descripción                                               |
| -------------------- | --------------------------------------------------------- |
| PENDIENTE_APROBACION | La confirmación fue creada y está pendiente de aprobación |
| APROBADA             | La confirmación fue aprobada                              |
| RECHAZADA            | La confirmación fue rechazada                             |
| CANCELADA            | La confirmación fue cancelada                             |

---

# Modelo PersonnelHiringConfirmationApproval

## Descripción

El modelo `PersonnelHiringConfirmationApproval` representa los pasos de aprobación del cierre de contratación de Talento Humano.

Este flujo se genera a partir de `HumanTalentWorkflowConfig`.

En el flujo actual:

```txt
1. Auxiliar de Talento Humano
2. Jefe de Talento Humano
```

## Campos principales

| Campo                | Tipo                        | Descripción                                               |
| -------------------- | --------------------------- | --------------------------------------------------------- |
| id                   | Int                         | Identificador único del paso                              |
| hiringConfirmationId | Int                         | Confirmación de contratación relacionada                  |
| hiringConfirmation   | PersonnelHiringConfirmation | Relación con la confirmación                              |
| approvalOrder        | Int                         | Orden del paso dentro del flujo                           |
| approverPositionId   | Int                         | Cargo que debe aprobar este paso                          |
| approverPosition     | PositionProfile             | Relación con el cargo aprobador                           |
| approverAssignmentId | Int?                        | Asignación usuario-cargo usada para resolver el aprobador |
| approverAssignment   | UserPositionAssignment?     | Relación con la asignación del aprobador                  |
| approverUserId       | Int?                        | Usuario asignado para aprobar                             |
| approverUser         | User?                       | Relación con el usuario aprobador                         |
| decision             | ApprovalDecision?           | Decisión tomada                                           |
| comment              | String?                     | Comentario opcional de la decisión                        |
| decidedById          | Int?                        | Usuario que tomó la decisión                              |
| decidedBy            | User?                       | Relación con el usuario que decidió                       |
| assignedAt           | DateTime                    | Fecha en que se asignó el paso                            |
| decidedAt            | DateTime?                   | Fecha de decisión                                         |
| isCurrent            | Boolean                     | Indica si este paso está activo actualmente               |
| createdAt            | DateTime                    | Fecha de creación                                         |
| updatedAt            | DateTime                    | Fecha de actualización                                    |

## Restricción única

```prisma
@@unique([hiringConfirmationId, approvalOrder])
```

Esta restricción evita que una misma confirmación tenga dos pasos con el mismo orden.
