# Relación general del flujo de auditoría

La auditoría registra en el modelo `AuditLog` cada acción importante que realiza una persona en el sistema. El ADMIN la consulta mediante `GET /api/audit-logs`.

## 1. Reglas de la auditoría

* Los registros no se pueden editar ni eliminar: el sistema solo tiene un endpoint de consulta (`GET /api/audit-logs`).
* Cada registro se guarda dentro de la misma transacción de la acción. Si la acción falla, el registro tampoco se guarda.
* Solo se registran acciones que cambian datos. No se registran consultas, notificaciones o mensajes marcados como leídos, ni los mensajes del chat de una PQR.
* Nunca se guardan contraseñas ni archivos: la descripción solo dice, por ejemplo, `Restableció la contraseña de María Pérez`.
* Un intento fallido de inicio de sesión no se enlaza al dueño del correo, porque pudo hacerlo otra persona. Se guarda el correo escrito en `actorEmail` y la cuenta en `entityId`.
* Un cambio sin diferencia (por ejemplo, guardar el mismo rol o el mismo estado) no genera registro.
* La consulta devuelve como máximo 500 registros (`AUDIT_LOG_QUERY_LIMIT`), junto con el total que cumple los filtros.

## 2. Cómo se crean los registros

Los registros se crean con las funciones de:

```txt
src/helpers/audit/auditLog.helper.ts
```

| Función | Descripción |
| ------- | ----------- |
| `getAuditActor(req)` | Obtiene de la petición el usuario que hace la acción. Se llama en el controlador. |
| `toAuditActor(user)` | Convierte un usuario que ya tiene el servicio en el actor de la auditoría. |
| `createAuditLog(tx, data)` | Guarda el registro dentro de la transacción recibida y copia el nombre del usuario. |
| `shortenAuditText(text, maxLength)` | Acorta un texto largo para incluirlo en la descripción. |

## 3. Acciones registradas por módulo

### Inicio de sesión (`AUTH`)

| Acción | Descripción que se guarda |
| ------ | ------------------------- |
| `LOGIN_SUCCESS` | Ingresó al sistema |
| `LOGIN_FAILED` | El correo no está registrado / Contraseña incorrecta / Usuario desactivado |
| `USER_REGISTERED` | Creó su cuenta |
| `OWN_PASSWORD_CHANGED` | Cambió su propia contraseña |
| `LOGOUT` | Cerró sesión |
| `LOGOUT_INACTIVITY` | Sesión cerrada por inactividad |

### Usuarios (`USERS`)

| Acción | Descripción que se guarda |
| ------ | ------------------------- |
| `USER_ROLE_CHANGED` | María Pérez: Usuario → Agente |
| `USER_EMAIL_CHANGED` | María Pérez: correo anterior → correo nuevo |
| `USER_PASSWORD_RESET` | Restableció la contraseña de María Pérez |
| `USER_DEACTIVATED` | Desactivó a María Pérez (y se le retiró N cargo, si tenía) |
| `USER_ACTIVATED` | Activó a María Pérez |
| `USER_POSITION_ASSIGNED` | Asignó a Pedro Díaz el cargo X (antes: Y, si tenía otro) |
| `USER_POSITION_ENDED` | Retiró a Pedro Díaz del cargo X |
| `USERS_BULK_UPLOADED` | Cargó N usuarios desde un archivo |
| `USER_SIGNATURE_UPDATED` | Registró su firma |

### PQR (`PQRS`)

| Acción | Descripción que se guarda |
| ------ | ------------------------- |
| `PQR_CREATED` | PQR #130 – tipo de caso |
| `PQR_TAKEN` | Tomó la PQR #130 |
| `PQR_AGENT_ASSIGNED` | PQR #130 asignada a Carlos Ruiz / reasignada de Ana Torres a Carlos Ruiz |
| `PQR_AGENT_UNASSIGNED` | Quitó a Carlos Ruiz de la PQR #130 |
| `PQR_STATUS_CHANGED` | PQR #130: En proceso → Cerrada |
| `PQR_PRIORITY_CHANGED` | PQR #130: Media → Alta (o Sin prioridad → Alta) |
| `PQR_RATED` | Calificó la PQR #130 con 4 estrellas |

