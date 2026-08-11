# Documentación de Socket.IO

## Descripción general

El backend utiliza **Socket.IO** para manejar funcionalidades en tiempo real dentro del sistema.

Actualmente Socket.IO se usa para tres procesos principales:

```txt
1. Chat en tiempo real de las PQR.
2. Notificaciones internas en tiempo real.
3. Actualización en tiempo real del contador de mensajes sin revisar.
```

El socket se conecta mediante autenticación JWT, por lo tanto, solo los usuarios autenticados pueden acceder a los eventos en tiempo real.

---

# Estructura de archivos Socket.IO

La estructura recomendada para organizar los sockets en el backend es la siguiente:

```txt
src/
├── config/
│   └── socket.ts
│
├── sockets/
│   ├── index.socket.ts
│   ├── pqr.socket.ts
│   └── notification.socket.ts
│
├── middlewares/
│   └── socketAuth.middleware.ts
│
└── interfaces/
    └── socket.interface.ts
```

---

## Responsabilidad de cada archivo

| Archivo                          | Responsabilidad                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `config/socket.ts`               | Inicializa Socket.IO, aplica el middleware de autenticación y guarda la instancia global de `io`.     |
| `sockets/index.socket.ts`        | Maneja la conexión general del usuario, lo une a su sala personal y registra los eventos específicos. |
| `sockets/pqr.socket.ts`          | Maneja únicamente los eventos relacionados con el chat de PQR.                                        |
| `sockets/notification.socket.ts` | Emite notificaciones en tiempo real a un usuario específico.                                          |
| `socketAuth.middleware.ts`       | Valida el token JWT enviado desde el frontend al conectarse por socket.                               |
| `socket.interface.ts`            | Define el tipo personalizado del socket autenticado.                                                  |

---

# Configuración principal de Socket.IO

## Archivo

```txt
src/config/socket.ts
```

## Descripción

Este archivo se encarga de inicializar Socket.IO dentro del servidor HTTP.

También aplica el middleware de autenticación por JWT y registra los eventos generales del socket.

Además, guarda la instancia activa de Socket.IO en una variable interna para que otros servicios del backend puedan emitir eventos en tiempo real.

---

## Código base

```ts
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "../middlewares/socketAuth.middleware.js";
import { registerSockets } from "../sockets/index.socket.js";

let ioInstance: Server | null = null;

// Inicializa Socket.IO dentro del servidor HTTP
export const initSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.use(socketAuthMiddleware);

    registerSockets(io);

    ioInstance = io;

    return io;
};

// Retorna la instancia activa de Socket.IO
export const getIo = () => {
    return ioInstance;
};
```

---

## Explicación

### `initSocket`

Inicializa Socket.IO dentro del servidor HTTP.

Dentro de esta función se realizan tres acciones principales:

```txt
1. Crear la instancia de Socket.IO.
2. Aplicar el middleware de autenticación JWT.
3. Registrar los eventos generales del socket.
```

---

### `getIo`

Permite obtener la instancia activa de Socket.IO desde otros servicios del backend.

Esto es necesario porque algunas acciones del sistema no nacen directamente desde un evento socket, sino desde endpoints HTTP.

Por ejemplo:

```txt
Crear una PQR
Tomar una PQR
Cerrar una PQR
Calificar una PQR
Enviar mensaje con archivo adjunto
Actualizar contador de mensajes sin revisar
```

Estas acciones se ejecutan desde servicios normales del backend, pero también pueden necesitar emitir eventos en tiempo real.

---

# Socket general

## Archivo

```txt
src/sockets/index.socket.ts
```

## Descripción

Este archivo funciona como la entrada general de Socket.IO.

Aquí se maneja la conexión del usuario autenticado y se registra su sala personal para recibir notificaciones y actualizaciones en tiempo real.

También se registran los eventos específicos del chat de PQR.

---

## Código base

```ts
import type { Server } from "socket.io";
import type { AuthSocket } from "../interfaces/socket.interface.js";
import { registerPqrSocketEvents } from "./pqr.socket.js";

// Registra la conexión general de Socket.IO
export const registerSockets = (io: Server) => {
    io.on("connection", (socket: AuthSocket) => {
        console.log("Usuario conectado por socket:", socket.user?.email);

        // Une al usuario autenticado a su sala personal para notificaciones
        if (socket.user) {
            socket.join(`user_${socket.user.id}`);
        }

        // Registra los eventos del chat de PQR
        registerPqrSocketEvents(io, socket);

        socket.on("disconnect", () => {
            console.log("Usuario desconectado:", socket.user?.email);
        });
    });
};
```

