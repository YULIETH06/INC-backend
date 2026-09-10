# Endpoints funcionales

Actualmente el backend cuenta con endpoints funcionales para validación, autenticación, manejo seguro de usuarios mediante JWT, administración de PQR y consulta del historial de mensajes del chat.

---

## Health Check

```http
GET /api/health
```

### Descripción

Endpoint utilizado para verificar el correcto funcionamiento de la API.

---

### Respuesta exitosa

```json
{
  "message": "API funcionando correctamente"
}
```

---

# Registrar usuario

## Endpoint

```http
POST /api/auth/register
```

## Descripción

Endpoint encargado del registro de nuevos usuarios.

Funciones implementadas:

* Limpieza y normalización de datos.
* Validación de campos obligatorios.
* Validación de nombre.
* Validación de formato de correo electrónico.
* Validación de longitud mínima de contraseña.
* Verificación de email existente.
* Encriptación segura de contraseña con bcrypt.
* Registro en MySQL mediante Prisma.
* Protección de contraseña en respuestas.

---

## Validaciones implementadas

### Nombre

* Es obligatorio.
* Solo permite letras.
* Debe tener mínimo 3 caracteres.
* Se eliminan espacios innecesarios.

### Correo electrónico

* Es obligatorio.
* Debe tener un formato válido.
* Se convierte automáticamente a minúsculas.
* Se eliminan espacios innecesarios.
* No puede estar registrado previamente.

### Contraseña

* Es obligatoria.
* Debe tener mínimo 6 caracteres.
* Se eliminan espacios innecesarios.
* Se almacena encriptada mediante bcrypt.

---

## Body

```json
{
  "name": "Juan",
  "email": "juan@gmail.com",
  "password": "123456"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Usuario registrado correctamente",
  "user": {
    "id": 1,
    "name": "Juan",
    "email": "juan@gmail.com",
    "role": "USER"
  }
}
```

---

## Respuesta si faltan campos

```json
{
  "message": "Todos los campos son obligatorios"
}
```

---

## Respuesta si el nombre contiene caracteres inválidos

```json
{
  "message": "El nombre solo puede contener letras"
}
```

---

## Respuesta si el nombre tiene menos de 3 caracteres

```json
{
  "message": "El nombre debe tener mínimo 3 caracteres"
}
```

---

## Respuesta si el correo no tiene formato válido

```json
{
  "message": "El correo electrónico no tiene un formato válido"
}
```

---

## Respuesta si la contraseña tiene menos de 6 caracteres

```json
{
  "message": "La contraseña debe tener mínimo 6 caracteres"
}
```

---

## Respuesta si el usuario ya existe

```json
{
  "message": "El usuario ya existe"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al registrar usuario"
}
```

---

# Carga masiva de usuarios

## Endpoint protegido para ADMIN

```http
POST /api/users/bulk
```

## Descripción

Endpoint encargado de registrar usuarios mediante carga masiva desde un archivo Excel.

Esta funcionalidad permite subir un archivo con varios usuarios y procesarlos de forma automática. El sistema lee el archivo, valida la información de cada fila y registra los usuarios en la base de datos.

En esta carga masiva, el administrador puede definir el rol de cada usuario mediante la columna `rol`.

La operación pertenece al módulo de usuarios y requiere que el usuario autenticado tenga rol `ADMIN`.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
```

---

## Acceso permitido

* ADMIN

---

## Tipo de envío requerido

Este endpoint no recibe datos en formato JSON.

Debe enviarse mediante:

```txt
multipart/form-data
```

---

## Formato del archivo Excel

El archivo debe tener las siguientes columnas en la primera fila:

```txt
nombre | correo | contraseña | rol
```

### Ejemplo

| nombre     | correo                                  | contraseña | rol   |
| ---------- | --------------------------------------- | ---------- | ----- |
| Juan Pérez | [juan@gmail.com](mailto:juan@gmail.com) | 123456     | USER  |
| Ana María  | [ana@gmail.com](mailto:ana@gmail.com)   | 123456     | AGENT |
| José Peña  | [jose@gmail.com](mailto:jose@gmail.com) | 123456     | ADMIN |

---

## Campo requerido

| Campo | Tipo | Obligatorio | Descripción                                |
| ----- | ---- | ----------- | ------------------------------------------ |
| file  | File | Sí          | Archivo Excel con los usuarios a registrar |

---

## Ejemplo en Postman

```txt
Método: POST
URL: http://localhost:4000/api/users/bulk
Body: form-data
Key: file
Type: File
Value: usuarios.xlsx
```

---

## Validaciones implementadas

### Archivo

* El archivo es obligatorio.
* Debe ser un archivo Excel.
* Solo se permiten archivos con extensión `.xlsx` o `.xls`.
* Debe contener al menos una hoja.
* Debe contener usuarios para registrar.
* Debe tener las columnas requeridas: `nombre`, `correo`, `contraseña` y `rol`.

### Nombre

* Es obligatorio.
* Solo permite letras, espacios, tildes y la letra ñ.
* Debe tener mínimo 3 caracteres.
* Se eliminan espacios innecesarios al inicio y al final.

### Correo electrónico

* Es obligatorio.
* Debe tener un formato válido.
* Se convierte automáticamente a minúsculas.
* Se eliminan espacios innecesarios al inicio y al final.
* No puede estar repetido dentro del archivo.
* No puede estar registrado previamente en la base de datos.

### Rol

* Es obligatorio.
* Se convierte automáticamente a mayúsculas.
* Debe corresponder a uno de los roles permitidos.

Roles permitidos:

```txt
USER
ADMIN
AGENT
```

### Contraseña

* Es obligatoria.
* Debe tener mínimo 6 caracteres.
* Se almacena encriptada mediante bcrypt.

---

## Respuesta exitosa

```json
{
  "message": "Carga masiva procesada correctamente",
  "result": {
    "totalRows": 2,
    "totalCreated": 2,
    "totalRowsWithErrors": 0,
    "totalErrors": 0,
    "createdUsers": [
      {
        "id": 32,
        "name": "lolauno",
        "email": "louno@gmail.com",
        "role": "USER"
      },
      {
        "id": 31,
        "name": "pello",
        "email": "pellouno@gmail.com",
        "role": "AGENT"
      }
    ],
    "errors": [],
    "message": "Todos los usuarios fueron registrados correctamente."
  }
}
```

---

## Respuesta si no se envía archivo

```json
{
  "message": "Debe subir un archivo Excel"
}
```

---

## Respuesta si el tipo de archivo no es válido

```json
{
  "message": "Solo se permiten archivos Excel"
}
```

---

## Respuesta si el archivo no contiene encabezados

```json
{
  "message": "El archivo Excel no contiene encabezados"
}
```

## Respuesta si faltan columnas requeridas

```json
{
  "message": "El archivo Excel no tiene las columnas requeridas: rol. Las columnas obligatorias son: nombre, correo, contraseña y rol."
}
```

---
## Respuesta si el archivo no contiene hojas

```json
{
  "message": "El archivo Excel no contiene hojas"
}
```

## Respuesta si no se puede leer la hoja

```json
{
  "message": "No se pudo leer la hoja del archivo Excel"
}
```

## Respuesta si el archivo no contiene usuarios

```json
{
  "message": "El archivo Excel no contiene usuarios para registrar"
}
```

## Respuesta si una fila tiene campos incompletos

```json
{
  "row": 2,
  "email": "ana@gmail.com",
  "message": "Todos los campos son obligatorios"
}
```

## Respuesta si el nombre contiene caracteres inválidos

```json
{
"row": 3,
"totalErrors": 1,
"errors": [
  {
    "column": "nombre",
    "message": "El nombre solo puede contener letras"
  }
]
}
```

## Respuesta si el correo no tiene formato válido

```json
{
"row": 3,
"totalErrors": 1,
"errors": [
  {
    "column": "correo",
    "message": "El correo electrónico no tiene un formato válido"
  }
]
}
```

## Respuesta si el rol no es válido

```json
{
"row": 3,
"totalErrors": 1,
"errors": [
  {
    "column": "rol",
    "message": "Rol no válido. Los roles permitidos son USER, ADMIN y AGENT"
  }
]
}
```

## Respuesta si el correo está duplicado dentro del archivo

```json
{
"row": 3,
"totalErrors": 1,
"errors": [
  {
    "column": "correo",
    "message": "Correo duplicado dentro del archivo"
  }
]
}
```

## Respuesta si el usuario ya existe

```json
{
"row": 3,
"totalErrors": 1,
"errors": [
  {
    "column": "correo",
    "message": "El usuario ya existe"
  }
]
}
```

## Respuesta si la contraseña tiene menos de 6 caracteres

```json
{
"row": 3,
"totalErrors": 1,
"errors": [
  {
    "column": "contraseña",
    "message": "La contraseña debe tener mínimo 6 caracteres"
  }
]
}
```

## Respuesta en caso de error

```json
{
  "message": "Error al procesar la carga masiva de usuarios"
}
```

---

# Obtener usuarios

## Endpoint protegido para ADMIN

```http
GET /api/users
```

## Descripción

Endpoint privado encargado de obtener todos los usuarios registrados en el sistema.

Esta ruta permite al administrador visualizar los usuarios existentes y sus roles actuales.

Por seguridad, la respuesta no debe incluir la contraseña del usuario.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
```

---

## Acceso permitido

* ADMIN

---

## Respuesta exitosa

```json
{
  "message": "Usuarios obtenidos correctamente",
  "users": [
    {
      "id": 1,
      "name": "Juan",
      "email": "juan@gmail.com",
      "role": "USER"
    }
  ]
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener los usuarios"
}
```

---

# Obtener agentes

## Endpoint protegido para ADMIN

```http
GET /api/users/agents
```

## Descripción

Endpoint privado encargado de obtener únicamente los usuarios con rol `AGENT`.

Esta ruta permite al administrador consultar la lista de agentes disponibles para asignar o reasignar una PQR.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
```

---

## Acceso permitido

* ADMIN

---

## Respuesta exitosa

```json
{
  "message": "Agentes obtenidos correctamente",
  "agents": [
    {
      "id": 5,
      "name": "Carlos Agente",
      "email": "carlos@gmail.com",
      "role": "AGENT"
    },
    {
      "id": 8,
      "name": "María Agente",
      "email": "maria@gmail.com",
      "role": "AGENT"
    }
  ]
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta si el usuario no es ADMIN

```json
{
  "message": "No tienes permisos para acceder a esta ruta"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener los agentes"
}
```


---

# Cambiar rol de usuario

## Endpoint protegido para ADMIN

```http
PATCH /api/users/:id/role
```

## Ejemplo

```http
PATCH /api/users/2/role
```

## Descripción

Endpoint privado encargado de cambiar el rol de un usuario registrado en el sistema.

Esta ruta solo puede ser utilizada por usuarios autenticados con rol `ADMIN`.

Permite asignar roles según la función que tendrá cada usuario dentro del sistema.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

---

## Acceso permitido

* ADMIN

---

## Parámetros

| Parámetro | Tipo   | Descripción                                                 |
| --------- | ------ | ----------------------------------------------------------- |
| id        | number | Identificador del usuario al que se le desea cambiar el rol |

---

## Roles permitidos

```txt
USER
ADMIN
AGENT
```

---

## Body

```json
{
  "role": "AGENT"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Rol del usuario actualizado correctamente",
  "user": {
    "id": 2,
    "name": "Carlos",
    "email": "carlos@gmail.com",
    "role": "AGENT"
  }
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id del usuario no es válido"
}
```

---

## Respuesta si no se envía el rol

```json
{
  "message": "El rol es obligatorio"
}
```

---

## Respuesta si el rol no es válido

```json
{
  "message": "Rol no válido",
  "allowedRoles": [
    "USER",
    "ADMIN",
    "AGENT"
  ]
}
```

---

## Respuesta si el usuario no existe

```json
{
  "message": "El usuario no existe"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al actualizar el rol del usuario"
}
```

---

# Restablecer contraseña de un usuario

## Endpoint protegido para ADMIN

```http
PATCH /api/users/:id/password
```

## Ejemplo

```http
PATCH /api/users/5/password
```

## Descripción

Endpoint privado encargado de permitir que un usuario con rol `ADMIN` restablezca la contraseña de otro usuario registrado en el sistema.

A diferencia del cambio de contraseña del usuario autenticado, esta operación no requiere conocer ni enviar la contraseña actual del usuario. El administrador únicamente define la nueva contraseña.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

---

## Acceso permitido

* ADMIN

---

## Parámetros

| Parámetro | Tipo   | Descripción                                                     |
| --------- | ------ | --------------------------------------------------------------- |
| id        | number | Identificador del usuario al que se le restablecerá la contraseña |

---

## Body

```json
{
  "newPassword": "654321"
}
```

---

## Campos del body

| Campo       | Tipo   | Obligatorio | Descripción                                      |
| ----------- | ------ | ----------- | ------------------------------------------------ |
| newPassword | string | Sí          | Nueva contraseña que se asignará al usuario      |

---

## Validaciones implementadas

### Identificador del usuario

* Debe ser un número entero válido.
* Debe ser mayor que cero.
* El usuario debe existir en la base de datos.

### Nueva contraseña

* Es obligatoria.
* Debe contener mínimo 6 caracteres.
* Debe ser diferente de la contraseña actual del usuario.
* Se compara de forma segura con la contraseña actual mediante `bcryptjs`.
* Se almacena encriptada mediante `bcryptjs`.

---

## Respuesta exitosa

```json
{
  "message": "Contraseña del usuario actualizada correctamente",
  "user": {
    "id": 5,
    "name": "Juan Pérez",
    "email": "juan@gmail.com",
    "role": "USER"
  }
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id del usuario no es válido"
}
```

---

## Respuesta si no se envía la nueva contraseña

```json
{
  "message": "La nueva contraseña es obligatoria"
}
```

---

## Respuesta si la nueva contraseña tiene menos de 6 caracteres

```json
{
  "message": "La nueva contraseña debe tener mínimo 6 caracteres"
}
```

---

## Respuesta si la nueva contraseña es igual a la actual

```json
{
  "message": "La nueva contraseña debe ser diferente a la contraseña actual"
}
```

---

## Respuesta si el usuario no existe

```json
{
  "message": "El usuario no existe"
}
```

---

## Respuesta si el usuario autenticado no es ADMIN

```json
{
  "message": "No tienes permisos para acceder a esta ruta"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Token no proporcionado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al actualizar la contraseña del usuario"
}
```

---


# Login de usuario JWT

## Endpoint

```http
POST /api/auth/login
```

## Descripción

Endpoint encargado de autenticar usuarios registrados mediante JWT.

Funciones implementadas:

* Validación de email.
* Validación de contraseña.
* Comparación segura con bcrypt.
* Generación de token JWT.
* Retorno del usuario autenticado.
* Protección de credenciales sensibles.

---

## Body

```json
{
  "email": "juan@gmail.com",
  "password": "123456"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Juan",
    "email": "juan@gmail.com",
    "role": "USER"
  }
}
```

---

## Respuesta credenciales inválidas

```json
{
  "message": "Credenciales inválidas"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al iniciar sesión"
}
```

---


# Cambiar contraseña del usuario autenticado

## Endpoint protegido

```http
PATCH /api/auth/password
```

## Descripción

Endpoint privado encargado de permitir que el usuario autenticado cambie su propia contraseña de acceso al sistema.

La funcionalidad solicita la contraseña actual y una nueva contraseña. Antes de realizar el cambio, el sistema verifica que la contraseña actual corresponda con la contraseña almacenada para el usuario autenticado.

El usuario se identifica mediante el token JWT, por lo tanto, no es necesario enviar el identificador del usuario en el body.

La nueva contraseña se almacena de forma segura mediante `bcryptjs`.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

Cualquier usuario autenticado puede cambiar únicamente su propia contraseña.

---

## Body

```json
{
  "currentPassword": "123456",
  "newPassword": "654321"
}
```

---

## Campos del body

| Campo           | Tipo   | Obligatorio | Descripción                             |
| --------------- | ------ | ----------- | --------------------------------------- |
| currentPassword | string | Sí          | Contraseña actual del usuario           |
| newPassword     | string | Sí          | Nueva contraseña que se desea registrar |

---

## Validaciones implementadas

### Contraseña actual

* Es obligatoria.
* Debe corresponder con la contraseña actual del usuario autenticado.
* Se compara de forma segura mediante `bcryptjs`.

### Nueva contraseña

* Es obligatoria.
* Debe tener mínimo 6 caracteres.
* Debe ser diferente de la contraseña actual.
* Se almacena encriptada mediante `bcryptjs`.

### Seguridad

* La ruta requiere autenticación mediante JWT.
* El identificador del usuario se obtiene desde el token.
* Un usuario no puede cambiar la contraseña de otro usuario mediante este endpoint.
* La contraseña ni su hash se devuelven en la respuesta.

---

## Respuesta exitosa

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

---

## Respuesta si faltan campos

```json
{
  "message": "La contraseña actual y la nueva contraseña son obligatorias"
}
```

---

## Respuesta si la nueva contraseña tiene menos de 6 caracteres

```json
{
  "message": "La nueva contraseña debe tener mínimo 6 caracteres"
}
```

---

## Respuesta si la contraseña actual es incorrecta

```json
{
  "message": "La contraseña actual es incorrecta"
}
```

---

## Respuesta si la nueva contraseña es igual a la actual

```json
{
  "message": "La nueva contraseña debe ser diferente a la contraseña actual"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Token no proporcionado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta si el usuario no existe

```json
{
  "message": "El usuario no existe"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al cambiar la contraseña"
}
```

---

# Perfil autenticado

## Endpoint protegido

```http
GET /api/profile
```

## Descripción

Endpoint privado encargado de obtener la información del usuario autenticado mediante token JWT.

La ruta utiliza middleware JWT para restringir el acceso únicamente a usuarios autenticados.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Respuesta exitosa

```json
{
  "message": "Perfil obtenido correctamente.",
  "user": {
    "id": 5,
    "name": "Marlon",
    "email": "marlon@gmail.com",
    "role": "USER"
  }
}
```

---

# Crear PQR

## Endpoint protegido

```http
POST /api/pqrs
```

## Descripción

Endpoint privado encargado de registrar una nueva PQR asociada al usuario autenticado.

Al crear una PQR, el sistema crea automáticamente un primer mensaje dentro del chat de la solicitud usando la descripción registrada por el usuario.

Si el usuario adjunta una imagen o documento al momento de crear la PQR, ese archivo queda asociado al primer mensaje del chat como evidencia inicial.

---

## Acceso permitido

* USER
* AGENT

---

## Tipos de envío permitidos

Este endpoint puede recibir la información de dos formas:

```txt
application/json
multipart/form-data
```

Se usa `application/json` cuando la PQR se crea sin archivo.

Se usa `multipart/form-data` cuando la PQR se crea con una imagen o documento adjunto.

---

## Body sin archivo

```json
{
  "caseType": "SAP",
  "description": "Esta es una PQR creada desde Postman para probar el módulo."
}
```

---

## Body con archivo

Debe enviarse mediante:

```txt
multipart/form-data
```

| Campo       | Tipo | Obligatorio | Descripción                                       |
| ----------- | ---- | ----------- | ------------------------------------------------- |
| caseType    | Text | Sí          | Tipo de caso de la PQR                            |
| description | Text | Sí          | Descripción de la solicitud                       |
| file        | File | No          | Imagen o documento adjunto como evidencia inicial |

---

## Tipos de caso disponibles

```txt
SAP
BEAS
TERMINAL
CORREO
INTRANET
SOPORTE_EQUIPOS
SOPORTE_RED
MI_PORTAL_SAP
LEGALISAPP
NUEVAS_SOLICITUDES
```

---

## Archivos permitidos como evidencia inicial

Formatos permitidos:

```txt
JPG
JPEG
PNG
WEBP
PDF
```

Tipos MIME permitidos:

```txt
image/jpeg
image/png
image/webp
application/pdf
```

Tamaño máximo permitido:

```txt
5 MB
```

---

## Notificación automática

Cuando un usuario con rol `USER` o `AGENT` crea una nueva PQR, el sistema genera automáticamente una notificación para los usuarios con rol `ADMIN` y `AGENT`.

| Destinatario | Tipo    | Mensaje                                             |
| ------------ | ------- | --------------------------------------------------- |
| ADMIN        | NEW_PQR | Juan Pérez (juan@gmail.com) creó una nueva PQR #10. |
| AGENT        | NEW_PQR | Juan Pérez (juan@gmail.com) creó una nueva PQR #10. |

El usuario que crea la PQR no recibe esta notificación.

---

## Respuesta exitosa sin archivo

```json
{
  "message": "PQR creada correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "Esta es una PQR creada desde Postman para probar el módulo.",
    "status": "PENDIENTE",
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z",
    "userId": 1,
    "assignedToId": null,
    "priority": null,
    "rating": null,
    "ratingComment": null,
    "ratedAt": null,
    "user": {
          "id": 1,
          "name": "goria",
          "email": "yulid@gmail.com",
          "role": "USER"
        }
  }
}
```

---

## Respuesta exitosa con archivo

```json
{
  "message": "PQR creada correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "Esta es una PQR creada desde Postman para probar el módulo.",
    "status": "PENDIENTE",
    "createdAt": "2026-05-12T00:00:00.000Z",
    "updatedAt": "2026-05-12T00:00:00.000Z",
    "userId": 1,
    "assignedToId": null,
    "priority": null,
    "rating": null,
    "ratingComment": null,
    "ratedAt": null,
    "user": {
          "id": 1,
          "name": "goria",
          "email": "yulid@gmail.com",
          "role": "USER"
        }
  }
}
```

---

## Respuesta si `caseType` y `description` no son enviados

```json
{
  "message": "El tipo de caso y la descripción son obligatorios"
}
```

---

## Respuesta si el `caseType` no es válido

```json
{
  "message": "Tipo de caso no válido",
  "allowedCaseTypes": [
    "SAP",
    "BEAS",
    "TERMINAL",
    "CORREO",
    "INTRANET",
    "SOPORTE_EQUIPOS",
    "SOPORTE_RED",
    "MI_PORTAL_SAP",
    "LEGALISAPP",
    "NUEVAS_SOLICITUDES",
  ]
}
```

---

## Respuesta si la descripción supera los 500 caracteres

```json
{
  "message": "La descripción no puede superar los 500 caracteres"
}
```

---

## Respuesta si el archivo no es válido

```json
{
  "message": "Solo se permiten imágenes JPG, PNG, WEBP o documentos PDF"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al crear la PQR"
}
```

---

# Obtener PQR del usuario autenticado

## Endpoint protegido

```http
GET /api/pqrs/my
```

## Descripción

Endpoint privado encargado de obtener las PQR registradas por el usuario autenticado.

---

## Acceso permitido

* USER
* AGENT

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Respuesta exitosa

```json
{
  "message": "PQR obtenidas correctamente",
  "pqrs": [
    {
      "id": 1,
      "caseType": "SAP",
      "description": "Esta es una PQR creada desde Postman para probar el módulo.",
      "status": "PENDIENTE",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z",
      "userId": 1,
      "unreadMessagesCount": 2
    }
  ]
}
```

---

# Obtener todas las PQR

## Endpoint protegido para ADMIN

```http
GET /api/pqrs
```

## Descripción

Endpoint privado encargado de obtener todas las PQR registradas en el sistema.

Esta ruta está protegida por autenticación JWT y validación de rol, por lo tanto, solo puede ser utilizada por usuarios con rol `ADMIN`.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
```

---

## Acceso permitido

* ADMIN

---

## Respuesta exitosa

```json
{
  "message": "Todas las PQR obtenidas correctamente",
  "pqrs": [
    {
      "id": 1,
      "caseType": "SAP",
      "description": "Esta es una PQR creada desde Postman.",
      "status": "PENDIENTE",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z",
      "userId": 1,
      "assignedToId": 2,
      "user": {
        "id": 1,
        "name": "Juan",
        "email": "juan@gmail.com",
        "role": "USER"
      },
      "assignedTo": {
        "id": 2,
        "name": "Agente María",
        "email": "agente@gmail.com",
        "role": "AGENT"
      }
    }
  ]
}
```

---

# Obtener PQR disponibles para AGENT

## Endpoint protegido para ADMIN / AGENT

```http
GET /api/pqrs/available
```

## Descripción

Endpoint privado encargado de obtener las PQR que aún no tienen responsable asignado.

Una PQR disponible debe cumplir con las siguientes condiciones:

* No tener responsable asignado.
* Tener el campo `assignedToId` en `null`.

---

## Header requerido

```http
Authorization: Bearer TOKEN_AGENT
```

---