### Perfiles de cargo (`POSITION_MANAGEMENT`)

Todas las descripciones inician con `cargo – revisión N`.

| Acción | Descripción que se guarda |
| ------ | ------------------------- |
| `POSITION_REVISION_CREATED` | nueva revisión en borrador |
| `POSITION_REVISION_UPDATED` | actualizó la observación del cambio |
| `POSITION_REVISION_PUBLISHED` | publicada (la revisión anterior quedó obsoleta, si había una vigente) |
| `POSITION_REQUIREMENT_ADDED` | Requisito: descripción |
| `POSITION_REQUIREMENT_UPDATED` | Requisito: texto anterior → texto nuevo |
| `POSITION_REQUIREMENT_DELETED` | Requisito: eliminó "descripción" |
| `POSITION_COMPETENCY_ADDED` | Tipo de competencia: competencia |
| `POSITION_COMPETENCY_UPDATED` | Tipo de competencia: texto anterior → texto nuevo |
| `POSITION_COMPETENCY_DELETED` | Tipo de competencia: eliminó "competencia" |

### Talento Humano (`HUMAN_TALENT`)

| Acción | Descripción que se guarda |
| ------ | ------------------------- |
| `REQUISITION_CREATED` | Requisición #34 – cargo |
| `REQUISITION_APPROVED` | Requisición #34 – cargo |
| `REQUISITION_REJECTED` | Requisición #34 – cargo. Motivo: comentario (si se escribió) |
| `REQUISITION_CANCELLED` | Requisición #34 – cargo. Motivo: comentario (si se escribió) |
| `HIRING_CONFIRMATION_CREATED` | Requisición #34 – cargo |
| `HIRING_CONFIRMATION_APPROVED` | Requisición #34 – cargo (en la última aprobación agrega "aprobación final: se habilitó el cargue de candidatos") |
| `HIRING_CONFIRMATION_REJECTED` | Requisición #34 – cargo. Motivo: comentario (si se escribió) |
| `HIRING_CONFIRMATION_CANCELLED` | Requisición #34 – cargo. Motivo: comentario (si se escribió) |
| `CANDIDATE_UPLOADED` | Requisición #34 – nombre del candidato |
| `CANDIDATE_UPDATED` | Requisición #34 – nombre (y "actualizó la hoja de vida", si cambió el archivo) |
| `CANDIDATE_DELETED` | Requisición #34 – nombre del candidato |
| `CANDIDATE_SUBMISSION_CLOSED` | Requisición #34 – cerró la recepción de candidatos (cargue N, X candidatos) |
| `CANDIDATE_SUBMISSION_REOPENED` | Requisición #34 – reabrió la recepción de candidatos. Motivo: ... |
| `CANDIDATES_PRESELECTED` | Requisición #34 – N candidatos preseleccionados: nombres |
| `CANDIDATE_VALIDATION_STARTED` | Candidato – Requisición #34: concepto de aplicación Ingreso / Modificación de cargo |
| `CANDIDATE_POSITION_VALIDATED` | Candidato – Requisición #34: cargo existente / nuevo cargo (control de cambio X) |
| `CANDIDATE_REQUIREMENTS_VALIDATED` | Candidato – Requisición #34: apto / no apto (cumple X de Y requisitos) |
| `TECHNICAL_EVALUATION_SAVED` | Candidato – Requisición #34: entrevista 4.0, examen 3.5 (enviada para aprobación, si están las dos notas) |
| `TECHNICAL_EVALUATION_APPROVED` | Candidato – Requisición #34: apto / no apto para continuar |
| `COMPETENCY_EVALUATION_COMPLETED` | Candidato – Requisición #34: apto / no apto |

Las autoaprobaciones de los pasos del creador de una requisición no generan registros de aprobación: quedan cubiertas por `REQUISITION_CREATED`.