---

## Sala personal del usuario

Cada usuario autenticado se une automáticamente a una sala personal:

```txt
user_ID
```

Ejemplo:

```txt
user_1
user_2
user_3
```

Esta sala se utiliza para enviar información en tiempo real únicamente al usuario correspondiente.

Ejemplo para notificaciones:

```ts
io.to(`user_${userId}`).emit("new_notification", notification);
```

Ejemplo para contador de mensajes sin revisar:

```ts
io.to(`user_${userId}`).emit("pqr_unread_count_updated", {
    pqrId,
    unreadMessagesCount,
});
```

---

# Socket del chat de PQR

## Archivo

```txt
src/sockets/pqr.socket.ts
```

## Descripción

Este archivo contiene únicamente los eventos relacionados con el chat de las PQR.

No debe encargarse de registrar la conexión general del socket ni de manejar notificaciones.

---

## Eventos registrados

| Evento                     | Descripción                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `join_pqr`                 | Une al usuario autenticado a la sala de una PQR.                                             |
| `joined_pqr`               | Confirma que el usuario ingresó correctamente al chat de la PQR.                             |
| `send_pqr_message`         | Envía un mensaje dentro del chat de una PQR.                                                 |
| `new_pqr_message`          | Emite el nuevo mensaje a todos los usuarios dentro de la sala de la PQR.                     |
| `pqr_unread_count_updated` | Emite el contador actualizado de mensajes sin revisar de una PQR al usuario correspondiente. |
| `socket_error`             | Informa errores de validación, autenticación o permisos.                                     |

---

## Salas de PQR

Cada PQR tiene una sala propia:

```txt
pqr_ID
```

Ejemplo:

```txt
pqr_1
pqr_5
pqr_10
```

Cuando un usuario entra al chat de una PQR, se une a su sala correspondiente.

---

## Flujo del chat

```txt
1. El frontend conecta el socket con token JWT.
2. El usuario emite join_pqr.
3. El backend valida si puede acceder a la PQR.
4. Si tiene permiso, lo une a la sala pqr_ID.
5. El usuario emite send_pqr_message.
6. El backend guarda el mensaje en la base de datos.
7. El backend emite new_pqr_message a la sala pqr_ID.
8. Los usuarios dentro de esa sala reciben el mensaje en tiempo real.
9. El backend calcula el contador de mensajes sin revisar para el receptor.
10. El backend emite pqr_unread_count_updated a la sala personal del receptor.
```

---

## Ejemplo de envío de mensaje

```txt
Frontend emite:
send_pqr_message
```

```json
{
  "pqrId": 10,
  "content": "Hola, necesito información sobre mi solicitud."
}
```

---

## Ejemplo de mensaje recibido

```txt
Backend emite:
new_pqr_message
```

```json
{
  "id": 1,
  "content": "Hola, necesito información sobre mi solicitud.",
  "createdAt": "2026-06-03T15:30:00.000Z",
  "pqrId": 10,
  "senderId": 3,
  "sender": {
    "id": 3,
    "name": "Juan Pérez",
    "email": "juan@gmail.com",
    "role": "USER"
  }
}
```

---

# Contador de mensajes sin revisar

## Descripción

El sistema cuenta con un evento en tiempo real para actualizar el contador de mensajes sin revisar de una PQR.

Este contador se usa para que el usuario o agente pueda identificar si una solicitud tiene nuevos mensajes pendientes por leer, sin necesidad de recargar la página.

El contador aplica principalmente en:

```txt
USER  -> Mis PQR
AGENT -> PQR asignadas
```

---

## Evento emitido

```txt
pqr_unread_count_updated
```

---

## Cuándo se emite

Este evento se emite cuando se envía un nuevo mensaje dentro del chat de una PQR.

Puede emitirse en dos casos:

```txt
1. Cuando se envía un mensaje de texto mediante Socket.IO.
2. Cuando se envía un mensaje con archivo adjunto mediante endpoint HTTP.
```

---

## Sala donde se emite

El evento se emite a la sala personal del usuario receptor:

```txt
user_ID
```

Ejemplo:

```txt
user_5
```

Esto permite actualizar el contador únicamente al usuario que debe ver el mensaje como pendiente.

---

## Payload emitido

```json
{
  "pqrId": 10,
  "unreadMessagesCount": 2
}
```

---

## Campos del payload

| Campo                 | Tipo   | Descripción                                           |
| --------------------- | ------ | ----------------------------------------------------- |
| `pqrId`               | number | Identificador de la PQR cuyo contador fue actualizado |
| `unreadMessagesCount` | number | Cantidad de mensajes pendientes por revisar           |

---

## Ejemplo de emisión desde backend

```ts
io.to(`user_${userId}`).emit("pqr_unread_count_updated", {
    pqrId,
    unreadMessagesCount,
});
```

---

## Funcionamiento general

```txt
1. Un usuario envía un mensaje en una PQR.
2. El backend guarda el mensaje.
3. El backend identifica quién debe recibir el contador.
4. El backend calcula los mensajes sin revisar.
5. El backend emite pqr_unread_count_updated a la sala personal del usuario receptor.
6. El frontend recibe el evento y actualiza el contador en la lista de PQR.
```

---

# Socket de notificaciones

## Archivo

```txt
src/sockets/notification.socket.ts
```

## Descripción

Este archivo se encarga únicamente de emitir notificaciones en tiempo real a un usuario específico.

No crea notificaciones en la base de datos.
La creación de notificaciones se realiza desde `notification.service.ts`.

---

## Código base

```ts
import type { Server } from "socket.io";

// Emite una notificación en tiempo real a un usuario específico
export const emitNotificationToUser = (
    io: Server,
    userId: number,
    notification: unknown
) => {
    io.to(`user_${userId}`).emit("new_notification", notification);
};
```

---

## Evento emitido

| Evento             | Descripción                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `new_notification` | Envía una nueva notificación en tiempo real al usuario correspondiente. |

---

## Ejemplo de notificación emitida

```json
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
```

---

# Diferencia entre chat, contador y notificaciones

## Chat

El chat nace directamente desde un evento Socket.IO.

```txt
Frontend
→ send_pqr_message
→ pqr.socket.ts
→ pqrMessage.service.ts
→ new_pqr_message
→ Frontend
```

Por eso `pqr.socket.ts` tiene acceso directo a `io` y puede emitir el mensaje inmediatamente.

---

## Contador de mensajes sin revisar

El contador se actualiza cuando se crea un nuevo mensaje en una PQR.

Puede nacer desde Socket.IO o desde HTTP, dependiendo del tipo de mensaje.

```txt
Mensaje de texto:
Frontend
→ send_pqr_message
→ pqr.socket.ts
→ guardar mensaje
→ calcular contador
→ pqr_unread_count_updated
→ Frontend
```

```txt
Mensaje con archivo:
Frontend
→ POST /api/pqrs/:id/messages/attachment
→ pqrMessage.controller.ts
→ guardar mensaje con archivo
→ calcular contador
→ pqr_unread_count_updated
→ Frontend
```

---

## Notificaciones

Las notificaciones normalmente nacen desde acciones HTTP del sistema.

Ejemplo:

```txt
POST /api/pqrs
PATCH /api/pqrs/:id/take
PATCH /api/pqrs/:id/status
PATCH /api/pqrs/:id/rate
```

El flujo es:

```txt
Endpoint HTTP
→ pqr.service.ts
→ notification.service.ts
→ guardar notificación en base de datos
→ getIo()
→ emitNotificationToUser()
→ new_notification
→ Frontend
```

Por eso `notification.service.ts` necesita obtener la instancia de Socket.IO mediante `getIo()`.

---

# Eventos Socket.IO utilizados

| Evento                     | Descripción                                                        | Uso     |
| -------------------------- | ------------------------------------------------------------------ | ------- |
| `connection`               | Conecta un usuario autenticado al socket.                          | Backend |
| `disconnect`               | Detecta la desconexión del usuario.                                | Backend |
| `join_pqr`                 | Une al usuario a la sala de una PQR.                               | Cliente |
| `joined_pqr`               | Confirma que el usuario ingresó al chat de la PQR.                 | Backend |
| `send_pqr_message`         | Envía un mensaje dentro de una PQR.                                | Cliente |
| `new_pqr_message`          | Recibe un nuevo mensaje del chat en tiempo real.                   | Backend |
| `pqr_unread_count_updated` | Recibe el contador actualizado de mensajes sin revisar de una PQR. | Backend |
| `new_notification`         | Recibe una nueva notificación en tiempo real.                      | Backend |
| `socket_error`             | Informa errores de autenticación, permisos o validación.           | Backend |