## Acceso permitido

* ADMIN
* AGENT

---

## Respuesta exitosa

```json
{
  "message": "PQR disponibles obtenidas correctamente",
  "pqrs": [
    {
      "id": 1,
      "caseType": "SAP",
      "description": "No puedo ingresar al sistema.",
      "status": "PENDIENTE",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z",
      "userId": 3,
      "assignedToId": null,
      "user": {
        "id": 3,
        "name": "Juan",
        "email": "juan@gmail.com",
        "role": "USER"
      }
    }
  ]
}
```

---

# Tomar una PQR disponible

## Endpoint protegido para ADMIN / AGENT

```http
PATCH /api/pqrs/:id/take
```

## Ejemplo

```http
PATCH /api/pqrs/1/take
```

## Descripción

Endpoint privado encargado de permitir que un usuario con rol `AGENT` tome una PQR disponible para atenderla.

Cuando el agente toma una PQR, el sistema guarda el id del usuario autenticado en el campo `assignedToId`.

Este endpoint no requiere body, porque el usuario responsable se obtiene desde el token JWT.

---

## Header requerido

```http
Authorization: Bearer TOKEN_AGENT
```

---

## Acceso permitido

* ADMIN
* AGENT

---

## Notificación automática

Cuando un agente toma una PQR disponible, el sistema genera automáticamente dos notificaciones.

| Destinatario         | Tipo      | Mensaje                                                                                  |
| -------------------- | --------- | ---------------------------------------------------------------------------------------- |
| ADMIN                | PQR_TAKEN | Carlos Agente (carlos@gmail.com) tomó la PQR #10 creada por Juan Pérez (juan@gmail.com). |
| creador de la PQR | PQR_TAKEN | Tu solicitud #10 ya fue tomada por un agente.                                            |

Tomar una PQR no cambia automáticamente el estado de la solicitud. Solo se actualiza el campo `assignedToId`.

---

## Respuesta exitosa

```json
{
  "message": "PQR tomada correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "No puedo ingresar al sistema.",
    "status": "PENDIENTE",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z",
    "userId": 3,
    "assignedToId": 5,
    "user": {
      "id": 3,
      "name": "Juan",
      "email": "juan@gmail.com",
      "role": "USER"
    },
    "assignedTo": {
      "id": 5,
      "name": "Carlos Agente",
      "email": "carlos@gmail.com",
      "role": "AGENT"
    }
  }
}
```

---

# Asignar o reasignar una PQR

## Endpoint protegido para ADMIN

```http
PATCH /api/pqrs/:id/assign
```

## Descripción

Endpoint privado encargado de permitir que un usuario con rol `ADMIN` asigne o reasigne una PQR a un agente específico.

Si la PQR no tiene agente asignado, el sistema la asigna por primera vez.

Si la PQR ya tiene un agente asignado, el sistema reemplaza el responsable anterior por el nuevo agente seleccionado.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

---

## Acceso permitido

* ADMIN

---

## Parámetros

| Parámetro | Tipo   | Descripción                             |
| --------- | ------ | --------------------------------------- |
| id        | number | Identificador de la PQR que se asignará |

---

## Body

```json
{
  "agentId": 5
}
```

---

## Campos del body

| Campo   | Tipo   | Obligatorio | Descripción                                  |
| ------- | ------ | ----------- | -------------------------------------------- |
| agentId | number | Sí          | Identificador del agente que recibirá la PQR |

---

## Notificación automática

Cuando un ADMIN asigna o reasigna una PQR, el sistema genera notificaciones según el caso.

### Asignación por primera vez

| Destinatario         | Tipo         | Mensaje                                       |
| -------------------- | ------------ | --------------------------------------------- |
| AGENT asignado       | PQR_ASSIGNED | Se te asignó la PQR #10.                      |
| creador de la PQR | PQR_TAKEN    | Tu solicitud #10 ya fue tomada por un agente. |

### Reasignación a otro agente

| Destinatario   | Tipo           | Mensaje                           |
| -------------- | -------------- | --------------------------------- |
| Nuevo AGENT    | PQR_ASSIGNED   | Se te asignó la PQR #10.          |
| AGENT anterior | PQR_UNASSIGNED | Ya no tienes asignada la PQR #10. |

---

## Respuesta exitosa

```json
{
  "message": "Responsable de la PQR actualizado correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "No puedo ingresar al sistema.",
    "status": "PENDIENTE",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-06-18T00:00:00.000Z",
    "userId": 3,
    "assignedToId": 5,
    "user": {
      "id": 3,
      "name": "Juan",
      "email": "juan@gmail.com",
      "role": "USER"
    },
    "assignedTo": {
      "id": 5,
      "name": "Carlos Agente",
      "email": "carlos@gmail.com",
      "role": "AGENT"
    }
  }
}
```

---

## Respuesta si el id de la PQR no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si no se envía el agente

```json
{
  "message": "El agente es obligatorio"
}
```

---

## Respuesta si el id del agente no es válido

```json
{
  "message": "El id del agente no es válido"
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si el agente no existe

```json
{
  "message": "El agente no existe"
}
```

---

## Respuesta si el usuario seleccionado no es AGENT

```json
{
  "message": "El usuario seleccionado no tiene rol AGENT"
}
```

---

## Respuesta si la PQR está cerrada

```json
{
  "message": "No se puede asignar o reasignar una PQR cerrada"
}
```

---

# Desasignar una PQR (Sin usar)

## Endpoint protegido para ADMIN

```http
PATCH /api/pqrs/:id/unassign
```

## Ejemplo

```http
PATCH /api/pqrs/1/unassign
```

## Descripción

Endpoint privado encargado de permitir que un usuario con rol `ADMIN` quite el agente asignado de una PQR.

Al desasignar una PQR, el campo `assignedToId` queda en `null`, por lo tanto la solicitud vuelve a quedar disponible para ser tomada o asignada nuevamente.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
```

---

## Acceso permitido

* ADMIN

---

## Parámetros

| Parámetro | Tipo   | Descripción                                |
| --------- | ------ | ------------------------------------------ |
| id        | number | Identificador de la PQR que se desasignará |

---

## Body

Este endpoint no requiere body.

---

## Notificación automática

Cuando un ADMIN desasigna una PQR, el sistema notifica al agente que fue retirado.

| Destinatario   | Tipo           | Mensaje                           |
| -------------- | -------------- | --------------------------------- |
| AGENT anterior | PQR_UNASSIGNED | Ya no tienes asignada la PQR #10. |

---

## Respuesta exitosa

```json
{
  "message": "PQR desasignada correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "No puedo ingresar al sistema.",
    "status": "PENDIENTE",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-06-18T00:00:00.000Z",
    "userId": 3,
    "assignedToId": null,
    "user": {
      "id": 3,
      "name": "Juan",
      "email": "juan@gmail.com",
      "role": "USER"
    },
    "assignedTo": null
  }
}
```

---

## Respuesta si el id de la PQR no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si la PQR no tiene agente asignado

```json
{
  "message": "La PQR no tiene agente asignado"
}
```

---

## Respuesta si la PQR está cerrada

```json
{
  "message": "No se puede desasignar una PQR cerrada"
}
```


---

# Obtener PQR asignadas al AGENT autenticado

## Endpoint protegido para ADMIN / AGENT

```http
GET /api/pqrs/assigned/my
```

## Descripción

Endpoint privado encargado de obtener las PQR que fueron tomadas o asignadas al usuario autenticado.

Esta ruta permite que un usuario con rol `AGENT` consulte únicamente las PQR que tiene bajo su responsabilidad.

---

## Header requerido

```http
Authorization: Bearer TOKEN_AGENT
```

---

## Acceso permitido

* ADMIN
* AGENT

---

## Respuesta exitosa

```json
{
  "message": "PQR asignadas obtenidas correctamente",
  "pqrs": [
    {
      "id": 1,
      "caseType": "SAP",
      "description": "No puedo ingresar al sistema.",
      "status": "EN_PROCESO",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z",
      "userId": 3,
      "assignedToId": 5,
      "unreadMessagesCount": 1,
      "user": {
        "id": 3,
        "name": "Juan",
        "email": "juan@gmail.com",
        "role": "USER"
      },
      "assignedTo": {
        "id": 5,
        "name": "Carlos Agente",
        "email": "carlos@gmail.com",
        "role": "AGENT"
      }
    }
  ]
}
```

---

# Cambiar estado de una PQR

## Endpoint protegido para ADMIN / AGENT

```http
PATCH /api/pqrs/:id/status
```

## Ejemplo

```http
PATCH /api/pqrs/1/status
```

## Descripción

Endpoint privado encargado de cambiar el estado de una PQR existente.

Permite actualizar el seguimiento de una solicitud según el proceso de atención.

---

## Header requerido

```http
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

---

## Acceso permitido

* ADMIN
* AGENT

---

## Parámetros

| Parámetro | Tipo   | Descripción                                     |
| --------- | ------ | ----------------------------------------------- |
| id        | number | Identificador de la PQR que se desea actualizar |

---

## Estados permitidos

- PENDIENTE
- EN_PROCESO
- CERRADA

---

## Body

```json
{
  "status": "EN_PROCESO"
}
```

---

## Notificación automática

Cuando una PQR cambia a estado `CERRADA`, el sistema genera automáticamente una notificación para el usuario dueño de la PQR.

| Destinatario         | Tipo       | Mensaje                                                                |
| -------------------- | ---------- | ---------------------------------------------------------------------- |
| creador de la PQR | PQR_CLOSED | Tu solicitud #10 fue cerrada. Por favor califica la atención recibida. |

La notificación solo se genera cuando la PQR pasa a estado `CERRADA`.

Si la PQR ya estaba cerrada y se vuelve a enviar el mismo estado, no se debe crear una notificación repetida.

---

## Respuesta exitosa

```json
{
  "message": "Estado de la PQR actualizado correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "Esta es una PQR creada desde Postman.",
    "status": "EN_PROCESO",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z",
    "userId": 1
  }
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si no se envía estado

