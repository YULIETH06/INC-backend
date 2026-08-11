# 1. Configuración de módulos ECMAScript

## Archivo `package.json`

Se modificó:

```json
"type": "commonjs"
```

por:

```json
"type": "module"
```

### Descripción

Esta configuración permite utilizar la sintaxis moderna de JavaScript:

```ts
import/export
```

compatible con Prisma y TypeScript modernos.

---

# 2. Creación de `app.ts`

## Archivo creado

```txt
src/app.ts
```

### Descripción

Este archivo contiene la configuración principal de Express:

- Inicialización de Express
- Configuración de middlewares
- Configuración de CORS
- Registro de rutas
- Exportación de la aplicación

---

# 3. Creación de `server.ts`

## Archivo creado

```txt
src/server.ts
```

### Descripción

Este archivo es el punto de entrada del backend.

Se encarga de:

- Importar la aplicación Express
- Definir el puerto del servidor
- Ejecutar el servidor backend

---

# 4. Configuración de scripts

## Archivo modificado

```txt
package.json
```

### Script agregado

```json
"scripts": {
  "dev": "tsx watch src/server.ts"
}
```

### Descripción

Este script permite ejecutar el backend en modo desarrollo mediante el comando:

```bash
npm run dev
```

El servidor se reinicia automáticamente al detectar cambios en el proyecto.

---

# 5. Creación de Prisma Client

## Archivo creado

```txt
src/prisma/client.ts
```

### Descripción

Se creó la instancia principal de Prisma Client para permitir la conexión y consultas a MySQL desde cualquier parte del backend.

---

# 6. Creación de controlador de usuarios

## Archivo creado

```txt
src/controllers/user.controller.ts
```

### Descripción

Se creó el controlador inicial de usuarios.

Actualmente contiene:

- Endpoint para obtener usuarios
- Respuesta JSON de prueba
- Configuración inicial de Request y Response con TypeScript

---

# 7. Creación de rutas de usuarios

## Archivo creado

```txt
src/routes/user.routes.ts
```

### Descripción

Se creó el archivo encargado de manejar las rutas relacionadas con usuarios.

Actualmente incluye:

```txt
GET /users
```

---

# 8 Creación de rutas principales

## Archivo creado

```txt
src/routes/index.ts
```

### Descripción

Este archivo centraliza todas las rutas del backend.

Actualmente incluye:

| Ruta        | Descripción                       |
| ----------- | --------------------------------- |
| /api/health | Verificación del estado de la API |
| /api/users  | Rutas relacionadas con usuarios   |

---


---

# 9. Implementación de autenticación JWT

## Descripción

Se implementó el sistema de autenticación mediante JSON Web Token (JWT) para permitir el acceso seguro a rutas privadas del backend.

El sistema permite:

- Validar credenciales de usuario
- Generar tokens JWT
- Proteger endpoints privados
- Obtener información del usuario autenticado
- Validar sesiones seguras

---

# 10. Creación de Middlewares

## Middleware de Autenticación JWT

## Archivo creado

```txt
src/middlewares/auth.middleware.ts
```

### Descripción

Se creó el middleware encargado de proteger rutas privadas del backend.

Funciones principales:

- Leer token desde los headers
- Validar token JWT
- Verificar autenticación
- Denegar acceso no autorizado
- Adjuntar usuario autenticado al request

## Middleware de Roles

### Archivo creado

```txt
src/middlewares/role.middleware.ts
```

---

## Descripción

Se creó un middleware reutilizable encargado de validar que el usuario autenticado tenga uno o varios roles permitidos antes de acceder a rutas protegidas.

Este middleware reemplaza el uso exclusivo de `adminMiddleware`, ya que permite validar diferentes tipos de usuarios como `ADMIN`, `AGENT` o `USER`, según la necesidad de cada endpoint.

---

## Roles disponibles

```txt
USER
ADMIN
AGENT
```

---

## Funcionalidades

- Verifica que exista un usuario autenticado.
- Valida que el rol del usuario esté dentro de los roles permitidos.
- Deniega el acceso a usuarios sin permisos.
- Permite proteger rutas según uno o varios roles.
- Reutiliza la misma lógica para rutas de administrador, agente o usuario autenticado.

---

## Uso del middleware

Este middleware debe ejecutarse después de `authMiddleware`, porque primero se debe validar el token JWT y cargar la información del usuario autenticado.

---

## Ejemplo para ruta solo ADMIN

```ts
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getUsers
);
```

---

## Ejemplo para ruta ADMIN y AGENT

```ts
router.get(
  "/available",
  authMiddleware,
  roleMiddleware(["ADMIN", "AGENT"]),
  getAvailablePqrsController
);
```

---

## Ejemplo para ruta USER, ADMIN y AGENT

```ts
router.post(
  "/pqrs",
  authMiddleware,
  roleMiddleware(["USER", "ADMIN", "AGENT"]),
  createPqrController
);
```

---

# 11. Protección de rutas privadas

## Middleware aplicado

```ts
authMiddleware
```

### Descripción

El middleware se implementó en rutas privadas para validar autenticación antes de ejecutar el controlador.

Ejemplo:

```ts
router.get("/", authMiddleware, getProfile);
```

### Función del controlador Profile

El controlador `getProfile` se creó para manejar la funcionalidad de perfil del usuario autenticado dentro del backend.

Su función principal en el proyecto será permitir que el sistema identifique quién es el usuario que inició sesión mediante el token JWT y devolver su información de forma segura.

En el proyecto tendrá funciones importantes como:

- Obtener los datos del usuario autenticado
- Validar que el usuario tenga sesión activa
- Proteger información privada
- Permitir acceso únicamente a usuarios autenticados
- Servir como base para futuras funcionalidades privadas

Este controlador será fundamental porque muchas funcionalidades futuras dependerán del usuario autenticado, por ejemplo:

- Perfil de usuario
- Edición de perfil
- Configuraciones de cuenta
- Panel privado
- Historial del usuario
- Roles y permisos
- Favoritos
- Publicaciones propias
- Gestión de datos personales

---

### Proceso que realiza actualmente

El controlador actualmente realiza el siguiente proceso:

1. Leer el usuario autenticado desde el token JWT.
2. Obtener el `id` del usuario autenticado.
3. Consultar el usuario en MySQL mediante Prisma.
4. Retornar únicamente información segura.
5. Evitar exponer la contraseña.
6. Manejar errores y accesos no autorizados.

---

# 12. Configuración de Seed en Prisma

## Descripción

Se configuró el archivo de seed de Prisma para insertar datos iniciales necesarios para el funcionamiento del sistema.

El seed permite cargar información base en la base de datos después de crear las tablas con las migraciones.

---

## Archivo creado

```txt
prisma/seed.js
```

## ¿Para qué sirve el archivo `seed.js`?

El archivo `seed.js` sirve para insertar datos iniciales en la base de datos.

La migración crea las tablas, pero no llena información dentro de ellas.

---

# 13. Configuración del seed en `package.json`

## Archivo modificado

```txt
package.json
```

## Configuración agregada

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

---

## Descripción

Esta configuración le indica a Prisma qué archivo debe ejecutar cuando se use el comando:

```bash
npx prisma db seed
```

---