---

# Eventos que generan notificaciones en tiempo real

| Acción            | Endpoint relacionado         | Evento emitido     |
| ----------------- | ---------------------------- | ------------------ |
| Crear una PQR     | `POST /api/pqrs`             | `new_notification` |
| Tomar una PQR     | `PATCH /api/pqrs/:id/take`   | `new_notification` |
| Cerrar una PQR    | `PATCH /api/pqrs/:id/status` | `new_notification` |
| Calificar una PQR | `PATCH /api/pqrs/:id/rate`   | `new_notification` |

---

# Eventos que actualizan el contador de mensajes sin revisar

| Acción                     | Origen                                   | Evento emitido             |
| -------------------------- | ---------------------------------------- | -------------------------- |
| Enviar mensaje de texto    | `send_pqr_message`                       | `pqr_unread_count_updated` |
| Enviar mensaje con archivo | `POST /api/pqrs/:id/messages/attachment` | `pqr_unread_count_updated` |

---

# Prueba manual del socket

Durante el desarrollo se puede utilizar un archivo temporal llamado:

```txt
test-socket.ts
```

Este archivo permite simular un cliente conectado al backend y validar que el chat de PQR funcione correctamente en tiempo real.

---

## Objetivo de la prueba

Verificar que el backend pueda:

```txt
1. Conectar un usuario mediante Socket.IO.
2. Recibir y validar el token JWT.
3. Unir al usuario a la sala de una PQR específica.
4. Enviar un mensaje de prueba.
5. Recibir el mensaje en tiempo real.
6. Guardar el mensaje correctamente en la base de datos.
7. Consultar posteriormente el mensaje desde el historial de la PQR.
8. Emitir el contador actualizado de mensajes sin revisar cuando corresponda.
```

---

## Comando de ejecución

```bash
npx tsx test-socket.ts
```

---

## Valores que se deben modificar antes de ejecutar

```ts
const TOKEN = "PEGA_AQUI_TU_TOKEN";
const PQR_ID = 1;
```

El campo `TOKEN` debe contener un token JWT válido generado desde el login del sistema.

El campo `PQR_ID` debe contener el id real de una PQR existente en la base de datos.

---

## Resultado esperado

```txt
Conectado al socket: abc123
Unido al chat: { message: 'Te uniste al chat de la PQR', pqrId: 1 }
Nuevo mensaje recibido:
{
  id: 1,
  content: 'Hola, este es un mensaje de prueba desde Socket.IO.',
  createdAt: '2026-05-28T20:30:00.000Z',
  pqrId: 1,
  senderId: 2,
  sender: {
    id: 2,
    name: 'Juan',
    email: 'juan@gmail.com',
    role: 'USER'
  }
}
```

También se puede validar que el usuario receptor reciba el evento:

```txt
pqr_unread_count_updated
```

Con un payload similar a:

```json
{
  "pqrId": 1,
  "unreadMessagesCount": 1
}
```

---

# Nota importante

El archivo `test-socket.ts` es temporal y se utiliza únicamente para pruebas durante el desarrollo.

Cuando el frontend implemente completamente la conexión con `socket.io-client`, este archivo puede eliminarse o conservarse como referencia técnica para futuras pruebas del chat en tiempo real.

---

# Conclusión

La organización actual separa las responsabilidades de Socket.IO de forma más clara:

```txt
config/socket.ts
→ Inicializa Socket.IO y guarda la instancia global.

sockets/index.socket.ts
→ Maneja la conexión general del usuario.

sockets/pqr.socket.ts
→ Maneja solo el chat de PQR.

sockets/notification.socket.ts
→ Emite notificaciones en tiempo real.
```

Además, el evento `pqr_unread_count_updated` permite actualizar en tiempo real el contador de mensajes sin revisar sin recargar la página.

Esta separación evita que el archivo `pqr.socket.ts` tenga responsabilidades generales o de notificaciones, manteniendo el backend más limpio, entendible y escalable.