```json
{
  "message": "El estado es obligatorio"
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si el estado no es válido

```json
{
  "message": "Estado no válido",
  "allowedStatus": [
    "PENDIENTE",
    "EN_PROCESO",
    "CERRADA"
  ]
}
```

---

# Cambiar prioridad de una PQR

## Endpoint protegido para ADMIN / AGENT

```http
PATCH /api/pqrs/:id/priority
```

## Ejemplo

```http
PATCH /api/pqrs/1/priority
```

## Descripción

Endpoint privado encargado de cambiar la prioridad de una PQR existente.

Esta ruta permite que un usuario con rol `ADMIN` o `AGENT` actualice la prioridad de una PQR, siempre que cumpla con las validaciones correspondientes.

---

## Header requerido

```http
Authorization: Bearer TOKEN_AGENT
Content-Type: application/json
```

---

## Acceso permitido

- ADMIN
- AGENT

---

## Parámetros

| Parámetro | Tipo   | Descripción                                                    |
| --------- | ------ | -------------------------------------------------------------- |
| id        | number | Identificador de la PQR a la que se desea cambiar la prioridad |

---

## Prioridades permitidas

- BAJA
- MEDIA
- ALTA
- URGENTE

---

## Body

```json
{
  "priority": "ALTA"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Prioridad de la PQR actualizada correctamente",
  "pqr": {
    "id": 1,
    "caseType": "SAP",
    "description": "La plataforma presenta errores al cargar los reportes.",
    "status": "EN_PROCESO",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z",
    "userId": 2,
    "assignedToId": 3,
    "priority": "ALTA",
    "rating": null,
    "ratingComment": null,
    "ratedAt": null
  }
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si no se envía prioridad

```json
{
  "message": "La prioridad es obligatoria"
}
```

---

## Respuesta si la prioridad no es válida

```json
{
  "message": "Prioridad no válida",
  "allowedPriorities": [
    "BAJA",
    "MEDIA",
    "ALTA",
    "URGENTE"
  ]
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si la PQR está cerrada

```json
{
  "message": "No se puede cambiar la prioridad de una PQR cerrada"
}
```

---

## Respuesta si el AGENT intenta cambiar una PQR no asignada a él

```json
{
  "message": "Solo puedes cambiar la prioridad de las PQR asignadas a ti"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al actualizar la prioridad de la PQR"
}
```

---

# Obtener historial de mensajes de una PQR

## Endpoint protegido

```http
GET /api/pqrs/:id/messages
```

## Descripción

Endpoint protegido encargado de obtener el historial de mensajes de una PQR.

Este endpoint se utiliza para cargar los mensajes anteriores cuando el usuario abre el detalle de una PQR.

Los mensajes pueden contener solo texto, solo archivos adjuntos o texto acompañado de un archivo.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

* USER creador de la PQR.
* AGENT creador de la PQR.
* AGENT asignado a la PQR.
* ADMIN.

La autorización se basa en la relación del usuario con la PQR. Un `AGENT` puede acceder tanto a una PQR creada por él como a una PQR que tenga asignada.

---

## Parámetros

| Parámetro | Tipo   | Descripción             |
| --------- | ------ | ----------------------- |
| id        | number | Identificador de la PQR |

---

## Respuesta exitosa sin mensajes

```json
{
  "message": "Mensajes obtenidos correctamente",
  "messages": []
}
```

---

## Respuesta exitosa con mensajes de texto

```json
{
  "message": "Mensajes obtenidos correctamente",
  "messages": [
    {
      "id": 1,
      "content": "Hola, este es un mensaje de prueba desde Socket.IO.",
      "createdAt": "2026-06-04T20:30:00.000Z",
      "pqrId": 1,
      "senderId": 2,
      "sender": {
        "id": 2,
        "name": "Juan",
        "email": "juan@gmail.com",
        "role": "USER"
      },
      "attachments": []
    }
  ]
}
```

---

## Respuesta exitosa con mensaje y archivo adjunto

```json
{
  "message": "Mensajes obtenidos correctamente",
  "messages": [
    {
      "id": 93,
      "content": null,
      "createdAt": "2026-06-04T22:41:24.099Z",
      "pqrId": 1,
      "senderId": 2,
      "sender": {
        "id": 2,
        "name": "goria",
        "email": "yulid@gmail.com",
        "role": "USER"
      },
      "attachments": [
        {
          "id": 1,
          "fileName": "1780612884091-volante.pdf",
          "originalName": "Volante.pdf",
          "fileUrl": "/uploads/pqr/1780612884091-volante.pdf",
          "fileType": "DOCUMENT",
          "mimeType": "application/pdf",
          "fileSize": 78205,
          "createdAt": "2026-06-04T22:41:24.099Z",
          "messageId": 93
        }
      ]
    }
  ]
}
```

---

## Notas importantes

El campo `content` puede ser `null` cuando el usuario envía únicamente una imagen o documento.

El campo `attachments` siempre se devuelve como un arreglo. Si el mensaje no tiene archivos, se devuelve vacío.

```json
"attachments": []
```

Si el mensaje tiene un archivo, se devuelve dentro del arreglo `attachments`.

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si el usuario no tiene acceso a la PQR

```json
{
  "message": "No tienes permiso para ver los mensajes de esta PQR"
}
```

---

# Marcar chat de PQR como leído

## Endpoint protegido

```http
PATCH /api/pqrs/:id/messages/read
```

## Descripción

Endpoint protegido encargado de marcar como leído el chat de una PQR para el usuario autenticado.

Este endpoint se utiliza cuando el usuario o agente abre el chat de una PQR. El sistema guarda la fecha y hora de la última lectura.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

* USER creador de la PQR.
* AGENT creador de la PQR.
* AGENT asignado a la PQR.
* ADMIN.

La autorización se basa en la relación del usuario con la PQR. Un `AGENT` puede acceder tanto a una PQR creada por él como a una PQR que tenga asignada.

---

## Parámetros

| Parámetro | Tipo   | Descripción             |
| --------- | ------ | ----------------------- |
| id        | number | Identificador de la PQR |

---

## Respuesta exitosa

```json
{
  "message": "Chat marcado como leído correctamente"
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
   "message": "Usuario no autenticado"
}
```

---

##  Respuesta si la PQR no existe

```json
{
   "message": "La PQR no existe"
}
```

---

## Respuesta si el usuario no tiene acceso a la PQR

```json
{
   "message": "No tienes permiso para marcar como leído el chat de esta PQR"
}
```

---

# Enviar mensaje con archivo adjunto en una PQR

## Endpoint protegido

```http
POST /api/pqrs/:id/messages/attachment
```

## Descripción

Endpoint protegido encargado de enviar un mensaje con archivo adjunto dentro del chat de una PQR.

Este endpoint permite enviar imágenes o documentos asociados a un mensaje del chat.

El mensaje puede contener:

```txt
Solo archivo
Solo texto
Texto + archivo
```

Cuando se envía solo un archivo, el campo `content` se guarda como `null`.

---

## Tipo de envío requerido

Este endpoint no recibe datos en formato JSON.

Debe enviarse mediante:

```txt
multipart/form-data
```

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

No se debe agregar manualmente el header `Content-Type`, ya que Postman o el frontend lo generan automáticamente al usar `multipart/form-data`.

---

## Acceso permitido

* USER creador de la PQR.
* AGENT creador de la PQR.
* AGENT asignado a la PQR.
* ADMIN.

La autorización se basa en la relación del usuario con la PQR. Un `AGENT` puede acceder tanto a una PQR creada por él como a una PQR que tenga asignada.

---

## Parámetros

| Parámetro | Tipo   | Descripción             |
| --------- | ------ | ----------------------- |
| id        | number | Identificador de la PQR |

---

## Campos del form-data

| Campo   | Tipo | Obligatorio | Descripción                               |
| ------- | ---- | ----------- | ----------------------------------------- |
| file    | File | Sí          | Imagen o documento que se desea adjuntar. |
| content | Text | No          | Mensaje opcional que acompaña al archivo. |

---

## Tipos de archivo permitidos

```txt
image/jpeg
image/png
image/webp
application/pdf
```

Formatos permitidos:

```txt
JPG
PNG
WEBP
PDF
```

---

## Tamaño máximo permitido

```txt
5 MB
```

---

## Ejemplo en Postman

```txt
Método: POST
URL: http://localhost:4000/api/pqrs/1/messages/attachment

Headers:
Authorization: Bearer TOKEN

Body:
form-data
```

| Key     | Type | Value                       |
| ------- | ---- | --------------------------- |
| file    | File | evidencia.png o soporte.pdf |
| content | Text | Adjunto evidencia del caso. |

---

## Respuesta exitosa con documento

```json
{
  "message": "Mensaje con archivo enviado correctamente",
  "pqrMessage": {
    "id": 93,
    "content": null,
    "createdAt": "2026-06-04T22:41:24.099Z",
    "pqrId": 1,
    "senderId": 2,
    "sender": {
      "id": 2,
      "name": "goria",
      "email": "yulid@gmail.com",
      "role": "USER"
    },
    "attachments": [
      {
        "id": 1,
        "fileName": "1780612884091-volante.pdf",
        "originalName": "Volante.pdf",
        "fileUrl": "/uploads/pqr/1780612884091-volante.pdf",
        "fileType": "DOCUMENT",
        "mimeType": "application/pdf",
        "fileSize": 78205,
        "createdAt": "2026-06-04T22:41:24.099Z",
        "messageId": 93
      }
    ]
  }
}
```

---

## Respuesta exitosa con imagen

```json
{
  "message": "Mensaje con archivo enviado correctamente",
  "pqrMessage": {
    "id": 94,
    "content": "Adjunto evidencia del error.",
    "createdAt": "2026-06-04T22:45:00.000Z",
    "pqrId": 1,
    "senderId": 2,
    "sender": {
      "id": 2,
      "name": "goria",
      "email": "yulid@gmail.com",
      "role": "USER"
    },
    "attachments": [
      {
        "id": 2,
        "fileName": "1780614180957-github.png",
        "originalName": "github.png",
        "fileUrl": "/uploads/pqr/1780614180957-github.png",
        "fileType": "IMAGE",
        "mimeType": "image/png",
        "fileSize": 120000,
        "createdAt": "2026-06-04T22:45:00.000Z",
        "messageId": 94
      }
    ]
  }
}
```

---

## Respuesta si no se envía archivo

```json
{
  "message": "El archivo es obligatorio"
}
```

---

## Respuesta si el archivo no es válido

```json
{
  "message": "Solo se permiten imágenes JPG, PNG, WEBP o documentos PDF"
}
```

---

## Respuesta si el mensaje supera los 500 caracteres

```json
{
  "message": "El mensaje no puede superar los 500 caracteres"
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si la PQR está cerrada

```json
{
  "message": "No se pueden enviar mensajes en una PQR cerrada"
}
```

---

## Respuesta si el usuario no tiene acceso a la PQR

```json
{
  "message": "No tienes permiso para enviar mensajes en esta PQR"
}
```

---

# Calificar una PQR cerrada

## Endpoint protegido para USER / AGENT

```http
PATCH /api/pqrs/:id/rate
```

## Ejemplo

```http
PATCH /api/pqrs/1/rate
```

## Descripción

Endpoint privado encargado de permitir que el creador de una PQR la califique, siempre que la PQR se encuentre en estado `CERRADA`.

La autorización se valida por propiedad (`pqr.userId === usuarioAutenticado.id`) y no únicamente por rol. Por esta razón, tanto un `USER` como un `AGENT` pueden calificar una PQR creada por ellos. Un `AGENT` asignado a una PQR ajena no puede calificarla por el solo hecho de estar asignado.

Esta ruta permite registrar una calificación del servicio recibido y, de manera opcional, un comentario sobre la atención brindada.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

* USER creador de la PQR.
* AGENT creador de la PQR.

No tienen permiso para calificar:

* AGENT asignado que no sea el creador.
* ADMIN que no sea el creador.
* Cualquier otro usuario que no sea propietario de la PQR.

---

## Parámetros

| Parámetro | Tipo   | Descripción                                    |
| --------- | ------ | ---------------------------------------------- |
| id        | number | Identificador de la PQR que se desea calificar |

---

## Body

```json
{
  "rating": 5,
  "ratingComment": "La atención fue rápida y clara."
}
```

---

## Notificación automática

Cuando un usuario califica una PQR cerrada, el sistema genera automáticamente una notificación para los usuarios con rol `ADMIN` y para el `AGENT` asignado a la PQR.

| Destinatario   | Tipo      | Mensaje                                                          |
| -------------- | --------- | ---------------------------------------------------------------- |
| ADMIN          | PQR_RATED | Juan Pérez (juan@gmail.com) calificó la PQR #10 con 5 estrellas. |
| AGENT asignado | PQR_RATED | Juan Pérez (juan@gmail.com) calificó la PQR #10 con 5 estrellas. |

Si la PQR no tiene agente asignado, la notificación solo se genera para los usuarios con rol `ADMIN`.

---

## Campos del body

| Campo         | Tipo   | Obligatorio | Descripción                                                           |
| ------------- | ------ | ----------- | --------------------------------------------------------------------- |
| rating        | number | Sí          | Calificación asignada por el usuario. Debe estar entre 1 y 5          |
| ratingComment | string | No          | Comentario opcional sobre la atención recibida. Máximo 300 caracteres |

---

## Respuesta exitosa

```json
{
  "message": "PQR calificada correctamente",
  "pqr": {
    "id": 4,
    "caseType": "OTRO",
    "description": "La plataforma muestra errores constantes durante el proceso de registro.",
    "status": "CERRADA",
    "createdAt": "2026-05-28T10:30:00.000Z",
    "updatedAt": "2026-05-28T22:19:48.774Z",
    "userId": 2,
    "assignedToId": null,
    "priority": "MEDIA",
    "rating": 5,
    "ratingComment": "La atención fue rápida y clara.",
    "ratedAt": "2026-05-28T22:19:48.773Z"
  }
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la PQR no es válido"
}
```

---

## Respuesta si no se envía calificación

```json
{
  "message": "La calificación es obligatoria"
}
```

---

## Respuesta si la calificación no está entre 1 y 5

```json
{
  "message": "La calificación debe estar entre 1 y 5"
}
```

---

## Respuesta si el comentario supera los 300 caracteres

```json
{
  "message": "El comentario no puede superar los 300 caracteres"
}
```

---

## Respuesta si la PQR no existe

```json
{
  "message": "La PQR no existe"
}
```

---

## Respuesta si la PQR no pertenece al usuario autenticado

```json
{
  "message": "Solo puedes calificar las PQR creadas por ti"
}
```

---

## Respuesta si la PQR no está cerrada

```json
{
  "message": "Solo puedes calificar una PQR cerrada"
}
```

---

## Respuesta si la PQR ya fue calificada

```json
{
  "message": "Esta PQR ya fue calificada"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al calificar la PQR"
}
```

---

# Notificaciones

El backend cuenta con un módulo de notificaciones internas para informar a los usuarios sobre acciones importantes de los módulos **PQR** y **Talento Humano**.

Las notificaciones se guardan en la base de datos, quedan asociadas al usuario destinatario y, cuando Socket.IO está disponible, también se emiten en tiempo real. Cada usuario autenticado puede consultar únicamente las notificaciones asociadas a su cuenta.

---

## Tipos de notificación

### PQR

```txt
NEW_PQR
STATUS_CHANGE
PRIORITY_CHANGE
PQR_CLOSED
PQR_RATED
PQR_TAKEN
PQR_ASSIGNED
PQR_UNASSIGNED
```

| Tipo | Descripción |
| ---- | ----------- |
| `NEW_PQR` | Se genera cuando un usuario crea una nueva PQR. |
| `STATUS_CHANGE` | Se reserva para notificar cambios de estado de una PQR. |
| `PRIORITY_CHANGE` | Se reserva para notificar cambios de prioridad de una PQR. |
| `PQR_CLOSED` | Se genera cuando una PQR cambia a estado `CERRADA`. |
| `PQR_RATED` | Se genera cuando un usuario califica una PQR cerrada. |
| `PQR_TAKEN` | Se genera cuando un agente toma una PQR o cuando se asigna por primera vez al usuario dueño. |
| `PQR_ASSIGNED` | Se genera cuando un `ADMIN` asigna o reasigna una PQR a un agente. |
| `PQR_UNASSIGNED` | Se genera cuando un `ADMIN` retira una PQR a un agente. |

### Talento Humano

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
REQUISITION_CANDIDATES_PRESELECTED
CANDIDATE_TECHNICAL_EVALUATION_PENDING
CANDIDATE_TECHNICAL_EVALUATION_CONFIRMED
```

| Tipo | Descripción |
| ---- | ----------- |
| `REQUISITION_PENDING_APPROVAL` | Indica que una requisición requiere aprobación del usuario correspondiente. |
| `REQUISITION_APPROVED` | Representa la aprobación de una requisición cuando aplica dentro del flujo. |
| `REQUISITION_REJECTED` | Informa el rechazo o cancelación de una requisición. |
| `HIRING_CONFIRMATION_PENDING` | Informa que existe una confirmación de contratación pendiente dentro del flujo de Talento Humano. |
| `HIRING_CONFIRMATION_APPROVED` | Informa que la confirmación o requisición fue aprobada completamente. |
| `HIRING_CONFIRMATION_REJECTED` | Informa el rechazo o cancelación de una confirmación de contratación. |
| `REQUISITION_CANDIDATES_PENDING` | Informa al Auxiliar de Talento Humano que debe iniciar el cargue de candidatos. |
| `REQUISITION_CANDIDATES_WITHOUT_ASSISTANT` | Informa que no existe un Auxiliar de Talento Humano activo para realizar el cargue. |
| `REQUISITION_CANDIDATES_CLOSED` | Informa al creador de la requisición que el cargue de candidatos fue cerrado y está disponible para consulta. |
| `REQUISITION_CANDIDATES_REOPENED` | Informa al creador de la requisición que el cargue de candidatos fue reabierto. |
| `REQUISITION_CANDIDATES_PRESELECTED` | Informa al Auxiliar de Talento Humano activo que el creador confirmó una nueva preselección de candidatos. |
| `CANDIDATE_TECHNICAL_EVALUATION_PENDING` | Informa al creador de la requisición que la Evaluación Técnica tiene ambas calificaciones y requiere su confirmación. |
| `CANDIDATE_TECHNICAL_EVALUATION_CONFIRMED` | Informa al usuario que diligenció las calificaciones que el creador confirmó la Evaluación Técnica y comunica si el postulante continúa o no. |

---

# Obtener notificaciones del usuario autenticado

## Endpoint protegido

```http
GET /api/notifications
```

## Descripción

Endpoint encargado de obtener todas las notificaciones del usuario autenticado.

Cada usuario solo puede consultar sus propias notificaciones.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Respuesta exitosa

```json
{
  "message": "Notificaciones obtenidas correctamente.",
  "notifications": [
    {
      "id": 1,
      "title": "Nueva PQR creada",
      "message": "Juan Pérez (juan@gmail.com) creó una nueva PQR #10.",
      "type": "NEW_PQR",
      "isRead": false,
      "userId": 2,
      "pqrId": 10,
      "createdAt": "2026-06-03T15:30:00.000Z"
    }
  ]
}
```

---

## Respuesta si no tiene notificaciones

```json
{
  "message": "Notificaciones obtenidas correctamente.",
  "notifications": []
}
```

---

# Obtener cantidad de notificaciones no leídas

## Endpoint protegido

```http
GET /api/notifications/unread-count
```

## Descripción

Endpoint encargado de obtener la cantidad de notificaciones no leídas del usuario autenticado.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Respuesta exitosa

```json
{
  "message": "Cantidad de notificaciones no leídas obtenida correctamente.",
  "count": 3
}
```

---

## Respuesta si no tiene notificaciones no leídas

```json
{
  "message": "Cantidad de notificaciones no leídas obtenida correctamente.",
  "count": 0
}
```

---

# Marcar una notificación como leída

## Endpoint protegido

```http
PATCH /api/notifications/:id/read
```

## Ejemplo

```http
PATCH /api/notifications/1/read
```

## Descripción

Endpoint encargado de marcar una notificación específica como leída.

La notificación solo puede ser marcada como leída si pertenece al usuario autenticado.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Parámetros

| Parámetro | Tipo   | Descripción                                                      |
| --------- | ------ | ---------------------------------------------------------------- |
| id        | number | Identificador de la notificación que se desea marcar como leída. |

---

## Respuesta exitosa

```json
{
  "message": "Notificación marcada como leída."
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la notificación no es válido."
}
```

---

## Respuesta si la notificación no existe o no pertenece al usuario

```json
{
  "message": "La notificación no existe."
}
```

---

# Marcar todas las notificaciones como leídas

## Endpoint protegido

```http
PATCH /api/notifications/read-all
```

## Descripción

Endpoint encargado de marcar como leídas todas las notificaciones pendientes del usuario autenticado.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Respuesta exitosa

```json
{
  "message": "Todas las notificaciones fueron marcadas como leídas.",
  "updatedCount": 4
}
```

---

## Respuesta si no tiene notificaciones pendientes

```json
{
  "message": "No tienes notificaciones pendientes por leer.",
  "updatedCount": 0
}
```

---

# Obtener ciudades activas

## Endpoint protegido

```http
GET /api/common/cities
```

## Descripción

Endpoint privado encargado de obtener las ciudades activas registradas en el sistema.

Este endpoint pertenece al módulo común del proyecto, ya que las ciudades son información global y pueden ser utilizadas por diferentes módulos.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Respuesta exitosa

```json
{
  "message": "Ciudades obtenidas correctamente",
  "cities": [
    {
      "id": 1,
      "name": "Barranquilla"
    },
    {
      "id": 2,
      "name": "Bogotá"
    }
  ]
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Token no proporcionado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener las ciudades"
}
```

---

# Obtener tipos de identificación activos

## Endpoint protegido

```http
GET /api/common/identification-types
```

## Descripción

Endpoint privado encargado de obtener los tipos de identificación activos registrados en el sistema.

Este catálogo pertenece al módulo común porque puede ser reutilizado por diferentes procesos que requieran identificar personas.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Respuesta exitosa

```json
{
  "message": "Tipos de identificación obtenidos correctamente",
  "identificationTypes": [
    {
      "id": 1,
      "code": "CC",
      "name": "Cédula de ciudadanía"
    },
    {
      "id": 2,
      "code": "CE",
      "name": "Cédula de extranjería"
    }
  ]
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Token no proporcionado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener los tipos de identificación"
}
```

---

# Subir firma del usuario autenticado

## Endpoint protegido

```http
PATCH /api/users/signature
```

## Descripción

Endpoint privado encargado de registrar la firma del usuario autenticado.

La firma se almacena como una imagen en el backend y la ruta del archivo queda guardada en el campo `signatureUrl` del usuario.

Esta firma será utilizada en los formatos y detalles de requisición cuando el usuario apruebe, rechace o cancele un paso del flujo.

---

## Tipo de envío requerido

Este endpoint no recibe datos en formato JSON.

Debe enviarse mediante:

```txt
multipart/form-data
```

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Campo requerido

| Campo     | Tipo | Obligatorio | Descripción                    |
| --------- | ---- | ----------- | ------------------------------ |
| signature | File | Sí          | Imagen de la firma del usuario |

---

## Archivos permitidos

Formatos permitidos:

```txt
JPG
JPEG
PNG
WEBP
```

Tipos MIME permitidos:

```txt
image/jpeg
image/png
image/webp
```

Tamaño máximo permitido:

```txt
2 MB
```

---

## Ejemplo en Postman

```txt
Método: PATCH
URL: http://localhost:4000/api/users/signature

Headers:
Authorization: Bearer TOKEN

Body:
form-data
```

| Key       | Type | Value     |
| --------- | ---- | --------- |
| signature | File | firma.png |

---

## Respuesta exitosa

```json
{
  "message": "Firma registrada correctamente",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@gmail.com",
    "role": "USER",
    "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
  }
}
```

---

## Respuesta si no se envía archivo

```json
{
  "message": "Debes seleccionar una imagen para la firma"
}
```

---

## Respuesta si el usuario ya tiene firma registrada

```json
{
  "message": "El usuario ya tiene una firma registrada"
}
```

---

## Respuesta si el usuario no existe

```json
{
  "message": "El usuario no existe"
}
```

---

---

## Respuesta si el archivo no es válido

```json
{
  "message": "Solo se permiten imágenes JPG, PNG o WEBP"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```
---

## Respuesta en caso de error

```json
{
  "message": "Error al subir la firma"
}
```

---

# Obtener departamentos o áreas activas de Talento Humano

## Endpoint protegido

```http
GET /api/human-talent/departments
```

## Descripción

Endpoint privado encargado de obtener los departamentos o áreas activas disponibles para crear una requisición de personal.

El resultado depende del usuario autenticado y de sus cargos activos dentro de la estructura organizacional.

Reglas principales:

* Si el usuario es `ADMIN`, puede consultar todas las áreas activas.
* Si el usuario tiene un cargo responsable de un departamento, puede consultar ese departamento y sus áreas hijas.
* Si el usuario no tiene cargos activos o no es responsable de ningún departamento, se devuelve un arreglo vacío.

Este endpoint se utiliza para cargar el listado de los departamentos o áreas solicitantes en el formulario de requisición.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Respuesta exitosa

```json
{
  "message": "Áreas obtenidas correctamente",
  "departments": [
    {
      "id": 13,
      "code": "GERENCIA_FINANCIERA",
      "name": "Gerencia Financiera",
      "parentDepartmentId": null
    },
    {
      "id": 14,
      "code": "CONTABILIDAD",
      "name": "Contabilidad",
      "parentDepartmentId": 13
    }
  ]
}
```

---

## Respuesta si no tiene áreas disponibles

```json
{
  "message": "Áreas obtenidas correctamente",
  "departments": []
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener las áreas"
}
```

---

# Obtener perfiles de cargo activos

## Endpoint protegido

```http
GET /api/position-management/position-profiles
```

## Ejemplo con departamento seleccionado

```http
GET /api/position-management/position-profiles?departmentId=13
```

## Descripción

Endpoint privado encargado de obtener los perfiles de cargo activos disponibles en el módulo de Gestión de Cargos.

Este endpoint también puede ser utilizado por otros módulos, como Talento Humano, para seleccionar cargos en procesos de requisición de personal.

Este endpoint recibe el parámetro `departmentId` por query param.

Cuando se envía `departmentId`, el sistema consulta los cargos activos asociados a ese departamento y a sus áreas hijas, respetando los permisos del usuario autenticado.

Reglas principales:

* Si el usuario es `ADMIN`, puede consultar cargos de cualquier departamento activo.
* Si el usuario no es `ADMIN`, solo puede consultar cargos de los departamentos donde sus cargos activos tengan responsabilidad.
* Si no se envía `departmentId`, se devuelve un arreglo vacío.
* Si el usuario no tiene permiso sobre el departamento seleccionado, se devuelve un arreglo vacío.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

---

## Query params

| Parámetro    | Tipo   | Obligatorio | Descripción                                      |
| ------------ | ------ | ----------- | ------------------------------------------------ |
| departmentId | number | Sí          | Identificador del departamento o área consultada |

---

## Respuesta exitosa

```json
{
  "message": "Perfiles de cargo obtenidos correctamente",
  "positionProfiles": [
    {
      "id": 13,
      "code": "GERENTE_FINANCIERO",
      "name": "Gerente Financiero",
      "homeDepartmentId": 13
    },
    {
      "id": 14,
      "code": "JEFE_CONTABILIDAD",
      "name": "Jefe de Contabilidad",
      "homeDepartmentId": 14
    }
  ]
}
```

---

## Respuesta si no se envía departamento

```json
{
  "message": "Perfiles de cargo obtenidos correctamente",
  "positionProfiles": []
}
```

---

## Respuesta si el id del departamento no es válido

```json
{
  "message": "El id del departamento no es válido"
}
```

---

## Respuesta si el usuario no tiene permisos sobre el departamento

```json
{
  "message": "Perfiles de cargo obtenidos correctamente",
  "positionProfiles": []
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener los perfiles de cargo"
}
```

---

# Obtener revisión vigente de un perfil de cargo

## Endpoint protegido

```http
GET /api/position-management/position-profiles/:positionProfileId/current-revision
```

## Ejemplo

```http
GET /api/position-management/position-profiles/13/current-revision
```

## Descripción

Endpoint privado encargado de obtener la revisión vigente asociada con un perfil de cargo activo.

Este endpoint se utiliza desde el formulario de creación de requisiciones de personal para consultar automáticamente la revisión vigente del cargo seleccionado.

Cuando el perfil de cargo no tiene una revisión en estado `VIGENTE`, el endpoint responde correctamente con el valor `revision: null`.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
Usuario autenticado
```

---

## Parámetros

| Parámetro         | Tipo   | Descripción                       |
| ----------------- | ------ | --------------------------------- |
| positionProfileId | number | Identificador del perfil de cargo |

---

## Respuesta exitosa con revisión vigente

```json
{
  "message": "Revisión vigente obtenida correctamente",
  "revision": {
    "id": 3,
    "positionProfileId": 13,
    "revisionNumber": 2,
    "revisionDate": "2026-08-05T00:00:00.000Z",
    "status": "VIGENTE",
    "changeObservation": "Actualización de los requisitos del cargo",
    "updatedAt": "2026-08-05T15:00:00.000Z"
  }
}
```

---

## Respuesta cuando no existe revisión vigente

```json
{
  "message": "El perfil de cargo no tiene una revisión vigente",
  "revision": null
}
```

---

## Respuesta si el perfil no existe o está inactivo

```json
{
  "message": "El perfil de cargo no existe o se encuentra inactivo"
}
```

---

## Respuesta si el identificador no es válido

```json
{
  "message": "El id del perfil de cargo no es válido"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener la revisión vigente del perfil de cargo"
}
```

---

# Gestión de Cargos

## Gestión de revisiones de perfiles de cargo

El backend cuenta con un módulo encargado de administrar las revisiones de los perfiles de cargo.

Cada perfil de cargo puede conservar un historial de revisiones, permitiendo diferenciar entre versiones en construcción, versiones vigentes y versiones históricas.

---

## Estados de una revisión

```txt
BORRADOR
VIGENTE
OBSOLETA
```

| Estado   | Descripción                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| BORRADOR | Revisión en construcción. Puede modificarse, publicarse o eliminarse lógicamente. |
| VIGENTE  | Revisión actualmente activa para el perfil de cargo.                              |
| OBSOLETA | Revisión anterior que se conserva como parte del historial.                       |

---

## Reglas principales

* Una nueva revisión siempre se crea en estado `BORRADOR`.
* Solo puede existir una revisión activa en estado `BORRADOR` por perfil de cargo.
* El número de revisión se genera automáticamente de forma consecutiva.
* Los números de revisiones eliminadas no se reutilizan.
* Solo las revisiones en estado `BORRADOR` pueden modificarse o eliminarse.
* Solo una revisión en estado `BORRADOR` puede publicarse.
* Al publicar una revisión, la revisión `VIGENTE` anterior pasa automáticamente a estado `OBSOLETA`.
* Solo puede existir una revisión `VIGENTE` por perfil de cargo.
* Las revisiones se eliminan de forma lógica mediante el campo `deletedAt`.
* Para publicar una revisión, todos los requisitos fijos deben tener al menos una descripción activa.

---

## Requisitos fijos del perfil de cargo

```txt
Formación académica
Experiencia
Conocimientos específicos
```

Cada requisito puede contener varias descripciones dentro de una misma revisión.

Las descripciones se muestran en orden de creación y también utilizan eliminación lógica.

---

# Crear revisión de perfil de cargo

## Endpoint protegido

```http
POST /api/position-management/position-profiles/:positionProfileId/revisions
```

## Ejemplo

```http
POST /api/position-management/position-profiles/13/revisions
```

## Descripción

Endpoint privado encargado de crear una nueva revisión en estado `BORRADOR` para un perfil de cargo activo.

El número de revisión se genera automáticamente tomando el último número registrado para el perfil de cargo.

El campo `changeObservation` es opcional y permite indicar el motivo por el cual se crea la nueva revisión.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado
```

Actualmente la ruta utiliza `authMiddleware`.

---

## Parámetros

| Parámetro         | Tipo   | Descripción                       |
| ----------------- | ------ | --------------------------------- |
| positionProfileId | number | Identificador del perfil de cargo |

---

## Body

```json
{
  "changeObservation": "Actualización de los requisitos del cargo"
}
```

También puede enviarse sin observación:

```json
{}
```

---

## Campos del body

| Campo             | Tipo        | Obligatorio | Descripción                                                    |
| ----------------- | ----------- | ----------- | -------------------------------------------------------------- |
| changeObservation | string/null | No          | Motivo o descripción general del cambio. Máximo 500 caracteres |

---

## Respuesta exitosa

```json
{
  "message": "Revisión del perfil de cargo creada correctamente",
  "revision": {
    "id": 1,
    "positionProfileId": 13,
    "revisionNumber": 1,
    "revisionDate": "2026-08-03T17:30:00.000Z",
    "status": "BORRADOR",
    "changeObservation": "Actualización de los requisitos del cargo",
    "deletedAt": null,
    "updatedAt": "2026-08-03T17:30:00.000Z",
    "positionProfile": {
      "id": 13,
      "code": "GERENTE_FINANCIERO",
      "name": "Gerente Financiero",
      "homeDepartmentId": 13
    }
  }
}
```

---

## Respuesta si el perfil no existe o está inactivo

```json
{
  "message": "El perfil de cargo no existe o se encuentra inactivo"
}
```

---

## Respuesta si ya existe un borrador

```json
{
  "message": "El perfil de cargo ya tiene una revisión activa en estado borrador"
}
```

---

## Respuesta si la observación supera los 500 caracteres

```json
{
  "message": "La observación del cambio no puede superar los 500 caracteres"
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id del perfil de cargo no es válido"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al crear la revisión del perfil de cargo"
}
```

---

# Obtener revisiones de un perfil de cargo

## Endpoint protegido

```http
GET /api/position-management/position-profiles/:positionProfileId/revisions
```

## Ejemplo

```http
GET /api/position-management/position-profiles/13/revisions
```

## Descripción

Endpoint privado encargado de obtener todas las revisiones activas de un perfil de cargo.

Las revisiones eliminadas lógicamente no se incluyen.

El resultado se ordena desde el número de revisión más reciente hasta el más antiguo.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
Usuario autenticado
```

---

## Respuesta exitosa

```json
{
  "message": "Revisiones del perfil de cargo obtenidas correctamente",
  "positionProfile": {
    "id": 13,
    "code": "GERENTE_FINANCIERO",
    "name": "Gerente Financiero",
    "isActive": true,
    "homeDepartmentId": 13
  },
  "revisions": [
    {
      "id": 2,
      "positionProfileId": 13,
      "revisionNumber": 2,
      "revisionDate": "2026-08-04T12:00:00.000Z",
      "status": "BORRADOR",
      "changeObservation": "Actualización de experiencia",
      "updatedAt": "2026-08-04T12:00:00.000Z"
    },
    {
      "id": 1,
      "positionProfileId": 13,
      "revisionNumber": 1,
      "revisionDate": "2026-08-03T17:30:00.000Z",
      "status": "VIGENTE",
      "changeObservation": "Creación inicial",
      "updatedAt": "2026-08-03T18:00:00.000Z"
    }
  ]
}
```

---

## Respuesta si no existen revisiones

```json
{
  "message": "Revisiones del perfil de cargo obtenidas correctamente",
  "positionProfile": {
    "id": 13,
    "code": "GERENTE_FINANCIERO",
    "name": "Gerente Financiero",
    "isActive": true,
    "homeDepartmentId": 13
  },
  "revisions": []
}
```

---

## Respuesta si el perfil no existe

```json
{
  "message": "El perfil de cargo no existe"
}
```

---

## Respuesta si el id no es válido

```json
{
  "message": "El id del perfil de cargo no es válido"
}
```

---

# Obtener detalle de una revisión

## Endpoint protegido

```http
GET /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId
```

## Ejemplo

```http
GET /api/position-management/position-profiles/13/revisions/1
```

## Descripción

Endpoint privado encargado de obtener el detalle de una revisión de perfil de cargo.

La respuesta incluye:

* Información general de la revisión.
* Información del perfil de cargo.
* Requisitos fijos.
* Descripciones activas registradas en cada requisito.

Las descripciones eliminadas lógicamente no se incluyen.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
Usuario autenticado
```

---

## Respuesta exitosa

```json
{
  "message": "Detalle de la revisión obtenido correctamente",
  "revision": {
    "id": 1,
    "positionProfileId": 13,
    "revisionNumber": 1,
    "revisionDate": "2026-08-03T17:30:00.000Z",
    "status": "BORRADOR",
    "changeObservation": "Creación inicial del perfil",
    "updatedAt": "2026-08-03T17:30:00.000Z",
    "positionProfile": {
      "id": 13,
      "code": "GERENTE_FINANCIERO",
      "name": "Gerente Financiero",
      "isActive": true,
      "homeDepartmentId": 13
    },
    "requirements": [
      {
        "id": 1,
        "name": "Formación académica",
        "descriptions": [
          {
            "id": 1,
            "revisionId": 1,
            "requirementId": 1,
            "description": "Profesional en Contaduría Pública.",
            "createdAt": "2026-08-03T17:40:00.000Z",
            "updatedAt": "2026-08-03T17:40:00.000Z"
          }
        ]
      },
      {
        "id": 2,
        "name": "Experiencia",
        "descriptions": []
      },
      {
        "id": 3,
        "name": "Conocimientos específicos",
        "descriptions": []
      }
    ]
  }
}
```

---

## Respuesta si la revisión no existe

```json
{
  "message": "La revisión del perfil de cargo no existe"
}
```

---

## Respuesta si los identificadores no son válidos

```json
{
  "message": "El id de la revisión no es válido"
}
```

---

# Actualizar observación de una revisión

## Endpoint protegido

```http
PATCH /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId
```

## Ejemplo

```http
PATCH /api/position-management/position-profiles/13/revisions/1
```

## Descripción

Endpoint privado encargado de actualizar la observación general de una revisión.

Solo se permite actualizar revisiones que se encuentren en estado `BORRADOR`.

Para eliminar la observación se puede enviar el valor `null`.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Body

```json
{
  "changeObservation": "Se actualizaron los requisitos del cargo"
}
```

Para eliminar la observación:

```json
{
  "changeObservation": null
}
```

---

## Respuesta exitosa

```json
{
  "message": "Revisión del perfil de cargo actualizada correctamente",
  "revision": {
    "id": 1,
    "positionProfileId": 13,
    "revisionNumber": 1,
    "revisionDate": "2026-08-03T17:30:00.000Z",
    "status": "BORRADOR",
    "changeObservation": "Se actualizaron los requisitos del cargo",
    "deletedAt": null,
    "updatedAt": "2026-08-04T13:00:00.000Z",
    "positionProfile": {
      "id": 13,
      "code": "GERENTE_FINANCIERO",
      "name": "Gerente Financiero",
      "homeDepartmentId": 13
    }
  }
}
```

---

## Respuesta si no se envía la observación

```json
{
  "message": "Debe enviar la observación del cambio"
}
```

---

## Respuesta si la revisión no está en borrador

```json
{
  "message": "Solo se puede actualizar una revisión en estado BORRADOR"
}
```

---

## Respuesta si la revisión no existe

```json
{
  "message": "La revisión del perfil de cargo no existe"
}
```

---

# Eliminar revisión en borrador

## Endpoint protegido

```http
DELETE /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId
```

## Ejemplo

```http
DELETE /api/position-management/position-profiles/13/revisions/1
```

## Descripción

Endpoint privado encargado de eliminar lógicamente una revisión.

La eliminación solo se permite cuando la revisión se encuentra en estado `BORRADOR`.

Las revisiones en estado `VIGENTE` u `OBSOLETA` no pueden eliminarse.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Body

Este endpoint no requiere body.

---

## Respuesta exitosa

```json
{
  "message": "Revisión del perfil de cargo eliminada correctamente",
  "revision": {
    "id": 1,
    "positionProfileId": 13,
    "revisionNumber": 1,
    "revisionDate": "2026-08-03T17:30:00.000Z",
    "status": "BORRADOR",
    "changeObservation": "Creación inicial",
    "deletedAt": "2026-08-04T13:30:00.000Z",
    "updatedAt": "2026-08-04T13:30:00.000Z",
    "positionProfile": {
      "id": 13,
      "code": "GERENTE_FINANCIERO",
      "name": "Gerente Financiero",
      "homeDepartmentId": 13
    }
  }
}
```

---

## Respuesta si la revisión no está en borrador

```json
{
  "message": "Solo se puede eliminar una revisión en estado BORRADOR"
}
```

---

## Respuesta si la revisión no existe

```json
{
  "message": "La revisión del perfil de cargo no existe"
}
```

---

# Publicar revisión de perfil de cargo

## Endpoint protegido

```http
PATCH /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/publish
```

## Ejemplo

```http
PATCH /api/position-management/position-profiles/13/revisions/1/publish
```

## Descripción

Endpoint privado encargado de publicar una revisión en estado `BORRADOR`.

Antes de publicar, el sistema valida que todos los requisitos fijos tengan al menos una descripción activa.

Cuando la publicación se completa:

* La revisión `VIGENTE` anterior pasa a estado `OBSOLETA`.
* La revisión seleccionada pasa a estado `VIGENTE`.
* Las revisiones publicadas dejan de ser editables.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Body

Este endpoint no requiere body.

---

## Respuesta exitosa

```json
{
  "message": "Revisión del perfil de cargo publicada correctamente",
  "revision": {
    "id": 1,
    "positionProfileId": 13,
    "revisionNumber": 1,
    "revisionDate": "2026-08-03T17:30:00.000Z",
    "status": "VIGENTE",
    "changeObservation": "Creación inicial",
    "deletedAt": null,
    "updatedAt": "2026-08-04T14:00:00.000Z",
    "positionProfile": {
      "id": 13,
      "code": "GERENTE_FINANCIERO",
      "name": "Gerente Financiero",
      "homeDepartmentId": 13
    }
  }
}
```

---

## Respuesta si faltan descripciones

```json
{
  "message": "No se puede publicar la revisión. Faltan descripciones para: Experiencia, Conocimientos específicos"
}
```

---

## Respuesta si no existen requisitos configurados

```json
{
  "message": "No existen requisitos configurados para los perfiles de cargo"
}
```

---

## Respuesta si la revisión no está en borrador

```json
{
  "message": "Solo se puede publicar una revisión en estado BORRADOR"
}
```

---

# Agregar descripción a un requisito

## Endpoint protegido

```http
POST /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions
```

## Ejemplo

```http
POST /api/position-management/position-profiles/13/revisions/1/requirements/1/descriptions
```

## Descripción

Endpoint privado encargado de agregar una descripción a uno de los requisitos fijos de una revisión.

Solo se pueden agregar descripciones cuando la revisión se encuentra en estado `BORRADOR`.

Un requisito puede tener varias descripciones dentro de la misma revisión.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Body

```json
{
  "description": "Profesional en Administración de Empresas."
}
```

---

## Campos del body

| Campo       | Tipo   | Obligatorio | Descripción                                      |
| ----------- | ------ | ----------- | ------------------------------------------------ |
| description | string | Sí          | Descripción del requisito. Máximo 500 caracteres |

---

## Respuesta exitosa

```json
{
  "message": "Descripción del requisito registrada correctamente",
  "requirementDescription": {
    "id": 1,
    "revisionId": 1,
    "requirementId": 1,
    "description": "Profesional en Administración de Empresas.",
    "createdAt": "2026-08-04T14:20:00.000Z",
    "updatedAt": "2026-08-04T14:20:00.000Z",
    "deletedAt": null,
    "requirement": {
      "id": 1,
      "name": "Formación académica"
    }
  }
}
```

---

## Respuesta si la descripción está vacía

```json
{
  "message": "La descripción del requisito es obligatoria"
}
```

---

## Respuesta si la descripción supera los 500 caracteres

```json
{
  "message": "La descripción del requisito no puede superar los 500 caracteres"
}
```

---

## Respuesta si la revisión no está en borrador

```json
{
  "message": "Solo se pueden agregar descripciones a una revisión en estado BORRADOR"
}
```

---

## Respuesta si el requisito no existe

```json
{
  "message": "El requisito del perfil de cargo no existe"
}
```

---

# Actualizar descripción de un requisito

## Endpoint protegido

```http
PATCH /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions/:descriptionId
```

## Ejemplo

```http
PATCH /api/position-management/position-profiles/13/revisions/1/requirements/1/descriptions/1
```

## Descripción

Endpoint privado encargado de actualizar una descripción registrada dentro de un requisito.

La actualización solo se permite cuando la revisión se encuentra en estado `BORRADOR`.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Body

```json
{
  "description": "Profesional en Administración, Ingeniería Industrial o carreras afines."
}
```

---

## Respuesta exitosa

```json
{
  "message": "Descripción del requisito actualizada correctamente",
  "requirementDescription": {
    "id": 1,
    "revisionId": 1,
    "requirementId": 1,
    "description": "Profesional en Administración, Ingeniería Industrial o carreras afines.",
    "createdAt": "2026-08-04T14:20:00.000Z",
    "updatedAt": "2026-08-04T14:40:00.000Z",
    "deletedAt": null,
    "requirement": {
      "id": 1,
      "name": "Formación académica"
    }
  }
}
```

---

## Respuesta si la descripción no existe

```json
{
  "message": "La descripción del requisito no existe"
}
```

---

## Respuesta si la revisión no está en borrador

```json
{
  "message": "Solo se pueden actualizar descripciones de una revisión en estado BORRADOR"
}
```

---

# Eliminar descripción de un requisito

## Endpoint protegido

```http
DELETE /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions/:descriptionId
```

## Ejemplo

```http
DELETE /api/position-management/position-profiles/13/revisions/1/requirements/1/descriptions/1
```

## Descripción

Endpoint privado encargado de eliminar lógicamente una descripción registrada dentro de un requisito.

La eliminación solo se permite cuando la revisión se encuentra en estado `BORRADOR`.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Body

Este endpoint no requiere body.

---

## Respuesta exitosa

```json
{
  "message": "Descripción del requisito eliminada correctamente",
  "requirementDescription": {
    "id": 1,
    "revisionId": 1,
    "requirementId": 1,
    "description": "Profesional en Administración de Empresas.",
    "createdAt": "2026-08-04T14:20:00.000Z",
    "updatedAt": "2026-08-04T15:00:00.000Z",
    "deletedAt": "2026-08-04T15:00:00.000Z",
    "requirement": {
      "id": 1,
      "name": "Formación académica"
    }
  }
}
```

---

## Respuesta si la descripción no existe

```json
{
  "message": "La descripción del requisito no existe"
}
```

---

## Respuesta si la revisión no está en borrador

```json
{
  "message": "Solo se pueden eliminar descripciones de una revisión en estado BORRADOR"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta general en caso de error

```json
{
  "message": "Error al procesar la operación de la revisión del perfil de cargo"
}
```

---

# Crear requisición de personal

## Endpoint protegido

```http
POST /api/human-talent/requisitions
```

## Descripción

Endpoint privado encargado de crear una nueva requisición de personal desde el módulo de Talento Humano.

Al crear una requisición, el sistema:

* Valida que el usuario esté autenticado.
* Valida que el usuario tenga un cargo autorizado para crear requisiciones.
* Valida que el área, cargo y ciudad existan y estén activos.
* Registra la revisión del perfil de cargo utilizada para crear la requisición.
* Valida las reglas de contratación.
* Registra la requisición.
* Genera automáticamente el flujo de aprobación según la jerarquía del área seleccionada.
* Asigna el paso actual de aprobación.
* Envía la notificación al primer aprobador correspondiente.
* Si el creador hace parte del flujo, se ajustan los pasos según la jerarquía configurada.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
ADMIN y Usuarios autenticados con cargos autorizados para crear requisiciones.
```

---

## Body

```json
{
  "departmentId": 14,
  "positionId": 14,
  "positionRevisionId": 3,
  "reason": "CARGO_NUEVO",
  "otherReason": "Se requiere el cargo por apertura de una nueva sede.",
  "cityId": 1,
  "contractType": "DIRECTO",
  "directContractType": "FIJO",
  "contractDurationMonths": 12,
  "internContractType": null,
  "proposedSalary": 2500000
}
```

---

## Campos del body
| Campo                  | Tipo        | Obligatorio | Descripción                                                         |
| ---------------------- | ----------- | ----------- | ------------------------------------------------------------------- |
| departmentId           | number      | Sí          | Identificador del área solicitante                                  |
| positionId             | number      | Sí          | Identificador del cargo requerido                                   |
| positionRevisionId     | number      | Sí          | Identificador de la revisión del perfil utilizada en la requisición |
| reason                 | string      | Sí          | Motivo de la requisición                                            |
| otherReason            | string      | Sí          | Descripción obligatoria correspondiente al motivo seleccionado      |
| cityId                 | number      | Sí          | Identificador de la ciudad                                          |
| contractType           | string      | Sí          | Tipo principal de contratación                                      |
| directContractType     | string/null | No          | Tipo de contrato directo cuando `contractType` es `DIRECTO`         |
| contractDurationMonths | number/null | No          | Duración del contrato en meses cuando aplica                        |
| internContractType     | string/null | No          | Tipo de practicante cuando `contractType` es `PRACTICANTE`          |
| proposedSalary         | number      | Sí          | Salario propuesto para el cargo                                     |
---

## Motivos permitidos

```txt
CARGO_NUEVO
REEMPLAZO_RETIRO
INCREMENTO_PRODUCCION
SOLICITUD_PRACTICANTES
OTROS
```

---

## Tipos de contratación permitidos

```txt
DIRECTO
TEMPORAL
PRACTICANTE
```

---

## Tipos de contrato directo permitidos

```txt
INDEFINIDO
FIJO
```

---

## Tipos de practicante permitidos

```txt
APRENDIZ
PASANTE
ROTANTE
```

---

## Reglas de contratación

### Contrato directo indefinido

Cuando `contractType` es `DIRECTO` y `directContractType` es `INDEFINIDO`, no se requiere duración en meses.

```json
{
  "contractType": "DIRECTO",
  "directContractType": "INDEFINIDO",
  "contractDurationMonths": null,
  "internContractType": null
}
```

---

### Contrato directo fijo

Cuando `contractType` es `DIRECTO` y `directContractType` es `FIJO`, se debe enviar la duración en meses.

```json
{
  "contractType": "DIRECTO",
  "directContractType": "FIJO",
  "contractDurationMonths": 12,
  "internContractType": null
}
```

---

### Contrato temporal

Cuando `contractType` es `TEMPORAL`, se debe enviar la duración en meses.

```json
{
  "contractType": "TEMPORAL",
  "directContractType": null,
  "contractDurationMonths": 6,
  "internContractType": null
}
```

---

### Practicante

Cuando `contractType` es `PRACTICANTE`, se debe enviar el tipo de practicante.

```json
{
  "contractType": "PRACTICANTE",
  "directContractType": null,
  "contractDurationMonths": null,
  "internContractType": "APRENDIZ"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Requisición de personal creada correctamente",
  "requisition": {
    "id": 1,
    "requestDate": "2026-06-25T00:00:00.000Z",
    "departmentId": 14,
    "positionId": 14,
    "positionRevisionId": 3,
    "reason": "CARGO_NUEVO",
    "otherReason": "Se requiere el cargo por apertura de una nueva sede.",
    "cityId": 1,
    "contractType": "DIRECTO",
    "directContractType": "FIJO",
    "contractDurationMonths": 12,
    "internContractType": null,
    "proposedSalary": "2500000",
    "status": "EN_APROBACION",
    "createdById": 1,
    "createdAt": "2026-06-25T00:00:00.000Z",
    "updatedAt": "2026-06-25T00:00:00.000Z",
    "department": {
      "id": 14,
      "code": "CONTABILIDAD",
      "name": "Contabilidad"
    },
    "position": {
      "id": 14,
      "code": "JEFE_CONTABILIDAD",
      "name": "Jefe de Contabilidad"
    },
    "city": {
      "id": 1,
      "name": "Barranquilla"
    },
    "createdBy": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@gmail.com",
      "role": "USER"
    }
  }
}
```

---

## Respuesta si el usuario no tiene permiso para crear requisiciones

```json
{
  "message": "No tienes un cargo autorizado para crear requisiciones de personal"
}
```

---

## Respuesta si el usuario no tiene firma registrada

```json
{
  "message": "Debes tener una firma registrada para crear una requisición de personal"
}
```

---

## Respuesta si faltan campos obligatorios

```json
{
  "message": "Todos los campos obligatorios deben ser enviados"
}
```

---

## Respuesta si el motivo no es válido

```json
{
  "message": "Motivo de requisición no válido",
  "allowedReasons": [
    "CARGO_NUEVO",
    "REEMPLAZO_RETIRO",
    "INCREMENTO_PRODUCCION",
    "SOLICITUD_PRACTICANTES",
    "OTROS"
  ]
}
```

---

## Respuesta si no se envía la descripción del motivo

```json
{
  "message": "La descripción del motivo es obligatoria"
}
```

---

## Respuesta si el tipo de contratación no es válido

```json
{
  "message": "Tipo de contratación no válido",
  "allowedContractTypes": [
    "DIRECTO",
    "TEMPORAL",
    "PRACTICANTE"
  ]
}
```

---

## Respuesta si falta tipo de contrato directo

```json
{
  "message": "Debe seleccionar el tipo de contrato directo"
}
```

---

## Respuesta si el tipo de contrato directo no es válido

```json
{
  "message": "Tipo de contrato directo no válido",
  "allowedDirectContractTypes": [
    "INDEFINIDO",
    "FIJO"
  ]
}
```

---

## Respuesta si el tipo de practicante no es válido

```json
{
  "message": "Tipo de practicante no válido",
  "allowedInternContractTypes": [
    "APRENDIZ",
    "PASANTE",
    "ROTANTE"
  ]
}
```

---

## Respuesta si falta duración para contrato fijo

```json
{
  "message": "Debe indicar la duración del contrato fijo en meses"
}
```

---

## Respuesta si falta duración para contrato temporal

```json
{
  "message": "Debe indicar la duración del contrato temporal en meses"
}
```

---

## Respuesta si falta tipo de practicante

```json
{
  "message": "Debe seleccionar el tipo de practicante"
}
```

---

## Respuesta si el área no existe o está inactiva

```json
{
  "message": "El área solicitante no existe o está inactiva"
}
```

---

## Respuesta si el cargo no existe o está inactivo

```json
{
  "message": "El cargo requerido no existe o está inactivo"
}
```

---

## Respuesta si la ciudad no existe o está inactiva

```json
{
  "message": "La ciudad no existe o está inactiva"
}
```

---

## Respuesta si el salario no es válido

```json
{
  "message": "El salario propuesto debe ser mayor a cero"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al crear la requisición de personal"
}
```

---

# Obtener requisiciones de personal

## Endpoint protegido

```http
GET /api/human-talent/requisitions
```

## Descripción

Endpoint privado encargado de obtener el listado de requisiciones de personal visibles para el usuario autenticado.

Las requisiciones se devuelven ordenadas desde la más reciente hasta la más antigua.

Reglas principales:

* `ADMIN` puede ver todas las requisiciones.
* El usuario creador puede ver sus propias requisiciones.
* Los usuarios aprobadores pueden ver las requisiciones donde participan o participaron.
* El Analista de Talento Humano puede ver requisiciones en estado `PENDIENTE_CONFIRMACION_TALENTO_HUMANO` que aún no tienen confirmación creada.
* El Jefe de Talento Humano puede ver las requisiciones de personal confirmadas asignadas dentro del flujo de Talento Humano.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

El acceso real depende de la relación del usuario con la requisición o con el flujo de aprobación.

---

## Respuesta exitosa

```json
{
  "message": "Requisiciones de personal obtenidas correctamente",
  "requisitions": [
    {
      "id": 1,
      "requestDate": "2026-06-25T00:00:00.000Z",
      "departmentId": 14,
      "positionId": 14,
      "reason": "CARGO_NUEVO",
      "otherReason": "Se requiere el cargo por apertura de una nueva sede.",
      "cityId": 1,
      "contractType": "DIRECTO",
      "directContractType": "FIJO",
      "contractDurationMonths": 12,
      "internContractType": null,
      "proposedSalary": "2500000",
      "status": "EN_APROBACION",
      "candidateSubmissionStatus": "NO_INICIADA",
      "candidateSubmissionDeadlineAt": null,
      "candidateSubmissionClosedAt": null,
      "candidateSubmissionLateReason": null,
      "createdById": 1,
      "createdAt": "2026-06-25T00:00:00.000Z",
      "updatedAt": "2026-06-25T00:00:00.000Z",
      "department": {
        "id": 14,
        "code": "CONTABILIDAD",
        "name": "Contabilidad"
      },
      "position": {
        "id": 14,
        "code": "JEFE_CONTABILIDAD",
        "name": "Jefe de Contabilidad"
      },
      "city": {
        "id": 1,
        "name": "Barranquilla"
      },
      "createdBy": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@gmail.com",
        "role": "USER",
        "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
      }
    }
  ]
}
```

---

## Respuesta si no existen requisiciones visibles

```json
{
  "message": "Requisiciones de personal obtenidas correctamente",
  "requisitions": []
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener las requisiciones de personal"
}
```

---

# Obtener detalle de requisición de personal

## Endpoint protegido

```http
GET /api/human-talent/requisitions/:id
```

## Ejemplo

```http
GET /api/human-talent/requisitions/1
```

## Descripción

Endpoint privado encargado de obtener el detalle completo de una requisición de personal.

Este endpoint devuelve la información completa de la requisición, incluyendo sus relaciones principales y los datos necesarios para visualizar el detalle o generar el formato imprimible.

Este endpoint devuelve:

* Información general de la requisición.
* Departamento o área solicitante.
* Cargo requerido.
* Revisión del perfil de cargo utilizada al crear la requisición.
* Ciudad de labores.
* Usuario creador.
* Aprobaciones jerárquicas.
* Cargo aprobador de cada paso.
* Usuario asignado para aprobar.
* Usuario que tomó la decisión.
* Firma del usuario que actuó, cuando aplica.
* Confirmación de contratación, si existe.
* Aprobaciones de Talento Humano, si existen.
* Estado del cargue, fecha límite de presentación inicial, fecha del primer cierre y motivo de retraso cuando aplica.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
USER
ADMIN
AGENT
```

El acceso real depende de la relación del usuario autenticado con la requisición.

Puede consultar el detalle:

* El `ADMIN`.
* El usuario que creó la requisición.
* Un usuario que participe o haya participado como aprobador.
* El Analista de Talento Humano cuando la requisición esté pendiente de confirmación.
* Un usuario que participe o haya participado en la confirmación de Talento Humano.

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Respuesta exitosa

```json
{
  "requisition": {
    "id": 1,
    "requestDate": "2026-06-25T00:00:00.000Z",
    "departmentId": 14,
    "positionId": 14,
    "reason": "CARGO_NUEVO",
    "otherReason": "Se requiere el cargo por apertura de una nueva sede.",
    "cityId": 1,
    "contractType": "DIRECTO",
    "directContractType": "FIJO",
    "contractDurationMonths": 12,
    "internContractType": null,
    "proposedSalary": "2500000",
    "status": "EN_APROBACION",
    "createdById": 1,
    "createdAt": "2026-06-25T00:00:00.000Z",
    "updatedAt": "2026-06-25T00:00:00.000Z",
    "department": {
      "id": 14,
      "code": "CONTABILIDAD",
      "name": "Contabilidad"
    },
    "position": {
      "id": 14,
      "code": "JEFE_CONTABILIDAD",
      "name": "Jefe de Contabilidad"
    },
    "city": {
      "id": 1,
      "name": "Barranquilla"
    },
    "createdBy": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@gmail.com",
      "role": "USER",
      "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
    },
    "approvals": [
      {
        "id": 1,
        "requisitionId": 1,
        "approvalOrder": 1,
        "departmentId": 14,
        "approverPositionId": 14,
        "approverAssignmentId": 1,
        "approverUserId": 2,
        "decision": "APROBADA",
        "decidedById": 2,
        "assignedAt": "2026-06-25T00:00:00.000Z",
        "decidedAt": "2026-06-25T00:00:00.000Z",
        "comment": "Aprobado",
        "isCurrent": false,
        "department": {
          "id": 14,
          "code": "CONTABILIDAD",
          "name": "Contabilidad"
        },
        "approverPosition": {
          "id": 14,
          "code": "JEFE_CONTABILIDAD",
          "name": "Jefe de Contabilidad"
        },
        "approverUser": {
          "id": 2,
          "name": "Usuario Jefe de Contabilidad",
          "email": "jefe.contabilidad@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        },
        "decidedBy": {
          "id": 2,
          "name": "Usuario Jefe de Contabilidad",
          "email": "jefe.contabilidad@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        }
      }
    ],
    "hiringConfirmation": null
  }
}
```

---

## Nota sobre firmas

Aunque la respuesta puede incluir `approverUser.signatureUrl`, la firma solo debe mostrarse cuando exista `decidedBy`.

Esto evita mostrar una firma antes de que el usuario haya aprobado, rechazado o cancelado el paso.

---

## Respuesta si el id no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición no existe"
}
```

---

## Respuesta si el usuario no tiene permiso para verla

```json
{
  "message": "No tienes permisos para ver esta requisición"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener el detalle de la requisición"
}
```

---

# Aprobar, rechazar o cancelar una requisición de personal

## Endpoint protegido

```http
PATCH /api/human-talent/requisitions/:id/decision
```

## Ejemplo

```http
PATCH /api/human-talent/requisitions/1/decision
```

## Descripción

Endpoint privado encargado de aprobar, rechazar o cancelar el paso actual de aprobación de una requisición de personal.

Solo puede tomar la decisión el usuario asignado al paso actual, según las reglas del sistema.

Antes de registrar la decisión, el sistema valida que el usuario tenga una firma registrada.

Cuando el paso es aprobado, el sistema activa el siguiente paso del flujo de aprobación.

Si ya no existen más aprobaciones jerárquicas, la requisición pasa al estado:

```txt
PENDIENTE_CONFIRMACION_TALENTO_HUMANO
```

Cuando la requisición es rechazada o cancelada, el flujo termina y el estado de la requisición cambia según la decisión tomada.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario asignado al paso actual de aprobación.
```

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Body para aprobar

