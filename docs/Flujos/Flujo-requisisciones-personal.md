# Relación general del flujo de requisiciones

## 1. Creación de requisición

Cuando un usuario crea una requisición, selecciona o registra:

```txt
Departamento
Cargo solicitado
Ciudad
Motivo
Descripción del motivo
Tipo de contrato
Salario propuesto
```

Al seleccionar el cargo, el sistema consulta su revisión vigente y guarda obligatoriamente su identificador en:

```txt
positionRevisionId
```

La descripción del motivo también es obligatoria para cualquiera de los motivos disponibles y se almacena en:

```txt
otherReason
```

Se crea un registro en:

```txt
PersonnelRequisition
```

---

## 2. Generación del flujo de aprobación

El sistema toma el departamento de la requisición y sube por su jerarquía.

Ejemplo:

```txt
Producción
↓
Dirección de Operaciones
↓
Gerencia
```

Por cada nivel crea un registro en:

```txt
PersonnelRequisitionApproval
```

---

## 3. Resolución del usuario aprobador

Cada paso tiene un cargo aprobador.

Ejemplo:

```txt
Jefe de Producción
```

El sistema busca en:

```txt
UserPositionAssignment
```

qué usuario tiene activo ese cargo.

Así puede enviar la notificación al usuario correcto.

---

## 4. Confirmación de Talento Humano

Cuando termina la aprobación jerárquica, la requisición pasa a:

```txt
PENDIENTE_CONFIRMACION_TALENTO_HUMANO
```

Después el sistema consulta:

```txt
HumanTalentWorkflowConfig
```

y genera el flujo final de Talento Humano:

```txt
Auxiliar de Talento Humano
↓
Jefe de Talento Humano
```

Este flujo se guarda en:

```txt
PersonnelHiringConfirmationApproval
```

---

## 5. Aprobación final y cargue inicial de candidatos

Cuando el Jefe de Talento Humano aprueba el último paso, la confirmación y la requisición pasan a:

```txt
APROBADA
```

Al mismo tiempo, el sistema habilita el cargue y calcula el plazo de la presentación inicial:

```txt
candidateSubmissionStatus: ABIERTA
candidateSubmissionDeadlineAt: final del segundo día hábil
candidateSubmissionClosedAt: null
candidateSubmissionLateReason: null
```

Para este cálculo se consideran días hábiles de lunes a viernes y no se cuenta el día de la aprobación.

El sistema busca un usuario con una asignación activa al cargo:

```txt
DPC-TH-0080
Auxiliar de Talento Humano
```

Si existe un auxiliar activo, se le notifica que tiene un cargue de candidatos pendiente.

Si no existe un auxiliar activo, se notifica al Jefe de Talento Humano que realizó la aprobación final.

Mientras el cargue permanezca abierto, el Auxiliar de Talento Humano puede registrar hasta **10 candidatos** en:

```txt
PersonnelRequisitionCandidate
```

---

## 6. Primer cierre o presentación inicial

Cuando el Auxiliar finaliza la presentación por primera vez:

```txt
candidateSubmissionStatus: CERRADA
candidateSubmissionClosedAt: fecha y hora del primer cierre
```

Si el cierre ocurre después de `candidateSubmissionDeadlineAt`, debe registrar una justificación de retraso:

```txt
candidateSubmissionLateReason
```

El primer cierre se conserva directamente en `PersonnelRequisition` y **no se duplica** en `PersonnelCandidateSubmissionHistory`.

---

## 7. Reaperturas y cierres posteriores

Si Talento Humano necesita realizar ajustes, puede reabrir el cargue.

Cada reapertura:

* requiere un motivo;
* cambia `candidateSubmissionStatus` a `ABIERTA`;
* conserva `candidateSubmissionDeadlineAt`;
* conserva `candidateSubmissionClosedAt`;
* no genera un nuevo plazo de 2 días;
* crea un registro `REAPERTURA` en `PersonnelCandidateSubmissionHistory`.

Cuando el cargue se cierra nuevamente:

* `candidateSubmissionStatus` vuelve a `CERRADA`;
* `candidateSubmissionClosedAt` continúa representando el primer cierre y no cambia;
* no se vuelve a evaluar el plazo inicial;
* se crea un registro `CIERRE` independiente en `PersonnelCandidateSubmissionHistory`.

Ejemplo de trazabilidad:

```txt
PersonnelRequisition
Primer cierre: 18 agosto

PersonnelCandidateSubmissionHistory
REAPERTURA | 19 agosto | motivo
CIERRE     | 20 agosto
REAPERTURA | 21 agosto | motivo
CIERRE     | 21 agosto
```