```json
{
  "decision": "APROBADA",
  "comment": "Aprobado correctamente"
}
```

---

## Body para rechazar

```json
{
  "decision": "RECHAZADA",
  "comment": "No se aprueba la solicitud porque falta información."
}
```

---

## Body para cancelar

```json
{
  "decision": "CANCELADA",
  "comment": "La requisición fue cancelada por decisión administrativa."
}
```

---

## Campos del body

| Campo    | Tipo        | Obligatorio | Descripción                                             |
| -------- | ----------- | ----------- | ------------------------------------------------------- |
| decision | string      | Sí          | Decisión tomada sobre el paso                           |
| comment  | string/null | No          | Comentario opcional cuando se aprueba                   |
| comment  | string      | Sí          | Obligatorio cuando la decisión es RECHAZADA o CANCELADA |

---

## Decisiones permitidas

```txt
APROBADA
RECHAZADA
CANCELADA
```

---

## Respuesta exitosa

```json
{
  "message": "Decisión registrada correctamente",
  "approval": {
    "id": 1,
    "requestDate": "2026-06-25T00:00:00.000Z",
    "departmentId": 14,
    "positionId": 14,
    "positionRevisionId": 3,
    "reason": "CARGO_NUEVO",
    "otherReason": "Se requiere el cargo por apertura de una nueva sede.",
    "cityId": 1,
    "contractType": "DIRECTO",
    "directContractType": "FIJO",
    "contractDurationMonths": 12,
    "internContractType": null,
    "proposedSalary": "2500000",
    "status": "EN_APROBACION",
    "createdById": 1,
    "createdAt": "2026-06-25T00:00:00.000Z",
    "updatedAt": "2026-06-25T00:00:00.000Z",
    "department": {
      "id": 14,
      "code": "CONTABILIDAD",
      "name": "Contabilidad"
    },
    "position": {
      "id": 14,
      "code": "JEFE_CONTABILIDAD",
      "name": "Jefe de Contabilidad"
    },
    "positionRevision": {
    "id": 3,
    "positionProfileId": 14,
    "revisionNumber": 2,
    "revisionDate": "2026-08-05T00:00:00.000Z",
    "status": "VIGENTE",
    "changeObservation": "Actualización del perfil de cargo",
    "updatedAt": "2026-08-05T15:00:00.000Z"
    },
    "city": {
      "id": 1,
      "name": "Barranquilla"
    },
    "createdBy": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@gmail.com",
      "role": "USER",
      "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
    },
    "approvals": [
      {
        "id": 1,
        "requisitionId": 1,
        "approvalOrder": 1,
        "departmentId": 14,
        "approverPositionId": 14,
        "approverUserId": 2,
        "decision": "APROBADA",
        "decidedById": 2,
        "assignedAt": "2026-06-25T00:00:00.000Z",
        "decidedAt": "2026-06-25T00:00:00.000Z",
        "comment": "Aprobado correctamente",
        "isCurrent": false,
        "department": {
          "id": 14,
          "code": "CONTABILIDAD",
          "name": "Contabilidad"
        },
        "approverPosition": {
          "id": 14,
          "code": "JEFE_CONTABILIDAD",
          "name": "Jefe de Contabilidad"
        },
        "approverUser": {
          "id": 2,
          "name": "Usuario Jefe de Contabilidad",
          "email": "jefe.contabilidad@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        },
        "decidedBy": {
          "id": 2,
          "name": "Usuario Jefe de Contabilidad",
          "email": "jefe.contabilidad@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        }
      }
    ]
  }
}
```

---

## Respuesta si la requisición no es válida

```json
{
  "message": "La requisición no es válida"
}
```

---

## Respuesta si no se envía la decisión

```json
{
  "message": "La decisión es obligatoria"
}
```

---

## Respuesta si la decisión no es válida

```json
{
  "message": "Decisión no válida",
  "allowedDecisions": [
    "APROBADA",
    "RECHAZADA",
    "CANCELADA"
  ]
}
```

---

## Respuesta si se rechaza o cancela sin comentario

```json
{
  "message": "Debe ingresar un comentario para rechazar o cancelar"
}
```

---

## Respuesta si el usuario no tiene firma registrada

```json
{
  "message": "Debes tener una firma registrada para aprobar, rechazar o cancelar una requisición"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición no existe"
}
```

---

## Respuesta si no hay aprobación pendiente

```json
{
  "message": "No hay una aprobación pendiente para esta requisición"
}
```

---

## Respuesta si la requisición no tiene paso activo

```json
{
  "message": "La requisición no tiene un paso activo para decidir"
}
```

---

## Respuesta si el usuario no puede decidir

```json
{
  "message": "No tienes permisos para decidir esta requisición"
}
```

---

## Respuesta si el usuario intenta decidir por otro usuario

```json
{
  "message": "No puedes decidir una requisición por otro usuario"
}
```

---

## Respuesta si el usuario que toma la decisión no existe

```json
{
  "message": "El usuario que toma la decisión no existe"
}
```

---

## Respuesta si el siguiente paso no tiene usuario aprobador

```json
{
  "message": "El siguiente paso no tiene un usuario aprobador asignado"
}
```

---

## Respuesta si no existe configuración activa de Talento Humano

```json
{
  "message": "No existe una configuración activa del flujo de Talento Humano"
}
```

---

## Respuesta si no existe usuario activo para el primer VoBo de Talento Humano

```json
{
  "message": "No existe un usuario activo asignado al primer VoBo de Talento Humano"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al registrar la decisión de la requisición"
}
```

---

# Crear confirmación de contratación

## Endpoint protegido

```http
POST /api/human-talent/requisitions/:id/hiring-confirmation
```

## Ejemplo

```http
POST /api/human-talent/requisitions/1/hiring-confirmation
```

## Descripción

Endpoint privado encargado de registrar la confirmación final de contratación de una requisición.

Este endpoint se utiliza cuando la requisición ya fue aprobada por la jerarquía organizacional y se encuentra en estado:

```txt
PENDIENTE_CONFIRMACION_TALENTO_HUMANO
```

Al crear la confirmación, el sistema:

* Valida que el usuario esté autenticado.
* Valida que la requisición exista.
* Valida que la requisición esté lista para confirmación de Talento Humano.
* Valida que la requisición no tenga una confirmación registrada previamente.
* Valida que el usuario autenticado sea el asignado al primer VoBo de Talento Humano.
* Valida que el usuario tenga una firma registrada.
* Valida las reglas del tipo de contratación aprobado.
* Registra los datos finales de contratación.
* Crea el flujo de aprobación de Talento Humano según la configuración activa.
* Marca automáticamente como aprobado el primer VoBo cuando corresponde al usuario que registra la confirmación.
* Notifica al siguiente aprobador de Talento Humano.
* Cambia el estado de la requisición a `PENDIENTE_APROBACION_TALENTO_HUMANO`.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado asignado al primer VoBo de Talento Humano.
```

En la configuración inicial, este cargo corresponde al Auxiliar de Talento Humano.

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Body

```json
{
  "contractType": "DIRECTO",
  "directContractType": "FIJO",
  "contractDurationMonths": 12,
  "internContractType": null,
  "approvedSalary": 2600000
}
```

---

## Campos del body

| Campo                  | Tipo        | Obligatorio | Descripción                                                    |
| ---------------------- | ----------- | ----------- | -------------------------------------------------------------- |
| contractType           | string      | Sí          | Tipo principal de contratación aprobado                        |
| directContractType     | string/null | No          | Tipo de contrato directo aprobado cuando aplica                |
| contractDurationMonths | number/null | No          | Duración del contrato en meses cuando aplica                   |
| internContractType     | string/null | No          | Tipo de practicante cuando el contrato aprobado es practicante |
| approvedSalary         | number      | Sí          | Salario aprobado por Talento Humano                            |

---

## Tipos de contratación permitidos

```txt
DIRECTO
TEMPORAL
PRACTICANTE
```

---

## Tipos de contrato directo permitidos

```txt
INDEFINIDO
FIJO
```

---

## Tipos de practicante permitidos

```txt
APRENDIZ
PASANTE
ROTANTE
```

---

## Reglas de contratación

### Contrato directo indefinido

Cuando `contractType` es `DIRECTO` y `directContractType` es `INDEFINIDO`, no se requiere duración en meses.

```json
{
  "contractType": "DIRECTO",
  "directContractType": "INDEFINIDO",
  "contractDurationMonths": null,
  "internContractType": null
}
```

---

### Contrato directo fijo

Cuando `contractType` es `DIRECTO` y `directContractType` es `FIJO`, se debe enviar la duración en meses.

```json
{
  "contractType": "DIRECTO",
  "directContractType": "FIJO",
  "contractDurationMonths": 12,
  "internContractType": null
}
```

---

### Contrato temporal

Cuando `contractType` es `TEMPORAL`, se debe enviar la duración en meses.

```json
{
  "contractType": "TEMPORAL",
  "directContractType": null,
  "contractDurationMonths": 6,
  "internContractType": null
}
```

---

### Practicante

Cuando `contractType` es `PRACTICANTE`, se debe enviar el tipo de practicante.

```json
{
  "contractType": "PRACTICANTE",
  "directContractType": null,
  "contractDurationMonths": null,
  "internContractType": "APRENDIZ"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Confirmación de contratación registrada correctamente",
  "hiringConfirmation": {
    "id": 1,
    "requisitionId": 1,
    "contractType": "DIRECTO",
    "directContractType": "FIJO",
    "contractDurationMonths": 12,
    "internContractType": null,
    "approvedSalary": "2600000",
    "status": "PENDIENTE_APROBACION",
    "createdById": 8,
    "createdAt": "2026-06-25T00:00:00.000Z",
    "updatedAt": "2026-06-25T00:00:00.000Z",
    "requisition": {
      "id": 1,
      "department": {
        "id": 14,
        "code": "CONTABILIDAD",
        "name": "Contabilidad"
      },
      "position": {
        "id": 14,
        "code": "JEFE_CONTABILIDAD",
        "name": "Jefe de Contabilidad"
      },
      "city": {
        "id": 1,
        "name": "Barranquilla"
      }
    },
    "createdBy": {
      "id": 8,
      "name": "Usuario Talento Humano",
      "email": "talento.humano@gmail.com",
      "role": "USER",
      "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
    },
    "approvals": [
      {
        "id": 1,
        "approvalOrder": 1,
        "approverPositionId": 1,
        "approverUserId": 8,
        "decision": "APROBADA",
        "decidedById": 8,
        "decidedAt": "2026-06-25T00:00:00.000Z",
        "isCurrent": false,
        "approverPosition": {
          "id": 1,
          "code": "DPC-TH-0080",
          "name": "Auxiliar de Talento Humano"
        },
        "approverUser": {
          "id": 8,
          "name": "Usuario Talento Humano",
          "email": "talento.humano@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
        },
        "decidedBy": {
          "id": 8,
          "name": "Usuario Talento Humano",
          "email": "talento.humano@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
        }
      },
      {
        "id": 2,
        "approvalOrder": 2,
        "approverPositionId": 2,
        "approverUserId": 9,
        "decision": null,
        "decidedById": null,
        "decidedAt": null,
        "isCurrent": true,
        "approverPosition": {
          "id": 2,
          "code": "DPC-TH-0003",
          "name": "Jefe de Talento Humano"
        },
        "approverUser": {
          "id": 9,
          "name": "Jefe Talento Humano",
          "email": "jefe.th@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        },
        "decidedBy": null
      }
    ]
  }
}
```

---

## Respuesta si la requisición no es válida

```json
{
  "message": "La requisición no es válida"
}
```

---

## Respuesta si faltan campos obligatorios

```json
{
  "message": "Todos los campos obligatorios deben ser enviados"
}
```

---

## Respuesta si el tipo de contratación no es válido

```json
{
  "message": "Tipo de contratación no válido",
  "allowedContractTypes": [
    "DIRECTO",
    "TEMPORAL",
    "PRACTICANTE"
  ]
}
```

---

## Respuesta si el tipo de contrato directo no es válido

```json
{
  "message": "Tipo de contrato directo no válido",
  "allowedDirectContractTypes": [
    "INDEFINIDO",
    "FIJO"
  ]
}
```

---

## Respuesta si el tipo de practicante no es válido

```json
{
  "message": "Tipo de practicante no válido",
  "allowedInternContractTypes": [
    "APRENDIZ",
    "PASANTE",
    "ROTANTE"
  ]
}
```

---

## Respuesta si falta tipo de contrato directo

```json
{
  "message": "Debe seleccionar el tipo de contrato directo"
}
```

---

## Respuesta si falta duración para contrato fijo

```json
{
  "message": "Debe indicar la duración del contrato fijo en meses"
}
```

---

## Respuesta si falta duración para contrato temporal

```json
{
  "message": "Debe indicar la duración del contrato temporal en meses"
}
```

---

## Respuesta si falta tipo de practicante

```json
{
  "message": "Debe seleccionar el tipo de practicante"
}
```

---

## Respuesta si el salario aprobado no es válido

```json
{
  "message": "El salario aprobado debe ser mayor a cero"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si la requisición ya tiene confirmación

```json
{
  "message": "Esta requisición ya tiene una confirmación de contratación"
}
```

---

## Respuesta si la requisición no está lista para confirmación

```json
{
  "message": "La requisición todavía no está lista para confirmación de Talento Humano"
}
```

---

## Respuesta si el usuario que confirma no existe

```json
{
  "message": "El usuario que confirma la contratación no existe"
}
```

---

## Respuesta si el usuario no tiene firma registrada

```json
{
  "message": "Debes tener una firma registrada para crear la confirmación de contratación"
}
```

---

## Respuesta si el usuario no está asignado al primer VoBo de Talento Humano

```json
{
  "message": "Solo el usuario asignado al primer VoBo de Talento Humano puede registrar la confirmación"
}
```

---

## Respuesta si no existe configuración activa de Talento Humano

```json
{
  "message": "No existe una configuración activa del flujo de Talento Humano."
}
```

---

## Respuesta si no existe usuario activo en el flujo de Talento Humano

```json
{
  "message": "No existe un usuario activo asignado a uno de los cargos del flujo de Talento Humano."
}
```

---

## Respuesta si no se encuentra paso pendiente para aprobar la confirmación

```json
{
  "message": "No se encontró un paso pendiente para aprobar la confirmación de contratación"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al registrar la confirmación de contratación"
}
```

---

# Aprobar, rechazar o cancelar confirmación de contratación

## Endpoint protegido

```http
PATCH /api/human-talent/hiring-confirmations/:id/decision
```

## Ejemplo

```http
PATCH /api/human-talent/hiring-confirmations/1/decision
```

## Descripción

Endpoint privado encargado de aprobar, rechazar o cancelar la confirmación final de contratación de una requisición.

Solo puede tomar la decisión el usuario asignado al paso actual del flujo de aprobación de Talento Humano.

Antes de registrar la decisión, el sistema valida que el usuario tenga una firma registrada.

Cuando un paso es aprobado, el sistema activa el siguiente paso del flujo de Talento Humano.

Si ya no existen más pasos pendientes, la confirmación de contratación y la requisición pasan a estado:

```txt
APROBADA
```

Al finalizar completamente la aprobación, el sistema también habilita el cargue inicial de candidatos y calcula el plazo de presentación:

```txt
candidateSubmissionStatus: ABIERTA
candidateSubmissionDeadlineAt: final del segundo día hábil
candidateSubmissionClosedAt: null
candidateSubmissionLateReason: null
```

El plazo inicial corresponde a **2 días hábiles**, contando de lunes a viernes y sin incluir el día de la aprobación. La fecha límite se fija al final del segundo día hábil.

Después de habilitar el cargue, el sistema busca un usuario con una asignación activa al cargo:

```txt
DPC-TH-0080 — Auxiliar de Talento Humano
```

Si existe un Auxiliar de Talento Humano activo:

* El usuario creador recibe una notificación indicando que la requisición fue aprobada completamente.
* El Auxiliar de Talento Humano recibe una notificación indicando que tiene un cargue de candidatos pendiente.

Si no existe un Auxiliar de Talento Humano activo:

* La confirmación permanece en estado `APROBADA`.
* La requisición permanece en estado `APROBADA`.
* El cargue de candidatos permanece en estado `ABIERTA`.
* El usuario creador recibe la notificación de aprobación completa.
* El Jefe de Talento Humano que realizó la aprobación final recibe una notificación indicando que no existe un auxiliar activo para realizar el cargue.

Cuando la confirmación es rechazada o cancelada, tanto la confirmación como la requisición cambian al estado correspondiente:

```txt
RECHAZADA
CANCELADA
```

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario asignado al paso actual de aprobación de Talento Humano.
```

---

## Parámetros

| Parámetro | Tipo   | Descripción                                      |
| --------- | ------ | ------------------------------------------------ |
| id        | number | Identificador de la confirmación de contratación |

---

## Body para aprobar

```json
{
  "decision": "APROBADA",
  "comment": "Confirmación aprobada"
}
```

---

## Body para rechazar

```json
{
  "decision": "RECHAZADA",
  "comment": "No se aprueba la confirmación por inconsistencias en la información."
}
```

---

## Body para cancelar

```json
{
  "decision": "CANCELADA",
  "comment": "La confirmación fue cancelada por decisión administrativa."
}
```

---

## Campos del body

| Campo    | Tipo        | Obligatorio | Descripción                                                 |
| -------- | ----------- | ----------- | ----------------------------------------------------------- |
| decision | string      | Sí          | Decisión tomada sobre la confirmación                       |
| comment  | string/null | No          | Comentario opcional cuando la decisión es `APROBADA`        |
| comment  | string      | Sí          | Obligatorio cuando la decisión es `RECHAZADA` o `CANCELADA` |

---

## Decisiones permitidas

```txt
APROBADA
RECHAZADA
CANCELADA
```

---

## Respuesta exitosa

```json
{
  "message": "Decisión de Talento Humano registrada correctamente",
  "approval": {
    "id": 1,
    "requisitionId": 1,
    "contractType": "DIRECTO",
    "directContractType": "FIJO",
    "contractDurationMonths": 12,
    "internContractType": null,
    "approvedSalary": "2600000",
    "status": "APROBADA",
    "createdById": 8,
    "createdAt": "2026-06-25T00:00:00.000Z",
    "updatedAt": "2026-06-25T00:00:00.000Z",
    "requisition": {
      "id": 1,
      "department": {
        "id": 14,
        "code": "CONTABILIDAD",
        "name": "Contabilidad"
      },
      "position": {
        "id": 14,
        "code": "JEFE_CONTABILIDAD",
        "name": "Jefe de Contabilidad"
      },
      "city": {
        "id": 1,
        "name": "Barranquilla"
      }
    },
    "createdBy": {
      "id": 8,
      "name": "Usuario Talento Humano",
      "email": "talento.humano@gmail.com",
      "role": "USER",
      "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
    },
    "approvals": [
      {
        "id": 1,
        "hiringConfirmationId": 1,
        "approvalOrder": 1,
        "approverPositionId": 1,
        "approverAssignmentId": 1,
        "approverUserId": 8,
        "decision": "APROBADA",
        "decidedById": 8,
        "decidedAt": "2026-06-25T00:00:00.000Z",
        "comment": null,
        "isCurrent": false,
        "approverPosition": {
          "id": 1,
          "code": "DPC-TH-0080",
          "name": "Auxiliar de Talento Humano"
        },
        "approverUser": {
          "id": 8,
          "name": "Usuario Talento Humano",
          "email": "talento.humano@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
        },
        "decidedBy": {
          "id": 8,
          "name": "Usuario Talento Humano",
          "email": "talento.humano@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884091.png"
        }
      },
      {
        "id": 2,
        "hiringConfirmationId": 1,
        "approvalOrder": 2,
        "approverPositionId": 2,
        "approverAssignmentId": 2,
        "approverUserId": 9,
        "decision": "APROBADA",
        "decidedById": 9,
        "decidedAt": "2026-06-25T00:00:00.000Z",
        "comment": "Confirmación aprobada",
        "isCurrent": false,
        "approverPosition": {
          "id": 2,
          "code": "DPC-TH-0003",
          "name": "Jefe de Talento Humano"
        },
        "approverUser": {
          "id": 9,
          "name": "Jefe Talento Humano",
          "email": "jefe.th@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        },
        "decidedBy": {
          "id": 9,
          "name": "Jefe Talento Humano",
          "email": "jefe.th@gmail.com",
          "role": "USER",
          "signatureUrl": "/uploads/signatures/signature-1780612884092.png"
        }
      }
    ]
  }
}
```

---

## Respuesta si la confirmación no es válida

```json
{
  "message": "La confirmación de contratación no es válida"
}
```

---

## Respuesta si no se envía la decisión

```json
{
  "message": "La decisión es obligatoria"
}
```

---

## Respuesta si la decisión no es válida

```json
{
  "message": "Decisión no válida",
  "allowedDecisions": [
    "APROBADA",
    "RECHAZADA",
    "CANCELADA"
  ]
}
```

---

## Respuesta si se rechaza o cancela sin comentario

```json
{
  "message": "Debe ingresar un comentario para rechazar o cancelar"
}
```

---

## Respuesta si la confirmación no existe

```json
{
  "message": "La confirmación de contratación no existe"
}
```

---

## Respuesta si no hay aprobación pendiente

```json
{
  "message": "No hay una aprobación pendiente para esta confirmación"
}
```

---

## Respuesta si la confirmación no tiene paso activo

```json
{
  "message": "La confirmación no tiene un paso activo para decidir"
}
```

---

## Respuesta si el usuario no tiene permisos para decidir

```json
{
  "message": "No tienes permisos para decidir esta confirmación de contratación"
}
```

---

## Respuesta si el usuario que toma la decisión no existe

```json
{
  "message": "El usuario que toma la decisión no existe"
}
```

---

## Respuesta si el usuario no tiene firma registrada

```json
{
  "message": "Debes tener una firma registrada para aprobar, rechazar o cancelar la confirmación de contratación"
}
```

---

## Respuesta si el siguiente paso no tiene usuario aprobador

```json
{
  "message": "El siguiente paso no tiene un usuario aprobador asignado"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta token inválido

```json
{
  "message": "Token inválido o expirado."
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al registrar la decisión de Talento Humano"
}
```

---

# Registrar candidato en una requisición de personal

## Endpoint protegido

```http
POST /api/human-talent/requisitions/:id/candidates
```

## Ejemplo

```http
POST /api/human-talent/requisitions/2/candidates
```

## Descripción

Endpoint privado encargado de registrar un candidato y cargar su hoja de vida dentro de una requisición de personal aprobada.

Este endpoint se habilita después de que la confirmación de contratación es aprobada completamente por Talento Humano.

Para permitir el registro, la requisición debe encontrarse en las siguientes condiciones:

```txt
status: APROBADA
candidateSubmissionStatus: ABIERTA
```

Solo puede realizar el cargue el usuario que tenga una asignación activa al cargo:

```txt
DPC-TH-0080 — Auxiliar de Talento Humano
```

Al registrar un candidato, el sistema:

* Valida que el usuario esté autenticado.
* Valida que el usuario tenga activo el cargo de Auxiliar de Talento Humano.
* Valida que el identificador de la requisición sea válido.
* Valida que la requisición exista.
* Valida que la requisición esté aprobada.
* Valida que el cargue de candidatos esté abierto.
* Valida que el tipo de identificación exista y se encuentre activo.
* Valida que el número de identificación sea obligatorio y contenga únicamente números.
* Valida que el nombre del candidato contenga únicamente letras, espacios, tildes y `ñ`.
* Valida la observación cuando es enviada.
* Valida la hoja de vida.
* Impide registrar dos candidatos con la misma combinación de tipo y número de identificación dentro de una misma requisición.
* Impide registrar más de 10 candidatos en la misma requisición.
* Guarda el usuario autenticado que realizó el cargue.
* Elimina del servidor el archivo cargado cuando el registro no puede completarse.

---

## Tipo de envío requerido

Este endpoint no recibe datos en formato JSON.

Debe enviarse mediante:

```txt
multipart/form-data
```

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

Código del cargo autorizado:

```txt
DPC-TH-0080
```

Un usuario que no tenga activo este cargo no puede gestionar candidatos, aunque tenga un rol general diferente dentro del sistema.

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Campos del form-data

| Campo                | Tipo | Obligatorio | Descripción                                                 |
| -------------------- | ---- | ----------- | ----------------------------------------------------------- |
| identificationTypeId | Text | Sí          | Identificador del tipo de identificación activo             |
| identificationNumber | Text | Sí          | Número de identificación del candidato; solo admite números |
| name                 | Text | Sí          | Nombre completo del candidato; solo admite letras           |
| observation          | Text | No          | Observación relacionada con el candidato                    |
| file                 | File | Sí          | Hoja de vida del candidato en PDF, DOC o DOCX               |

---

## Validaciones de identificación

### Tipo de identificación

* Es obligatorio.
* Debe corresponder a un registro existente y activo de `IdentificationType`.

### Número de identificación

* Es obligatorio.
* Solo permite números.
* No puede superar los 50 caracteres.
* Se eliminan los espacios innecesarios al inicio y al final.
* No puede repetirse la misma combinación de `identificationTypeId` + `identificationNumber` dentro de la misma requisición.

---

## Validaciones del nombre

* Es obligatorio.
* Solo permite letras, espacios, tildes y `ñ`.
* Debe tener mínimo 3 caracteres.
* No puede superar los 150 caracteres.
* Se eliminan los espacios innecesarios al inicio y al final.

---

## Validaciones de la observación

* Es opcional.
* No puede superar los 500 caracteres.
* Se eliminan los espacios innecesarios al inicio y al final.
* Cuando no se envía o queda vacía, se almacena como `null`.

---

## Archivos permitidos

Formatos permitidos:

```txt
PDF
DOC
DOCX
```

Tipos MIME permitidos:

```txt
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Tamaño máximo permitido:

```txt
5 MB
```

---

## Límite de candidatos

Cada requisición puede tener un máximo de:

```txt
10 candidatos
```

Los candidatos pueden registrarse progresivamente mientras el cargue permanezca en estado `ABIERTA`.

---

## Ejemplo en Postman

```txt
Método: POST
URL: http://localhost:3000/api/human-talent/requisitions/2/candidates

Headers:
Authorization: Bearer TOKEN_AUXILIAR_TALENTO_HUMANO

Body:
form-data
```

| Key                  | Type | Value                               |
| -------------------- | ---- | ----------------------------------- |
| identificationTypeId | Text | 1                                   |
| identificationNumber | Text | 1045678901                          |
| name                 | Text | Laura Martínez                      |
| observation          | Text | Cumple con la experiencia requerida |
| file                 | File | hoja-de-vida-laura.pdf              |

---

## Respuesta exitosa

```json
{
  "message": "Candidato registrado correctamente",
  "candidate": {
    "id": 1,
    "requisitionId": 2,
    "identificationTypeId": 1,
    "identificationNumber": "1045678901",
    "identificationType": {
      "id": 1,
      "code": "CC",
      "name": "Cédula de ciudadanía"
    },
    "name": "Laura Martínez",
    "observation": "Cumple con la experiencia requerida",
    "originalName": "hoja-de-vida-laura.pdf",
    "fileName": "candidate-1780612884091-hoja-de-vida-laura.pdf",
    "fileUrl": "/uploads/human-talent/candidates/candidate-1780612884091-hoja-de-vida-laura.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245000,
    "uploadedById": 8,
    "createdAt": "2026-07-30T18:30:00.000Z",
    "updatedAt": "2026-07-30T18:30:00.000Z",
    "uploadedBy": {
      "id": 8,
      "name": "Auxiliar de Talento Humano",
      "email": "auxiliar.th@gmail.com",
      "role": "USER"
    }
  }
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta si el id de la requisición no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

---

## Respuesta si no se envía el body

Cuando no se envía ningún campo, el sistema controla el cuerpo vacío y devuelve:

```json
{
  "message": "El nombre del candidato es obligatorio"
}
```

---

## Respuesta si no se envía el nombre

```json
{
  "message": "El nombre del candidato es obligatorio"
}
```

---

## Respuesta si el nombre tiene menos de 3 caracteres

```json
{
  "message": "El nombre del candidato debe tener mínimo 3 caracteres"
}
```

---

## Respuesta si el nombre supera los 150 caracteres

```json
{
  "message": "El nombre del candidato no puede superar los 150 caracteres"
}
```

---

## Respuesta si el nombre contiene caracteres inválidos

```json
{
  "message": "El nombre del candidato solo puede contener letras"
}
```

---

## Respuesta si no se envía el tipo de identificación

```json
{
  "message": "El tipo de identificación no es válido"
}
```

---

## Respuesta si el tipo de identificación no existe o está inactivo

```json
{
  "message": "El tipo de identificación no existe o está inactivo"
}
```

---

## Respuesta si no se envía el número de identificación

```json
{
  "message": "El número de identificación es obligatorio"
}
```

---

## Respuesta si el número de identificación contiene caracteres inválidos

```json
{
  "message": "El número de identificación solo puede contener números"
}
```

---

## Respuesta si el número de identificación supera los 50 caracteres

```json
{
  "message": "El número de identificación no puede superar los 50 caracteres"
}
```

---

## Respuesta si la identificación ya está registrada en la requisición

```json
{
  "message": "Ya existe un candidato con esta identificación en la requisición"
}
```

---

## Respuesta si la observación supera los 500 caracteres

```json
{
  "message": "La observación no puede superar los 500 caracteres"
}
```

---

## Respuesta si no se envía la hoja de vida

```json
{
  "message": "La hoja de vida es obligatoria"
}
```

---

## Respuesta si el usuario no es Auxiliar de Talento Humano

```json
{
  "message": "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si la requisición no está aprobada

```json
{
  "message": "Solo se pueden cargar candidatos en una requisición aprobada"
}
```

---

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

---

## Respuesta si el cargue está cerrado

```json
{
  "message": "El cargue de candidatos ya fue cerrado"
}
```

---

## Respuesta si ya existen 10 candidatos

```json
{
  "message": "La requisición ya tiene el máximo de 10 candidatos"
}
```

---

## Respuesta si el archivo no es válido

```json
{
  "message": "Solo se permiten archivos PDF, DOC o DOCX"
}
```

---

## Respuesta si el archivo supera el tamaño permitido

```json
{
  "message": "La hoja de vida no puede superar los 5 MB"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al registrar el candidato"
}
```

---

# Obtener candidatos de una requisición de personal

## Endpoint protegido

```http
GET /api/human-talent/requisitions/:id/candidates
```

## Ejemplo

```http
GET /api/human-talent/requisitions/2/candidates
```

## Descripción

Endpoint privado encargado de obtener los candidatos registrados en una requisición de personal.

El acceso depende del estado del cargue de candidatos:

```txt
ABIERTA
CERRADA
```

Mientras el cargue se encuentre en estado `ABIERTA`, únicamente puede consultar los candidatos el usuario que tenga una asignación activa al cargo:

```txt
DPC-TH-0080 — Auxiliar de Talento Humano
```

Cuando el cargue se encuentre en estado `CERRADA`, también pueden consultar los candidatos los usuarios que tengan permiso para visualizar el detalle de la requisición.

Entre estos usuarios se encuentran:

* El usuario que creó la requisición.
* El `ADMIN`.
* Los usuarios que participaron en el flujo de aprobación.
* Los usuarios que participaron en la confirmación de contratación de Talento Humano.

Los candidatos se devuelven ordenados desde el primero hasta el último registrado.

La respuesta también incluye el estado de preselección de cada candidato:

```txt
isPreselected
preselectedAt
preselectedById
preselectedBy
```

Estos campos permiten identificar si el candidato ya fue preseleccionado, cuándo se confirmó la preselección y qué usuario realizó la acción.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

### Cuando el cargue está abierto

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

### Cuando el cargue está cerrado

```txt
Usuarios autenticados con permiso para consultar la requisición.
```

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Respuesta exitosa

```json
{
  "message": "Candidatos obtenidos correctamente",
  "candidates": [
    {
      "id": 1,
      "requisitionId": 2,
      "identificationTypeId": 1,
      "identificationNumber": "1045678901",
      "identificationType": {
        "id": 1,
        "code": "CC",
        "name": "Cédula de ciudadanía"
      },
      "name": "Laura Martínez",
      "observation": "Cumple con la experiencia requerida",
      "originalName": "hoja-de-vida-laura.pdf",
      "fileName": "candidate-1780612884091-hoja-de-vida-laura.pdf",
      "fileUrl": "/uploads/human-talent/candidates/candidate-1780612884091-hoja-de-vida-laura.pdf",
      "mimeType": "application/pdf",
      "fileSize": 245000,
      "uploadedById": 8,
      "isPreselected": true,
      "preselectedAt": "2026-08-24T17:05:00.000Z",
      "preselectedById": 5,
      "createdAt": "2026-07-30T18:30:00.000Z",
      "updatedAt": "2026-08-24T17:05:00.000Z",
      "uploadedBy": {
        "id": 8,
        "name": "Auxiliar de Talento Humano",
        "email": "auxiliar.th@gmail.com",
        "role": "USER"
      },
      "preselectedBy": {
        "id": 5,
        "name": "Usuario creador de la requisición",
        "email": "creador@incobra.com"
      }
    }
  ],
  "isCandidateManager": true
}
```

---

## Respuesta si no existen candidatos

```json
{
  "message": "Candidatos obtenidos correctamente",
  "candidates": []
}
```

---

## Respuesta si el id de la requisición no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

---

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

---

## Respuesta si el cargue está abierto y el usuario no es Auxiliar de Talento Humano

```json
{
  "message": "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
}
```

---

## Respuesta si el cargue está cerrado y el usuario no tiene permiso sobre la requisición

```json
{
  "message": "No tienes permisos para ver esta requisición"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al obtener los candidatos"
}
```

---

# Obtener historial del cargue de candidatos

## Endpoint protegido

```http
GET /api/human-talent/requisitions/:id/candidates/history
```

## Ejemplo

```http
GET /api/human-talent/requisitions/1/candidates/history
```

## Descripción

Endpoint privado encargado de obtener la trazabilidad de las reaperturas y cierres posteriores a la presentación inicial de candidatos.

El **primer cierre no se devuelve en este historial**, porque permanece almacenado en `PersonnelRequisition.candidateSubmissionClosedAt`. Si la presentación inicial fue tardía, su justificación se conserva en `candidateSubmissionLateReason`.

El historial comienza a partir de la primera reapertura y devuelve registros independientes en orden cronológico:

```txt
REAPERTURA
CIERRE
REAPERTURA
CIERRE
```

## Header requerido

```http
Authorization: Bearer TOKEN
```

## Acceso permitido

Puede consultar el historial:

* El usuario con asignación activa al cargo `DPC-TH-0080 — Auxiliar de Talento Humano`.
* El `ADMIN`.
* El usuario que creó la requisición.
* Los usuarios que participan o participaron en las aprobaciones de la requisición.
* Los usuarios que participan o participaron en la confirmación de contratación de Talento Humano.

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

## Respuesta exitosa

```json
{
  "message": "Historial del cargue de candidatos obtenido correctamente",
  "history": [
    {
      "id": 1,
      "requisitionId": 1,
      "action": "REAPERTURA",
      "reason": "Se requiere corregir la información de un candidato",
      "performedById": 22,
      "performedAt": "2026-08-18T21:51:57.977Z",
      "performedBy": {
        "id": 22,
        "name": "Auxiliar de Talento Humano",
        "email": "auxiliar.talentohumano@incobra.com",
        "role": "USER"
      }
    },
    {
      "id": 2,
      "requisitionId": 1,
      "action": "CIERRE",
      "reason": null,
      "performedById": 22,
      "performedAt": "2026-08-18T21:52:43.746Z",
      "performedBy": {
        "id": 22,
        "name": "Auxiliar de Talento Humano",
        "email": "auxiliar.talentohumano@incobra.com",
        "role": "USER"
      }
    }
  ]
}
```

## Respuesta sin movimientos posteriores

Cuando la requisición tuvo su primer cierre pero nunca fue reabierta:

```json
{
  "message": "Historial del cargue de candidatos obtenido correctamente",
  "history": []
}
```

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

## Respuesta si el usuario no tiene permiso

```json
{
  "message": "No tienes permisos para ver esta requisición"
}
```

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

# Obtener fotografías históricas de los cargues de candidatos

## Endpoint protegido

```http
GET /api/human-talent/requisitions/:id/candidates/batches
```

## Ejemplo

```http
GET /api/human-talent/requisitions/1/candidates/batches
```

## Descripción

Endpoint privado encargado de obtener las fotografías históricas generadas cada vez que el cargue de candidatos es cerrado.

Cada cierre genera un registro independiente en `PersonnelCandidateSubmissionBatch` con un número consecutivo:

```txt
Cargue 1
Cargue 2
Cargue 3
...
```

Cada cargue conserva:

* Número consecutivo del cargue.
* Fecha y hora del cierre.
* Usuario que realizó el cierre.
* Lista completa de candidatos existentes al momento del cierre.
* Nombre del candidato.
* Código del tipo de identificación.
* Número de identificación.

Los candidatos de cada cargue se devuelven en el mismo orden en que quedaron registrados en la fotografía histórica.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

## Acceso permitido

Puede consultar las fotografías históricas:

* El usuario con asignación activa al cargo `DPC-TH-0080 — Auxiliar de Talento Humano`.
* Los usuarios que tengan permiso para consultar el detalle de la requisición.

Entre los usuarios relacionados con la requisición pueden encontrarse:

* El `ADMIN`.
* El usuario creador.
* Usuarios que participan o participaron en las aprobaciones.
* Usuarios que participan o participaron en la confirmación de contratación de Talento Humano.

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Respuesta exitosa

```json
{
  "message": "Historial de cargues obtenido correctamente",
  "batches": [
    {
      "id": 1,
      "requisitionId": 1,
      "submissionNumber": 1,
      "closedById": 22,
      "closedAt": "2026-08-24T16:55:44.697Z",
      "closedBy": {
        "id": 22,
        "name": "Auxiliar de Talento Humano",
        "email": "auxiliar.talentohumano@incobra.com"
      },
      "candidates": [
        {
          "id": 1,
          "itemNumber": 1,
          "candidateId": 4,
          "candidateName": "Yulieth Devia",
          "identificationTypeCode": "CC",
          "identificationNumber": "123456789"
        },
        {
          "id": 2,
          "itemNumber": 2,
          "candidateId": 5,
          "candidateName": "Yesid Devia",
          "identificationTypeCode": "CC",
          "identificationNumber": "987654321"
        }
      ]
    },
    {
      "id": 2,
      "requisitionId": 1,
      "submissionNumber": 2,
      "closedById": 22,
      "closedAt": "2026-08-24T18:17:29.881Z",
      "closedBy": {
        "id": 22,
        "name": "Auxiliar de Talento Humano",
        "email": "auxiliar.talentohumano@incobra.com"
      },
      "candidates": [
        {
          "id": 3,
          "itemNumber": 1,
          "candidateId": 4,
          "candidateName": "Yulieth Devia",
          "identificationTypeCode": "CC",
          "identificationNumber": "123456789"
        },
        {
          "id": 4,
          "itemNumber": 2,
          "candidateId": 5,
          "candidateName": "Yesid Deviaa",
          "identificationTypeCode": "CC",
          "identificationNumber": "987654321"
        },
        {
          "id": 5,
          "itemNumber": 3,
          "candidateId": 6,
          "candidateName": "Jean ramos",
          "identificationTypeCode": "CC",
          "identificationNumber": "45612387"
        }
      ]
    }
  ]
}
```

---

## Respuesta cuando todavía no existen cargues históricos

```json
{
  "message": "Historial de cargues obtenido correctamente",
  "batches": []
}
```

---

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si el usuario no tiene permiso

```json
{
  "message": "No tienes permisos para ver esta requisición"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

# Cerrar cargue de candidatos

## Endpoint protegido

```http
PATCH /api/human-talent/requisitions/:id/candidates/close
```

## Ejemplo

```http
PATCH /api/human-talent/requisitions/1/candidates/close
```

## Descripción

Endpoint privado encargado de cerrar el proceso de cargue de candidatos de una requisición de personal aprobada.

Para realizar el cierre, la requisición debe encontrarse en:

```txt
status: APROBADA
candidateSubmissionStatus: ABIERTA
```

Cada vez que el cargue se cierra, el sistema:

* Cambia `candidateSubmissionStatus` a `CERRADA`.
* Genera una fotografía histórica completa de los candidatos existentes en ese momento.
* Asigna un número consecutivo al cargue: `Cargue 1`, `Cargue 2`, `Cargue 3`, etc.
* Notifica al usuario creador de la requisición que los candidatos están disponibles.

---

## Primer cierre

El primer cierre corresponde a la presentación inicial de candidatos.

En este momento el sistema registra:

```txt
candidateSubmissionStatus: CERRADA
candidateSubmissionClosedAt: fecha y hora del primer cierre
```

### Validación del plazo inicial

En el primer cierre, el sistema compara la fecha del cierre con:

```txt
candidateSubmissionDeadlineAt
```

Si el cierre se realiza dentro del plazo:

```txt
candidateSubmissionLateReason: null
```

Si se realiza después de la fecha límite, el Auxiliar de Talento Humano debe enviar el motivo del retraso mediante `lateReason`.

La justificación queda almacenada en:

```txt
candidateSubmissionLateReason
```

El primer cierre no genera un registro `CIERRE` en `PersonnelCandidateSubmissionHistory`, debido a que su fecha queda registrada directamente en `PersonnelRequisition.candidateSubmissionClosedAt`.

Sin embargo, sí genera la fotografía histórica correspondiente a `Cargue 1`.

---

## Cierres posteriores a una reapertura

Cuando el cargue fue reabierto y se cierra nuevamente:

* `candidateSubmissionStatus` cambia a `CERRADA`.
* `candidateSubmissionClosedAt` conserva la fecha del primer cierre.
* `candidateSubmissionDeadlineAt` no cambia.
* No se vuelve a evaluar el plazo inicial de 2 días hábiles.
* No se solicita una nueva justificación de retraso.
* Se crea un registro `CIERRE` en `PersonnelCandidateSubmissionHistory`.
* Genera una nueva fotografía histórica en `PersonnelCandidateSubmissionBatch`.

Una vez cerrado el cargue:

* No se pueden registrar nuevos candidatos.
* No se pueden actualizar candidatos.
* No se pueden eliminar candidatos.
* Los usuarios autorizados para visualizar la requisición pueden consultar los candidatos cargados.
* El usuario creador de la requisición recibe una notificación indicando que los candidatos están disponibles.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

## Acceso permitido

```txt
DPC-TH-0080 — Auxiliar de Talento Humano
```

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

## Body

El body es opcional cuando el primer cierre se realiza dentro del plazo o cuando corresponde a un cierre posterior.

```json
{}
```

Si el **primer cierre está vencido**, debe enviarse:

```json
{
  "lateReason": "Se presentaron dificultades para completar la búsqueda de candidatos."
}
```

### Campo `lateReason`

| Campo      | Tipo   | Obligatorio | Descripción |
| ---------- | ------ | ----------- | ----------- |
| lateReason | string | Condicional | Obligatorio únicamente cuando el primer cierre ocurre después de `candidateSubmissionDeadlineAt`. Debe tener entre 3 y 500 caracteres. |

---

## Notificación automática

Cuando el cargue se cierra correctamente, el sistema genera una notificación para el usuario que creó la requisición.

| Destinatario                   | Tipo                          | Descripción                                                                     |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------- |
| Usuario creador de requisición | REQUISITION_CANDIDATES_CLOSED | Informa que los candidatos ya fueron cargados y están disponibles para consulta |

---

## Respuesta exitosa — primer cierre dentro del plazo

```json
{
  "message": "Cargue de candidatos cerrado correctamente",
  "requisition": {
    "id": 1,
    "status": "APROBADA",
    "candidateSubmissionStatus": "CERRADA",
    "candidateSubmissionClosedAt": "2026-08-18T22:03:23.065Z",
    "candidateSubmissionDeadlineAt": "2026-08-21T04:59:59.999Z",
    "candidateSubmissionLateReason": null,
    "updatedAt": "2026-08-18T22:03:23.069Z",
    "_count": {
      "candidates": 2
    }
  }
}
```

## Respuesta exitosa — primer cierre fuera del plazo

```json
{
  "message": "Cargue de candidatos cerrado correctamente",
  "requisition": {
    "id": 2,
    "status": "APROBADA",
    "candidateSubmissionStatus": "CERRADA",
    "candidateSubmissionClosedAt": "2026-08-18T22:13:23.460Z",
    "candidateSubmissionDeadlineAt": "2026-08-18T04:59:59.999Z",
    "candidateSubmissionLateReason": "Se presentaron dificultades para completar la búsqueda de candidatos.",
    "updatedAt": "2026-08-18T22:13:23.468Z",
    "_count": {
      "candidates": 1
    }
  }
}
```

## Respuesta si el primer cierre está fuera del plazo y no se envía motivo

```json
{
  "message": "Debe indicar el motivo del retraso para cerrar el cargue de candidatos"
}
```

## Respuesta si el motivo tiene menos de 3 caracteres

```json
{
  "message": "El motivo del retraso debe tener mínimo 3 caracteres"
}
```

## Respuesta si el motivo supera los 500 caracteres

```json
{
  "message": "El motivo del retraso no puede superar los 500 caracteres"
}
```

## Respuesta si el id de la requisición no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

## Respuesta si el usuario no es Auxiliar de Talento Humano

```json
{
  "message": "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
}
```

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

## Respuesta si la requisición no está aprobada

```json
{
  "message": "Solo se puede cerrar el cargue de una requisición aprobada"
}
```

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

## Respuesta si el cargue ya está cerrado

```json
{
  "message": "El cargue de candidatos ya fue cerrado"
}
```

## Respuesta si no existen candidatos registrados

```json
{
  "message": "Debe registrar por lo menos un candidato antes de cerrar el cargue"
}
```

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

## Respuesta en caso de error

```json
{
  "message": "Error al cerrar el cargue de candidatos"
}
```

---

# Reabrir cargue de candidatos

## Endpoint protegido

```http
PATCH /api/human-talent/requisitions/:id/candidates/reopen
```

## Ejemplo

```http
PATCH /api/human-talent/requisitions/2/candidates/reopen
```

## Descripción

Endpoint privado encargado de reabrir el cargue de candidatos cuando una requisición aprobada ya tuvo su presentación inicial y el cargue se encuentra cerrado.

Para reabrir:

```txt
status: APROBADA
candidateSubmissionStatus: CERRADA
```

Cada reapertura requiere un motivo y genera un registro independiente en `PersonnelCandidateSubmissionHistory`.

Al reabrir:

* `candidateSubmissionStatus` cambia a `ABIERTA`.
* `candidateSubmissionClosedAt` **conserva la fecha del primer cierre**.
* `candidateSubmissionDeadlineAt` no cambia.
* No se genera un nuevo plazo de 2 días hábiles.
* `candidateSubmissionLateReason` conserva el resultado de la presentación inicial.
* Se crea un registro `REAPERTURA` con motivo, usuario y fecha.
* Los candidatos que todavía no hayan sido preseleccionados pueden actualizarse o eliminarse.
* Los candidatos preseleccionados permanecen protegidos y no pueden editarse ni eliminarse.
* El Auxiliar de Talento Humano puede registrar nuevos candidatos mientras el cargue permanezca abierto.
* El usuario creador recibe una notificación de reapertura.

Cuando el Auxiliar finaliza los ajustes, debe cerrar nuevamente el cargue. Ese cierre posterior se registra como `CIERRE` en el historial y no modifica la fecha del primer cierre.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

## Acceso permitido

```txt
DPC-TH-0080 — Auxiliar de Talento Humano
```

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

## Body

```json
{
  "reason": "Se requiere corregir la información de un candidato"
}
```

### Campo `reason`

| Campo  | Tipo   | Obligatorio | Descripción                                      |
| ------ | ------ | ----------- | ------------------------------------------------ |
| reason | string | Sí          | Motivo de la reapertura. Entre 3 y 500 caracteres |

---

## Notificación automática

Cuando el cargue se reabre correctamente, el sistema genera una notificación para el usuario creador de la requisición.

| Destinatario                   | Tipo                            | Descripción                                                        |
| ------------------------------ | ------------------------------- | ------------------------------------------------------------------ |
| Usuario creador de requisición | REQUISITION_CANDIDATES_REOPENED | Informa que Talento Humano reabrió el cargue para realizar ajustes |

---

## Respuesta exitosa

```json
{
  "message": "Cargue de candidatos reabierto correctamente",
  "requisition": {
    "id": 1,
    "status": "APROBADA",
    "candidateSubmissionStatus": "ABIERTA",
    "candidateSubmissionClosedAt": "2026-08-18T22:03:23.065Z",
    "updatedAt": "2026-08-18T22:03:52.260Z",
    "_count": {
      "candidates": 2
    }
  }
}
```

## Respuesta si no se envía motivo

```json
{
  "message": "Debe indicar el motivo para reabrir el cargue de candidatos"
}
```

## Respuesta si el motivo tiene menos de 3 caracteres

```json
{
  "message": "El motivo de reapertura debe tener mínimo 3 caracteres"
}
```

## Respuesta si el motivo supera los 500 caracteres

```json
{
  "message": "El motivo de reapertura no puede superar los 500 caracteres"
}
```

## Respuesta si el id de la requisición no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

## Respuesta si el usuario no es Auxiliar de Talento Humano

```json
{
  "message": "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
}
```

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

## Respuesta si la requisición no está aprobada

```json
{
  "message": "Solo se puede reabrir el cargue de una requisición aprobada"
}
```

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

## Respuesta si el cargue ya está abierto

```json
{
  "message": "El cargue de candidatos ya se encuentra abierto"
}
```

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

## Respuesta en caso de error

```json
{
  "message": "Error al reabrir el cargue de candidatos"
}
```

---

# Preseleccionar candidatos de una requisición

## Endpoint protegido

```http
PATCH /api/human-talent/requisitions/:id/candidates/preselect
```

## Ejemplo

```http
PATCH /api/human-talent/requisitions/1/candidates/preselect
```

## Descripción

Endpoint privado encargado de confirmar la preselección de uno o varios candidatos de una requisición.

Para permitir la preselección, la requisición debe cumplir:

```txt
status: APROBADA
candidateSubmissionStatus: CERRADA
```

Cuando la preselección se confirma, el sistema actualiza cada candidato seleccionado con:

```txt
isPreselected: true
preselectedAt: fecha y hora de confirmación
preselectedById: id del usuario creador de la requisición
```

## Notificación automática

Cada vez que el creador confirma una preselección, el sistema busca al **Auxiliar de Talento Humano activo** y, cuando existe, genera una notificación asociada con la requisición.

| Destinatario | Tipo |
| ------------ | ---- |
| Auxiliar de Talento Humano activo | `REQUISITION_CANDIDATES_PRESELECTED` |

La notificación utiliza un mensaje estandarizado según la cantidad de candidatos confirmados.

**Ejemplo con un candidato:**

```txt
Título: Preselección confirmada - Requisición #25
Mensaje: Se preseleccionó 1 candidato para el cargo Analista Contable. Ya puedes iniciar el proceso de validación de cargo y postulante.
```

**Ejemplo con varios candidatos:**

```txt
Título: Preselección confirmada - Requisición #25
Mensaje: Se preseleccionaron 3 candidatos para el cargo Analista Contable. Ya puedes iniciar el proceso de validación de cargo y postulante.
```

Si no existe un Auxiliar de Talento Humano activo, la preselección se conserva correctamente y no se genera esta notificación.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

## Acceso permitido

```txt
Usuario autenticado que creó la requisición.
```

---

## Parámetros

| Parámetro | Tipo   | Descripción                                 |
| --------- | ------ | ------------------------------------------- |
| id        | number | Identificador de la requisición de personal |

---

## Body

```json
{
  "candidateIds": [4, 5]
}
```

## Campos del body

| Campo        | Tipo     | Obligatorio | Descripción                                               |
| ------------ | -------- | ----------- | --------------------------------------------------------- |
| candidateIds | number[] | Sí          | Identificadores de los candidatos que se preseleccionarán |

El arreglo debe contener por lo menos un candidato.

Los identificadores repetidos enviados en la misma solicitud se normalizan antes de procesar la preselección.

---

## Respuesta exitosa

```json
{
  "message": "Candidatos preseleccionados correctamente",
  "candidates": [
    {
      "id": 4,
      "requisitionId": 1,
      "name": "Yulieth Devia",
      "identificationNumber": "123456789",
      "isPreselected": true,
      "preselectedAt": "2026-08-24T17:05:00.000Z",
      "preselectedById": 5,
      "identificationType": {
        "id": 1,
        "code": "CC",
        "name": "Cédula de ciudadanía"
      },
      "preselectedBy": {
        "id": 5,
        "name": "Usuario creador de la requisición",
        "email": "creador@incobra.com"
      }
    }
  ]
}
```

---

## Respuesta si no se envía una lista de candidatos

```json
{
  "message": "Debe enviar una lista de candidatos para preseleccionar"
}
```

---

## Respuesta si la lista está vacía

```json
{
  "message": "Debe seleccionar por lo menos un candidato"
}
```

---

## Respuesta si uno o más ids no son válidos

```json
{
  "message": "Uno o más ids de candidatos no son válidos"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si la requisición no está aprobada

```json
{
  "message": "Solo se pueden preseleccionar candidatos de una requisición aprobada"
}
```

---

## Respuesta si el cargue no está cerrado

```json
{
  "message": "La preselección solo puede realizarse cuando el cargue de candidatos está cerrado"
}
```

---

## Respuesta si el usuario no es el creador de la requisición

```json
{
  "message": "Solo el creador de la requisición puede preseleccionar candidatos"
}
```

---

## Respuesta si uno o más candidatos no pertenecen a la requisición

```json
{
  "message": "Uno o más candidatos no existen o no pertenecen a esta requisición"
}
```

---

## Respuesta si uno o más candidatos ya fueron preseleccionados

```json
{
  "message": "Uno o más candidatos ya fueron preseleccionados"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al preseleccionar candidatos"
}
```

---

# Actualizar candidato de una requisición de personal

## Endpoint protegido

```http
PATCH /api/human-talent/requisitions/:id/candidates/:candidateId
```

## Ejemplo

```http
PATCH /api/human-talent/requisitions/2/candidates/1
```

## Descripción

Endpoint privado encargado de actualizar los datos o la hoja de vida de un candidato registrado en una requisición de personal.

Este endpoint permite actualizar cualquiera de los siguientes campos:

```txt
identificationTypeId
identificationNumber
name
observation
file
```

Los campos son opcionales individualmente, pero se debe enviar al menos uno.

Si se envía una nueva hoja de vida, el sistema actualiza la información del archivo y elimina la hoja de vida anterior del servidor.

La actualización solo se permite mientras la requisición esté aprobada y el cargue de candidatos permanezca abierto.

Además, un candidato que ya fue preseleccionado no puede ser modificado.

---

## Tipo de envío requerido

Debe enviarse mediante:

```txt
multipart/form-data
```

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

---

## Parámetros

| Parámetro   | Tipo   | Descripción                                 |
| ----------- | ------ | ------------------------------------------- |
| id          | number | Identificador de la requisición de personal |
| candidateId | number | Identificador del candidato                 |

---

## Campos del form-data

| Campo                | Tipo | Obligatorio | Descripción                                         |
| -------------------- | ---- | ----------- | --------------------------------------------------- |
| identificationTypeId | Text | No          | Nuevo identificador del tipo de identificación      |
| identificationNumber | Text | No          | Nuevo número de identificación; solo admite números |
| name                 | Text | No          | Nuevo nombre completo; solo admite letras           |
| observation          | Text | No          | Nueva observación del candidato                     |
| file                 | File | No          | Nueva hoja de vida en formato PDF, DOC o DOCX       |

Se debe enviar al menos uno de los campos.

Cuando `observation` se envía vacía, se almacena como `null`.

---

## Ejemplo en Postman

```txt
Método: PATCH
URL: http://localhost:3000/api/human-talent/requisitions/2/candidates/1

Headers:
Authorization: Bearer TOKEN_AUXILIAR_TALENTO_HUMANO

Body:
form-data
```

| Key                  | Type | Value                        |
| -------------------- | ---- | ---------------------------- |
| identificationTypeId | Text | 1                            |
| identificationNumber | Text | 1045678901                   |
| name                 | Text | Laura María Martínez         |
| observation          | Text | Observación actualizada      |
| file                 | File | hoja-de-vida-actualizada.pdf |

---

## Respuesta exitosa

```json
{
  "message": "Candidato actualizado correctamente",
  "candidate": {
    "id": 1,
    "requisitionId": 2,
    "identificationTypeId": 1,
    "identificationNumber": "1045678901",
    "identificationType": {
      "id": 1,
      "code": "CC",
      "name": "Cédula de ciudadanía"
    },
    "name": "Laura María Martínez",
    "observation": "Observación actualizada",
    "originalName": "hoja-de-vida-actualizada.pdf",
    "fileName": "candidate-1780612884092-hoja-de-vida-actualizada.pdf",
    "fileUrl": "/uploads/human-talent/candidates/candidate-1780612884092-hoja-de-vida-actualizada.pdf",
    "mimeType": "application/pdf",
    "fileSize": 280000,
    "uploadedById": 8,
    "createdAt": "2026-07-30T18:30:00.000Z",
    "updatedAt": "2026-07-30T20:40:00.000Z",
    "uploadedBy": {
      "id": 8,
      "name": "Auxiliar de Talento Humano",
      "email": "auxiliar.th@gmail.com",
      "role": "USER"
    }
  }
}
```

---

## Respuesta si no se envía ningún campo

```json
{
  "message": "Debe enviar al menos un dato para actualizar"
}
```

---

## Respuesta si el id de la requisición no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

---

## Respuesta si el id del candidato no es válido

```json
{
  "message": "El id del candidato no es válido"
}
```

---

## Respuesta si el nombre está vacío

```json
{
  "message": "El nombre del candidato es obligatorio"
}
```

---

## Respuesta si el nombre tiene menos de 3 caracteres

```json
{
  "message": "El nombre del candidato debe tener mínimo 3 caracteres"
}
```

---

## Respuesta si el nombre supera los 150 caracteres

```json
{
  "message": "El nombre del candidato no puede superar los 150 caracteres"
}
```

---

## Respuesta si el nombre contiene caracteres inválidos

```json
{
  "message": "El nombre del candidato solo puede contener letras"
}
```

---

## Respuesta si el tipo de identificación no es válido

```json
{
  "message": "El tipo de identificación no es válido"
}
```

---

## Respuesta si el tipo de identificación no existe o está inactivo

```json
{
  "message": "El tipo de identificación no existe o está inactivo"
}
```

---

## Respuesta si el número de identificación está vacío

```json
{
  "message": "El número de identificación es obligatorio"
}
```

---

## Respuesta si el número de identificación contiene caracteres inválidos

```json
{
  "message": "El número de identificación solo puede contener números"
}
```

---

## Respuesta si el número de identificación supera los 50 caracteres

```json
{
  "message": "El número de identificación no puede superar los 50 caracteres"
}
```

---

## Respuesta si la identificación ya está registrada en la requisición

```json
{
  "message": "Ya existe un candidato con esta identificación en la requisición"
}
```

---

## Respuesta si la observación supera los 500 caracteres

```json
{
  "message": "La observación no puede superar los 500 caracteres"
}
```

---

## Respuesta si el usuario no es Auxiliar de Talento Humano

```json
{
  "message": "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si la requisición no está aprobada

```json
{
  "message": "Solo se pueden actualizar candidatos de una requisición aprobada"
}
```

---

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

---

## Respuesta si el cargue ya fue cerrado

```json
{
  "message": "No se pueden actualizar candidatos porque el cargue ya fue cerrado"
}
```

---

## Respuesta si el candidato no pertenece a la requisición

```json
{
  "message": "El candidato no existe o no pertenece a esta requisición"
}
```

---

## Respuesta si el archivo no es válido

```json
{
  "message": "Solo se permiten archivos PDF, DOC o DOCX"
}
```

---

## Respuesta si el archivo supera el tamaño permitido

```json
{
  "message": "La hoja de vida no puede superar los 5 MB"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta si el candidato ya fue preseleccionado

```json
{
  "message": "No se puede actualizar el candidato porque ya fue preseleccionado"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al actualizar el candidato"
}
```

---

# Eliminar candidato de una requisición de personal

## Endpoint protegido

```http
DELETE /api/human-talent/requisitions/:id/candidates/:candidateId
```

## Ejemplo

```http
DELETE /api/human-talent/requisitions/2/candidates/1
```

## Descripción

Endpoint privado encargado de eliminar un candidato registrado en una requisición de personal.

Al eliminar el candidato, el sistema elimina:

```txt
Registro del candidato en la base de datos
Hoja de vida almacenada en el servidor
```

La eliminación solo se permite mientras la requisición esté aprobada y el cargue de candidatos permanezca abierto.

Además, un candidato que ya fue preseleccionado no puede ser eliminado.

---

## Header requerido

```http
Authorization: Bearer TOKEN
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

---

## Parámetros

| Parámetro   | Tipo   | Descripción                                 |
| ----------- | ------ | ------------------------------------------- |
| id          | number | Identificador de la requisición de personal |
| candidateId | number | Identificador del candidato                 |

---

## Body

Este endpoint no requiere body.

---

## Respuesta exitosa

```json
{
  "message": "Candidato eliminado correctamente",
  "candidate": {
    "id": 1,
    "requisitionId": 2,
    "name": "Laura Martínez",
    "originalName": "hoja-de-vida-laura.pdf",
    "fileName": "candidate-1780612884091-hoja-de-vida-laura.pdf",
    "fileUrl": "/uploads/human-talent/candidates/candidate-1780612884091-hoja-de-vida-laura.pdf"
  }
}
```

---

## Respuesta si el id de la requisición no es válido

```json
{
  "message": "El id de la requisición no es válido"
}
```

---

## Respuesta si el id del candidato no es válido

```json
{
  "message": "El id del candidato no es válido"
}
```

---

## Respuesta si el usuario no es Auxiliar de Talento Humano

```json
{
  "message": "Solo el Auxiliar de Talento Humano activo puede gestionar los candidatos"
}
```

---

## Respuesta si la requisición no existe

```json
{
  "message": "La requisición de personal no existe"
}
```

---

## Respuesta si la requisición no está aprobada

```json
{
  "message": "Solo se pueden eliminar candidatos de una requisición aprobada"
}
```

---

## Respuesta si el cargue todavía no está habilitado

```json
{
  "message": "El cargue de candidatos todavía no está habilitado"
}
```

---

## Respuesta si el cargue ya fue cerrado

```json
{
  "message": "No se pueden eliminar candidatos porque el cargue ya fue cerrado"
}
```

---

## Respuesta si el candidato no pertenece a la requisición

```json
{
  "message": "El candidato no existe o no pertenece a esta requisición"
}
```

---

## Respuesta si el usuario no está autenticado

```json
{
  "message": "Usuario no autenticado"
}
```

---

## Respuesta si el candidato ya fue preseleccionado

```json
{
  "message": "No se puede eliminar el candidato porque ya fue preseleccionado"
}
```

---

## Respuesta en caso de error

```json
{
  "message": "Error al eliminar el candidato"
}
```

---

# Iniciar validación de cargo y postulante

## Endpoint protegido

```http
POST /api/human-talent/candidate-validations/:candidateId
```

## Ejemplo

```http
POST /api/human-talent/candidate-validations/1
```

## Descripción

Endpoint privado encargado de guardar la **Fase 1: Concepto de aplicación** e iniciar formalmente la validación de un candidato preseleccionado.

Para iniciar el proceso, el candidato debe:

```txt
Pertenecer a una requisición en estado APROBADA
Encontrarse previamente preseleccionado
```

El estado actual del cargue de candidatos no condiciona el inicio de la validación.

Solo puede existir una validación por candidato.

Los candidatos preseleccionados no pueden ser modificados ni eliminados desde el proceso de cargue.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

Código del cargo autorizado:

```txt
DPC-TH-0080
```

---

## Parámetros

| Parámetro   | Tipo   | Descripción                         |
| ----------- | ------ | ----------------------------------- |
| candidateId | number | Identificador del candidato a validar |

---

## Conceptos de aplicación permitidos

```txt
INGRESO
MODIFICACION_CARGO
```

---

## Body

```json
{
  "applicationConcept": "INGRESO"
}
```

---

## Respuesta exitosa

```json
{
  "message": "Validación de candidato iniciada correctamente",
  "validation": {
    "id": 1,
    "candidateId": 1,
    "applicationConcept": "INGRESO",
    "completedStep": 1,
    "createdAt": "2026-08-13T15:00:00.000Z",
    "updatedAt": "2026-08-13T15:00:00.000Z"
  }
}
```

---

## Respuesta si el concepto no es válido

```json
{
  "message": "Concepto de aplicación no válido",
  "allowedApplicationConcepts": [
    "INGRESO",
    "MODIFICACION_CARGO"
  ]
}
```

---

## Respuesta si el candidato no está disponible

```json
{
  "message": "El candidato no existe, no ha sido preseleccionado o no está disponible para validación"
}
```

---

## Respuesta si ya existe una validación

```json
{
  "message": "El candidato ya tiene una validación iniciada"
}
```

---

# Guardar validación de cargo

## Endpoint protegido

```http
PATCH /api/human-talent/candidate-validations/:candidateId/position
```

## Ejemplo

```http
PATCH /api/human-talent/candidate-validations/1/position
```

## Descripción

Endpoint privado encargado de guardar la **Fase 2: Validación de cargo**.

La Fase 1 debe existir previamente. El sistema registra el tipo de cargo y verifica automáticamente que la revisión del perfil utilizada por la requisición continúe siendo la revisión vigente del mismo perfil.

La Fase 2 solo puede guardarse cuando la revisión del perfil asociada con la requisición continúa vigente. Si el perfil ya no se encuentra vigente, el proceso se detiene y la fase no se guarda.

Una vez el proceso haya avanzado a una fase posterior, la Fase 2 no puede volver a modificarse.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

---

## Tipos de cargo permitidos

```txt
NUEVO_CARGO
CARGO_EXISTENTE
```

---

## Body para cargo existente

```json
{
  "positionType": "CARGO_EXISTENTE"
}
```

---

## Body para nuevo cargo

```json
{
  "positionType": "NUEVO_CARGO",
  "changeControlCode": "CC-2026-001"
}
```

Cuando `positionType` es `NUEVO_CARGO`, `changeControlCode` es obligatorio.

Cuando `positionType` es `CARGO_EXISTENTE`, el backend almacena `changeControlCode` como `null`.

---

## Respuesta exitosa

```json
{
  "message": "Validación de cargo guardada correctamente",
  "validation": {
    "id": 1,
    "candidateId": 1,
    "applicationConcept": "INGRESO",
    "positionType": "CARGO_EXISTENTE",
    "changeControlCode": null,
    "isPositionProfileCurrent": true,
    "completedStep": 2,
    "updatedAt": "2026-08-13T15:10:00.000Z"
  }
}
```

---

## Respuesta si el tipo de cargo no es válido

```json
{
  "message": "Tipo de cargo no válido",
  "allowedPositionTypes": [
    "NUEVO_CARGO",
    "CARGO_EXISTENTE"
  ]
}
```

---

## Respuesta si falta el código para un nuevo cargo

```json
{
  "message": "El código de control de cambio es obligatorio para un nuevo cargo"
}
```

---

## Respuesta si el perfil de cargo ya no se encuentra vigente

```json
{
  "message": "El perfil de cargo asociado a esta requisición ya no se encuentra vigente. No es posible guardar la validación de cargo."
}
```

---

## Respuesta si no se completó la Fase 1

```json
{
  "message": "Debe completar primero el concepto de aplicación"
}
```

---

## Respuesta si la validación de cargo ya no puede modificarse

```json
{
  "message": "La validación de cargo ya no puede modificarse porque el proceso avanzó a una fase posterior"
}
```

---

# Completar validación del postulante

## Endpoint protegido

```http
PATCH /api/human-talent/candidate-validations/:candidateId/candidate
```

## Ejemplo

```http
PATCH /api/human-talent/candidate-validations/1/candidate
```

## Descripción

Endpoint privado encargado de completar la **Fase 3: Validación del postulante**.

El sistema toma como referencia las descripciones activas de los requisitos pertenecientes a la revisión exacta del perfil guardada en la requisición.

Todas las descripciones de esa revisión deben evaluarse una sola vez.

Reglas por requisito:

```txt
complies: true
→ evidence obligatorio
→ gapClosure se almacena como null

complies: false
→ evidence se almacena como null
→ gapClosure obligatorio
```

Al completar la fase, el backend registra automáticamente el usuario que realizó la validación y la fecha de finalización.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

---

## Body

```json
{
  "isSuitable": true,
  "requirementValidations": [
    {
      "requirementDescriptionId": 15,
      "complies": true,
      "evidence": "Formación académica verificada",
      "gapClosure": null
    },
    {
      "requirementDescriptionId": 18,
      "complies": false,
      "evidence": null,
      "gapClosure": "Completar experiencia requerida mediante el plan definido por Talento Humano"
    }
  ]
}
```

> El arreglo debe contener todas las descripciones activas de requisitos de la revisión exacta asociada con la requisición. Los identificadores del ejemplo son ilustrativos.

---

## Respuesta exitosa

```json
{
  "message": "Validación del postulante completada correctamente",
  "validation": {
    "id": 1,
    "candidateId": 1,
    "applicationConcept": "INGRESO",
    "positionType": "CARGO_EXISTENTE",
    "changeControlCode": null,
    "isPositionProfileCurrent": true,
    "isSuitable": true,
    "performedById": 8,
    "completedStep": 3,
    "validatedAt": "2026-08-13T15:20:00.000Z",
    "requirementValidations": [
      {
        "id": 1,
        "requirementDescriptionId": 15,
        "complies": true,
        "evidence": "Formación académica verificada",
        "gapClosure": null
      }
    ],
    "updatedAt": "2026-08-13T15:20:00.000Z"
  }
}
```

---

## Respuesta si falta completar la Fase 2

```json
{
  "message": "Debe completar primero la validación de cargo"
}
```

---

## Respuesta si falta evaluar algún requisito

```json
{
  "message": "Debe evaluar todos los requisitos del perfil de cargo"
}
```

---

## Respuesta si se repite una descripción

```json
{
  "message": "No se puede evaluar una misma descripción de requisito más de una vez"
}
```

---

## Respuesta si una descripción no pertenece a la revisión

```json
{
  "message": "Uno o más requisitos no pertenecen a la revisión del cargo de esta requisición"
}
```

---

## Respuesta si falta evidencia cuando cumple

```json
{
  "message": "La evidencia es obligatoria cuando el postulante cumple el requisito"
}
```

---

## Respuesta si la evidencia supera los 1000 caracteres

```json
{
  "message": "La evidencia no puede superar los 1000 caracteres"
}
```

---

## Respuesta si falta cierre de brecha cuando no cumple

```json
{
  "message": "El cierre de brecha es obligatorio cuando el postulante no cumple el requisito"
}
```

---

## Respuesta si el cierre de brecha supera los 1000 caracteres

```json
{
  "message": "El cierre de brecha no puede superar los 1000 caracteres"
}
```

---

## Respuesta si la validación ya fue completada

```json
{
  "message": "La validación del postulante ya fue completada"
}
```

---


# Guardar Evaluación Técnica

## Endpoint protegido

```http
PATCH /api/human-talent/candidate-validations/:candidateId/technical-evaluation
```

## Ejemplo

```http
PATCH /api/human-talent/candidate-validations/15/technical-evaluation
```

## Descripción

Este endpoint permite registrar las calificaciones de **entrevista** y **examen** de la Fase 4: Evaluación Técnica.

Las notas son diligenciadas por el Auxiliar de Talento Humano y pueden registrarse por separado. Cuando ambas están completas, la evaluación queda pendiente de aprobación y se notifica al usuario que creó la requisición.

Para iniciar esta fase, el postulante debe haber completado la Fase 3 y haber sido considerado apto para continuar.

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado con el cargo activo de Auxiliar de Talento Humano.
```

---

## Parámetros

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| `candidateId` | number | Identificador del candidato preseleccionado |

---

## Body

Se puede registrar una calificación:

```json
{
  "interviewScore": 4.5
}
```

o:

```json
{
  "examScore": 4.2
}
```

También pueden enviarse ambas:

```json
{
  "interviewScore": 4.5,
  "examScore": 4.2
}
```

---

## Campos del body

| Campo | Tipo | Obligatorio | Descripción |
| ----- | ---- | ----------- | ----------- |
| `interviewScore` | number | Condicional | Calificación de entrevista entre 0.0 y 5.0 |
| `examScore` | number | Condicional | Calificación de examen entre 0.0 y 5.0 |

Debe enviarse por lo menos una de las dos calificaciones.


---

## Respuesta exitosa — evaluación todavía en registro

```json
{
  "message": "Calificación de la Evaluación Técnica guardada correctamente",
  "evaluation": {
    "id": 1,
    "candidateValidationId": 3,
    "interviewScore": "4.5",
    "interviewRecordedAt": "2026-09-07T18:30:00.000Z",
    "examScore": null,
    "examRecordedAt": null,
    "status": "EN_REGISTRO",
    "enteredById": 22,
    "updatedAt": "2026-09-07T18:30:00.000Z"
  }
}
```

---

## Respuesta exitosa — ambas notas registradas

```json
{
  "message": "Evaluación Técnica enviada para aprobación correctamente",
  "evaluation": {
    "id": 1,
    "candidateValidationId": 3,
    "interviewScore": "4.5",
    "interviewRecordedAt": "2026-09-07T18:30:00.000Z",
    "examScore": "4.2",
    "examRecordedAt": "2026-09-07T18:40:00.000Z",
    "status": "PENDIENTE_APROBACION",
    "enteredById": 22,
    "updatedAt": "2026-09-07T18:40:00.000Z"
  }
}
```

---

## Notificación automática

Cuando existen las dos calificaciones se genera una notificación para el usuario que creó la requisición.

| Destinatario | Tipo |
| ------------ | ---- |
| Usuario creador de la requisición | `CANDIDATE_TECHNICAL_EVALUATION_PENDING` |

---

## Respuesta si no se envía ninguna calificación

```json
{
  "message": "Debe diligenciar por lo menos una calificación"
}
```

---

## Respuesta si la entrevista no está entre 0.0 y 5.0

```json
{
  "message": "La calificación de la entrevista debe estar entre 0.0 y 5.0"
}
```

---

## Respuesta si el examen no está entre 0.0 y 5.0

```json
{
  "message": "La calificación del examen debe estar entre 0.0 y 5.0"
}
```

---


## Respuesta si falta completar la Fase 3

```json
{
  "message": "Debe completar primero la validación del postulante"
}
```

---

## Respuesta si el postulante no fue aprobado en la Fase 3

```json
{
  "message": "El postulante no fue aprobado en la validación del postulante y no puede continuar a la Evaluación Técnica"
}
```

---

## Respuesta si ya fue enviada para aprobación

```json
{
  "message": "La Evaluación Técnica ya fue enviada para aprobación y no puede modificarse"
}
```

---

## Respuesta si la Fase 4 ya fue completada

```json
{
  "message": "La Evaluación Técnica ya fue completada"
}
```

---

# Confirmar Evaluación Técnica

## Endpoint protegido

```http
PATCH /api/human-talent/candidate-validations/:candidateId/technical-evaluation/approve
```

## Ejemplo

```http
PATCH /api/human-talent/candidate-validations/15/technical-evaluation/approve
```

## Descripción

Endpoint privado encargado de confirmar la **Fase 4: Evaluación Técnica**.

Solo puede ejecutar esta acción el usuario que creó la requisición a la que pertenece el candidato.

Para confirmar la fase, la Evaluación Técnica debe encontrarse en:

```txt
status: PENDIENTE_APROBACION
completedStep: 3
```

y deben existir las dos calificaciones.

El usuario creador decide si el postulante es apto para continuar.

Al confirmar, el backend registra automáticamente:

```txt
isSuitable
approvedById
approvedAt
status: APROBADA
completedStep: 4
```

> `status: APROBADA` significa que la Evaluación Técnica fue revisada y confirmada. No significa necesariamente que el postulante sea apto. Si `isSuitable` queda en `false`, la Fase 4 se considera terminada, pero el postulante no debe avanzar a la Fase 5.

## Notificación automática

Después de confirmar la Evaluación Técnica, el sistema notifica al **Auxiliar de Talento Humano que registró las calificaciones**, identificado mediante `enteredById`.

| Destinatario | Tipo |
| ------------ | ---- |
| Usuario que diligenció las calificaciones de la Evaluación Técnica | `CANDIDATE_TECHNICAL_EVALUATION_CONFIRMED` |

El mensaje informa el resultado confirmado por el creador de la requisición.

**Si el postulante es apto:**

```txt
Título: Evaluación técnica confirmada - Requisición #25
Mensaje: Se confirmó la Evaluación Técnica de Juan Pérez para el cargo Analista Contable. El postulante puede continuar en el proceso.
```

**Si el postulante no es apto:**

```txt
Título: Evaluación técnica confirmada - Requisición #25
Mensaje: Se confirmó la Evaluación Técnica de Juan Pérez para el cargo Analista Contable. El postulante no continuará en el proceso.
```

---

## Header requerido

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## Acceso permitido

```txt
Usuario autenticado que creó la requisición.
```

---

## Body — postulante apto

```json
{
  "isSuitable": true
}
```

## Body — postulante no apto

```json
{
  "isSuitable": false
}
```

---

## Respuesta exitosa — apto

```json
{
  "message": "Evaluación Técnica aprobada. El postulante puede continuar el proceso.",
  "evaluation": {
    "id": 1,
    "candidateValidationId": 3,
    "interviewScore": "4.5",
    "interviewRecordedAt": "2026-09-07T18:30:00.000Z",
    "examScore": "4.2",
    "examRecordedAt": "2026-09-07T18:40:00.000Z",
    "status": "APROBADA",
    "isSuitable": true,
    "enteredById": 22,
    "approvedById": 5,
    "approvedAt": "2026-09-07T19:00:00.000Z",
    "approvedBy": {
      "id": 5,
      "name": "Usuario creador de la requisición"
    }
  },
  "validation": {
    "id": 3,
    "completedStep": 4
  }
}
```

---

## Respuesta exitosa — no apto

```json
{
  "message": "Evaluación Técnica finalizada. El postulante no continuará el proceso.",
  "evaluation": {
    "id": 1,
    "candidateValidationId": 3,
    "interviewScore": "4.5",
    "examScore": "4.2",
    "status": "APROBADA",
    "isSuitable": false,
    "approvedById": 5,
    "approvedAt": "2026-09-07T19:00:00.000Z"
  },
  "validation": {
    "id": 3,
    "completedStep": 4
  }
}
```

---

## Respuesta si no se indica si es apto

```json
{
  "message": "Debe indicar si el postulante es apto para continuar el proceso"
}
```

---

## Respuesta si el usuario no es el creador de la requisición

```json
{
  "message": "Solo el usuario que creó la requisición puede validar la Evaluación Técnica"
}
```

---

## Respuesta si la Evaluación Técnica no está disponible en la etapa actual

```json
{
  "message": "La Evaluación Técnica no está disponible en la etapa actual"
}
```

---

## Respuesta si todavía no ha sido diligenciada

```json
{
  "message": "La Evaluación Técnica todavía no ha sido diligenciada"
}
```

---

## Respuesta si todavía no está lista para validación

```json
{
  "message": "La Evaluación Técnica todavía no está lista para validación"
}
```

---

## Respuesta si faltan calificaciones

```json
{
  "message": "La entrevista y el examen deben estar calificados antes de continuar"
}
```

---

# Obtener candidatos disponibles para validación

## Endpoint protegido

```http
GET /api/human-talent/candidate-validations
```

## Descripción

Endpoint privado encargado de obtener los candidatos preseleccionados disponibles en el módulo **Validación de cargo y postulante**.

Solo se incluyen candidatos que:

- Hayan sido confirmados como preseleccionados.
- Pertenezcan a una requisición en estado `APROBADA`.

El estado del cargue puede encontrarse `ABIERTA` o `CERRADA` sin afectar la disponibilidad de un candidato que ya fue preseleccionado.

## Acceso permitido

Pueden consultar las validaciones:

- **Auxiliar de Talento Humano:** puede consultar todos los candidatos preseleccionados y diligenciar las fases operativas del proceso.
- **Jefe de Talento Humano:** puede consultar todos los candidatos preseleccionados.
- **ADMIN:** puede consultar todos los candidatos preseleccionados.
- **Creador autorizado de requisiciones:** puede consultar únicamente los candidatos pertenecientes a las requisiciones que él mismo creó.

## Estados calculados

El sistema utiliza estos estados para identificar en qué punto se encuentra la validación del postulante:

```txt
SIN_INICIAR
→ Todavía no ha comenzado la validación.

CONCEPTO_APLICACION_COMPLETADO
→ Fase 1 completada.

VALIDACION_CARGO_COMPLETADA
→ Fase 2 completada.

VALIDACION_COMPLETADA
→ Fase 3 completada.

EVALUACION_TECNICA_EN_REGISTRO
→ La Fase 4 comenzó, pero todavía falta registrar alguna calificación.

EVALUACION_TECNICA_PENDIENTE_APROBACION
→ Las calificaciones de entrevista y examen están completas y esperan la confirmación del creador de la requisición.

EVALUACION_TECNICA_COMPLETADA
→ La Fase 4 fue revisada y confirmada.
```

## Respuesta exitosa

```json
{
  "message": "Candidatos para validación obtenidos correctamente",
  "candidates": [
    {
      "id": 15,
      "requisitionId": 10,
      "identificationNumber": "1045678901",
      "name": "Carlos Pérez",
      "identificationType": {
        "id": 1,
        "code": "CC",
        "name": "Cédula de ciudadanía"
      },
      "requisition": {
        "id": 10,
        "candidateSubmissionStatus": "CERRADA",
        "department": {
          "id": 5,
          "code": "TECNOLOGIA",
          "name": "Tecnología"
        },
        "position": {
          "id": 8,
          "code": "DPC-TI-001",
          "name": "Técnico de Soporte"
        }
      },
      "validation": {
        "id": 3,
        "applicationConcept": "INGRESO",
        "positionType": "CARGO_EXISTENTE",
        "isPositionProfileCurrent": true,
        "isSuitable": true,
        "completedStep": 3,
        "validatedAt": "2026-09-07T18:00:00.000Z",
        "technicalEvaluation": {
          "status": "PENDIENTE_APROBACION",
          "isSuitable": null
        }
      },
      "validationStatus": "EVALUACION_TECNICA_PENDIENTE_APROBACION"
    }
  ],
  "canManageValidation": true
}
```

## Respuesta si el usuario no tiene acceso

```json
{
  "message": "No tienes permisos para consultar las validaciones de candidatos"
}
```

---

# Obtener detalle de la validación de un candidato

## Endpoint protegido

```http
GET /api/human-talent/candidate-validations/:candidateId
```

## Descripción

Este endpoint permite consultar el detalle completo del proceso de validación de un candidato.

La respuesta contiene la información del candidato, la requisición asociada, los requisitos evaluados y los datos registrados en cada fase del proceso.

---

## Acceso permitido

Pueden consultar el detalle de la validación:

- **Auxiliar de Talento Humano:** puede consultar el detalle de cualquier candidato preseleccionado y diligenciar las fases operativas del proceso.
- **Jefe de Talento Humano:** puede consultar el detalle de cualquier candidato preseleccionado.
- **ADMIN:** puede consultar el detalle de cualquier candidato preseleccionado.
- **Creador autorizado de requisiciones:** puede consultar únicamente los candidatos pertenecientes a las requisiciones que él mismo creó.

---

## Respuesta exitosa

```json
{
  "message": "Detalle de la validación obtenido correctamente",
  "candidate": {
    "id": 15,
    "name": "Carlos Pérez",
    "requisition": {
      "id": 10,
      "position": {
        "id": 8,
        "name": "Técnico de Soporte"
      },
      "createdBy": {
        "id": 5,
        "name": "Usuario creador de la requisición"
      }
    },
    "validation": {
      "id": 3,
      "applicationConcept": "INGRESO",
      "positionType": "CARGO_EXISTENTE",
      "isPositionProfileCurrent": true,
      "isSuitable": true,
      "completedStep": 3,
      "technicalEvaluation": {
        "interviewScore": "4.5",
        "examScore": "4.2",
        "status": "PENDIENTE_APROBACION",
        "isSuitable": null,
        "enteredBy": {
          "id": 22,
          "name": "Auxiliar de Talento Humano"
        },
        "approvedBy": null,
        "approvedAt": null
      }
    }
  },
  "canManageValidation": false,
  "canApproveTechnicalEvaluation": true
}
```

Si la Evaluación Técnica todavía no ha iniciado:

```json
{
  "technicalEvaluation": null
}
```

---

## Permisos devueltos

### `canManageValidation`

Indica si el usuario puede diligenciar las fases correspondientes al Auxiliar de Talento Humano.

### `canApproveTechnicalEvaluation`

Indica si el usuario puede confirmar la Evaluación Técnica.

---

## Respuesta si el candidato no está disponible

```json
{
  "message": "El candidato no existe, no ha sido preseleccionado o no está disponible para validación"
}
```

---

## Respuesta si el usuario no tiene acceso

```json
{
  "message": "No tienes permisos para consultar las validaciones de candidatos"
}
```

---

# Resumen actualizado de endpoints funcionales

| Método | Endpoint                                                                                                                                    | Descripción                                                | Acceso                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| GET    | /api/health                                                                                                                                 | Verifica el funcionamiento de la API                       | Público                                                         |
| GET    | /api/users                                                                                                                                  | Obtiene todos los usuarios registrados                     | ADMIN                                                           |
| GET    | /api/users/agents                                                                                                                           | Obtiene únicamente los usuarios con rol AGENT              | ADMIN                                                           |
| PATCH  | /api/users/:id/role                                                                                                                         | Cambia el rol de un usuario                                | ADMIN                                                           |
| PATCH  | /api/users/:id/password                                                                                                                     | Restablece la contraseña de un usuario                     | ADMIN                                                           |
| PATCH  | /api/users/signature                                                                                                                        | Sube la firma del usuario autenticado                      | Usuario autenticado                                             |
| POST   | /api/auth/register                                                                                                                          | Registra un nuevo usuario                                  | Público                                                         |
| POST   | /api/users/bulk                                                                                                          | Registra usuarios mediante carga masiva desde Excel        | ADMIN                                                           |
| PATCH  | /api/auth/password                                                                                                                          | Cambia la contraseña del usuario autenticado               | USER / ADMIN / AGENT                                            |
| POST   | /api/auth/login                                                                                                                            | Inicia sesión y genera token JWT                           | Público                                                         |
| GET    | /api/profile                                                                                                                                | Obtiene el perfil del usuario autenticado                  | Usuario autenticado                                             |
| GET    | /api/common/cities                                                                                                                          | Obtiene las ciudades activas del sistema                   | Usuario autenticado                                             |
| GET    | /api/common/identification-types                                                                                                            | Obtiene los tipos de identificación activos                | Usuario autenticado                                             |
| POST   | /api/pqrs                                                                                                                                   | Crea una nueva PQR                                         | USER / AGENT                                                    |
| GET    | /api/pqrs/my                                                                                                                                | Obtiene las PQR creadas por el usuario autenticado         | USER / AGENT                                                    |
| GET    | /api/pqrs                                                                                                                                   | Obtiene todas las PQR del sistema                          | ADMIN                                                           |
| GET    | /api/pqrs/available                                                                                                                         | Obtiene las PQR pendientes sin responsable                 | ADMIN / AGENT                                                   |
| GET    | /api/pqrs/assigned/my                                                                                                                       | Obtiene las PQR asignadas al AGENT autenticado             | ADMIN / AGENT                                                   |
| PATCH  | /api/pqrs/:id/take                                                                                                                          | Permite que un AGENT tome una PQR disponible               | ADMIN / AGENT                                                   |
| PATCH  | /api/pqrs/:id/assign                                                                                                                        | Asigna o reasigna una PQR a un agente específico           | ADMIN                                                           |
| PATCH  | /api/pqrs/:id/unassign                                                                                                                      | Desasigna una PQR y la deja nuevamente disponible          | ADMIN                                                           |
| PATCH  | /api/pqrs/:id/status                                                                                                                        | Cambia el estado de una PQR                                | ADMIN / AGENT                                                   |
| PATCH  | /api/pqrs/:id/priority                                                                                                                      | Cambia la prioridad de una PQR                             | ADMIN / AGENT                                                   |
| GET    | /api/pqrs/:id/messages                                                                                                                      | Obtiene el historial de mensajes de una PQR                | USER / AGENT / ADMIN                                            |
| PATCH  | /api/pqrs/:id/messages/read                                                                                                                 | Marca como leído el chat de una PQR                        | USER / AGENT / ADMIN                                            |
| POST   | /api/pqrs/:id/messages/attachment                                                                                                           | Envía un mensaje con imagen o documento adjunto en una PQR | USER / AGENT / ADMIN                                            |
| PATCH  | /api/pqrs/:id/rate                                                                                                                          | Permite al creador calificar una PQR cerrada               | USER / AGENT                                                            |
| GET    | /api/notifications                                                                                                                          | Obtiene las notificaciones del usuario autenticado         | USER / ADMIN / AGENT                                            |
| GET    | /api/notifications/unread-count                                                                                                             | Obtiene la cantidad de notificaciones no leídas            | USER / ADMIN / AGENT                                            |
| PATCH  | /api/notifications/:id/read                                                                                                                 | Marca una notificación como leída                          | USER / ADMIN / AGENT                                            |
| PATCH  | /api/notifications/read-all                                                                                                                 | Marca todas las notificaciones como leídas                 | USER / ADMIN / AGENT                                            |
| GET    | /api/human-talent/departments                                                                                                               | Obtiene áreas disponibles según cargos activos del usuario | Usuario autenticado                                             |
| GET    | /api/position-management/position-profiles                                                                                                  | Obtiene cargos disponibles según área seleccionada         | Usuario autenticado                                             |
| GET    | /api/position-management/position-profiles/:positionProfileId/current-revision                                                              | Obtiene la revisión vigente de un perfil de cargo          | Usuario autenticado                                             |
| POST   | /api/position-management/position-profiles/:positionProfileId/revisions                                                                     | Crea una nueva revisión en estado borrador                 | Usuario autenticado                                             |
| GET    | /api/position-management/position-profiles/:positionProfileId/revisions                                                                     | Obtiene las revisiones activas de un perfil de cargo       | Usuario autenticado                                             |
| GET    | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId                                                         | Obtiene el detalle de una revisión y sus requisitos        | Usuario autenticado                                             |
| PATCH  | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId                                                         | Actualiza la observación de una revisión en borrador       | Usuario autenticado                                             |
| DELETE | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId                                                         | Elimina lógicamente una revisión en borrador               | Usuario autenticado                                             |
| PATCH  | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/publish                                                 | Publica una revisión y la convierte en vigente             | Usuario autenticado                                             |
| POST   | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions                | Agrega una descripción a un requisito de la revisión       | Usuario autenticado                                             |
| PATCH  | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions/:descriptionId | Actualiza una descripción de un requisito                  | Usuario autenticado                                             |
| DELETE | /api/position-management/position-profiles/:positionProfileId/revisions/:revisionId/requirements/:requirementId/descriptions/:descriptionId | Elimina lógicamente una descripción de un requisito        | Usuario autenticado                                             |
| POST   | /api/human-talent/requisitions                                                                                                              | Crea una requisición de personal                           | Cargo autorizado                                                |
| GET    | /api/human-talent/requisitions                                                                                                              | Obtiene las requisiciones visibles para el usuario         | Usuario relacionado                                             |
| GET    | /api/human-talent/requisitions/:id                                                                                                          | Obtiene el detalle completo de una requisición             | Usuario relacionado                                             |
| PATCH  | /api/human-talent/requisitions/:id/decision                                                                                                 | Aprueba, rechaza o cancela una requisición                 | Aprobador actual                                                |
| POST   | /api/human-talent/requisitions/:id/hiring-confirmation                                                                                      | Crea la confirmación final de contratación                 | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/hiring-confirmations/:id/decision                                                                                         | Aprueba, rechaza o cancela la confirmación de contratación | Aprobador actual TH                                             |
| POST   | /api/human-talent/requisitions/:id/candidates                                                                                               | Registra un candidato y carga su hoja de vida              | Auxiliar de Talento Humano                                      |
| GET    | /api/human-talent/requisitions/:id/candidates                                                                                               | Obtiene los candidatos registrados en una requisición e información de preselección           | Auxiliar TH / Usuario relacionado cuando el cargue esté cerrado |
| GET    | /api/human-talent/requisitions/:id/candidates/history                                                                                       | Obtiene reaperturas y cierres posteriores del cargue       | Auxiliar TH / Usuario relacionado                               |
| GET    | /api/human-talent/requisitions/:id/candidates/batches                                                                                       | Obtiene las fotografías históricas de cada cierre          | Auxiliar TH / Usuario relacionado                               |
| PATCH  | /api/human-talent/requisitions/:id/candidates/close                                                                                         | Cierra el cargue y genera una fotografía histórica         | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/requisitions/:id/candidates/reopen                                                                                        | Reabre el proceso de cargue de candidatos                  | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/requisitions/:id/candidates/preselect                                                                                     | Confirma la preselección de uno o varios candidatos        | Usuario creador de la requisición                               |
| PATCH  | /api/human-talent/requisitions/:id/candidates/:candidateId                                                                                  | Actualiza los datos o la hoja de vida de un candidato      | Auxiliar de Talento Humano                                      |
| DELETE | /api/human-talent/requisitions/:id/candidates/:candidateId                                                                                  | Elimina un candidato y su hoja de vida                     | Auxiliar de Talento Humano                                      |
| GET    | /api/human-talent/candidate-validations                                                                                                      | Obtiene los candidatos disponibles para validación         | Auxiliar TH / Jefe TH / ADMIN / Creador autorizado: solo sus requisiciones |
| GET    | /api/human-talent/candidate-validations/:candidateId                                                                                         | Obtiene el detalle completo de la validación               | Auxiliar TH / Jefe TH / ADMIN / Creador autorizado: solo sus requisiciones |
| POST   | /api/human-talent/candidate-validations/:candidateId                                                                                         | Inicia la validación y guarda el concepto de aplicación    | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/candidate-validations/:candidateId/position                                                                                | Guarda la validación de cargo                              | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/candidate-validations/:candidateId/candidate                                                                               | Completa la validación del postulante                      | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/candidate-validations/:candidateId/technical-evaluation                                                                             | Guarda las calificaciones de la Evaluación Técnica        | Auxiliar de Talento Humano                                      |
| PATCH  | /api/human-talent/candidate-validations/:candidateId/technical-evaluation/approve                                                                     | Confirma la Evaluación Técnica y determina si continúa    | Exclusivamente el usuario creador de la requisición             |


---

# Eventos Socket.IO funcionales

| Evento           | Descripción                                                           | Uso     |
| ---------------- | --------------------------------------------------------------------- | ------- |
| connection       | Conecta un usuario autenticado al socket                              | Backend |
| join_pqr         | Une al usuario a la sala si es creador, AGENT asignado o ADMIN         | Cliente |
| joined_pqr       | Confirma que el usuario ingresó al chat                               | Backend |
| send_pqr_message | Envía un mensaje si el usuario tiene acceso y la PQR no está cerrada  | Cliente |
| new_pqr_message  | Recibe un nuevo mensaje de texto o con archivo adjunto en tiempo real | Backend |
| socket_error     | Informa errores de autenticación, permisos o validación               | Backend |
| disconnect       | Detecta la desconexión del usuario                                    | Backend |

---

# Eventos que generan notificaciones

## Notificaciones del módulo PQR

| Acción                          | Quién ejecuta | Quién recibe                          | Tipo de notificación          |
| ------------------------------- | ------------- | ------------------------------------- | ----------------------------- |
| Crear una PQR                   | USER o AGENT  | ADMIN y AGENT                         | NEW_PQR                       |
| Tomar una PQR                   | AGENT         | ADMIN y creador de la PQR             | PQR_TAKEN                     |
| Cerrar una PQR                  | ADMIN o AGENT | Creador de la PQR                     | PQR_CLOSED                    |
| Calificar una PQR               | USER o AGENT  | ADMIN y AGENT asignado                | PQR_RATED                     |
| Asignar una PQR por primera vez | ADMIN         | AGENT asignado y creador de la PQR    | PQR_ASSIGNED / PQR_TAKEN      |
| Reasignar una PQR               | ADMIN         | Nuevo AGENT y AGENT anterior          | PQR_ASSIGNED / PQR_UNASSIGNED |
| Desasignar una PQR              | ADMIN         | AGENT retirado                        | PQR_UNASSIGNED                |

---

## Notificaciones del módulo Talento Humano

| Acción                                | Quién ejecuta                | Quién recibe               | Tipo de notificación                     |
| ------------------------------------- | ---------------------------- | -------------------------- | ---------------------------------------- |
| Crear requisición                     | Usuario con cargo autorizado | Primer aprobador           | REQUISITION_PENDING_APPROVAL             |
| Aprobar paso de requisición           | Aprobador actual             | Siguiente aprobador        | REQUISITION_PENDING_APPROVAL             |
| Finalizar aprobación jerárquica       | Último aprobador             | Auxiliar de Talento Humano | HIRING_CONFIRMATION_PENDING              |
| Rechazar o cancelar requisición       | Aprobador actual             | Usuario creador            | REQUISITION_REJECTED                     |
| Crear confirmación de contratación    | Auxiliar de Talento Humano   | Jefe de Talento Humano     | HIRING_CONFIRMATION_PENDING              |
| Aprobar completamente la confirmación | Jefe de Talento Humano       | Usuario creador            | HIRING_CONFIRMATION_APPROVED             |
| Habilitar cargue con auxiliar activo  | Jefe de Talento Humano       | Auxiliar de Talento Humano | REQUISITION_CANDIDATES_PENDING           |
| Habilitar cargue sin auxiliar activo  | Jefe de Talento Humano       | Jefe de Talento Humano     | REQUISITION_CANDIDATES_WITHOUT_ASSISTANT |
| Cerrar cargue de candidatos           | Auxiliar de Talento Humano   | Usuario creador            | REQUISITION_CANDIDATES_CLOSED            |
| Reabrir cargue de candidatos          | Auxiliar de Talento Humano   | Usuario creador            | REQUISITION_CANDIDATES_REOPENED          |
| Rechazar o cancelar confirmación      | Aprobador actual TH          | Usuario creador            | HIRING_CONFIRMATION_REJECTED             |
| Completar las dos calificaciones técnicas | Auxiliar de Talento Humano   | Usuario creador            | CANDIDATE_TECHNICAL_EVALUATION_PENDING |

---