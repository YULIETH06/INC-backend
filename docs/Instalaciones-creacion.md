# Instalación Inicial Backend

## 1. Inicialización del proyecto Node.js

### Comando ejecutado

```bash
npm init -y
```

### Descripción

Este comando crea el archivo `package.json`, el cual contiene la configuración principal del proyecto backend.

---

# 2. Instalación de dependencias principales

### Comando ejecutado

```bash
npm install express cors dotenv bcryptjs jsonwebtoken prisma @prisma/client
```

### Dependencias instaladas

| Dependencia    | Descripción                                   |
| -------------- | --------------------------------------------- |
| express        | Framework para crear APIs y servidor backend  |
| cors           | Permite comunicación entre frontend y backend |
| dotenv         | Maneja variables de entorno                   |
| bcryptjs       | Encriptación de contraseñas                   |
| jsonwebtoken   | Generación de tokens JWT                      |
| prisma         | ORM para manejo de base de datos              |
| @prisma/client | Cliente Prisma para consultas                 |


## Instalación de tipados para Express y Cors

### Comando ejecutado

```bash
npm install -D @types/express @types/cors
```

### Descripción

Se instalaron los tipados de TypeScript para:

- Express
- Cors

Esto permite obtener autocompletado, validaciones y tipado estático durante el desarrollo.


---

# 3. Instalación de dependencias de desarrollo

### Comando ejecutado

```bash
npm install -D typescript ts-node-dev @types/node
```

### Dependencias instaladas

| Dependencia | Descripción                       |
| ----------- | --------------------------------- |
| typescript  | Permite usar TypeScript           |
| ts-node-dev | Ejecuta TypeScript en desarrollo  |
| @types/node | Tipado de Node.js para TypeScript |

---

# 4. Inicialización de TypeScript

### Comando ejecutado

```bash
npx tsc --init
```

### Resultado

Se creó el archivo:

```txt
tsconfig.json
```

Este archivo contiene la configuración de TypeScript para el proyecto.

---

#5 . Instalación de TSX

### Comando ejecutado

```bash
npm install -D tsx
```

### Descripción

`tsx` permite ejecutar archivos TypeScript directamente sin necesidad de compilar manualmente el proyecto.

También permite reiniciar automáticamente el servidor cuando se detectan cambios en el proyecto.

---

# 6. Inicialización de Prisma

### Comando ejecutado

```bash
npx prisma init
```

### Resultado

Se crearon los siguientes archivos:

```txt
prisma/
.env
prisma.config.ts
.gitignore
```

### Descripción

Estos archivos permiten configurar Prisma y la conexión con la base de datos.

---

# 7 Configuración de Prisma para MySQL

## Archivo `schema.prisma`

### Descripción

Este archivo define:

- El proveedor de base de datos
- Los modelos de Prisma
- La estructura de tablas
- La generación del cliente Prisma

---

# 8. Configuración de Prisma

## Archivo `prisma.config.ts`

### Descripción

Este archivo contiene la configuración principal de Prisma y la conexión con MySQL mediante variables de entorno.


---

# 9. Creación y ejecución de migraciones

### Comando ejecutado

```bash
npx prisma migrate dev --name init
```

### Descripción

Este comando:

- Crea la base de datos si no existe
- Genera las migraciones de Prisma
- Ejecuta las migraciones en MySQL
- Sincroniza la base de datos con el archivo `schema.prisma`

### Resultado

Se creó la carpeta:

```txt
prisma/migrations/
```

Prisma generó automáticamente el archivo SQL correspondiente a la migración inicial.

### Mensaje esperado

```txt
Your database is now in sync with your schema.
```

---

# 10. Instalación de JsonWebToken

### Comando ejecutado

```bash
npm install jsonwebtoken
```

### Descripción

Se instaló la librería `jsonwebtoken`, utilizada para:

- Generar tokens JWT
- Validar autenticación
- Manejar sesiones mediante tokens

---

# 11. Instalación de tipados para JsonWebToken

### Comando ejecutado

```bash
npm install -D @types/jsonwebtoken
```

### Descripción

Se instalaron los tipados de TypeScript para `jsonwebtoken`.

Esto permite:

- Autocompletado
- Validación de tipos
- Mejor soporte en el editor
- Integración correcta con TypeScript

---

# 12. Instalación de dependencias para carga y procesamiento de archivos

## Instalación de Multer y XLSX

### Comando ejecutado

```bash
npm install multer xlsx
```

### Descripción

Se instalaron las dependencias necesarias para recibir y procesar archivos dentro del backend.

`multer` se utiliza para recibir archivos enviados mediante `multipart/form-data`, como archivos Excel para la carga masiva de usuarios e imágenes o documentos adjuntos en el chat de PQR.

Estas dependencias permiten recibir, leer y procesar archivos enviados desde Postman o desde el frontend.

### Dependencias instaladas

| Dependencia | Descripción                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| multer      | Middleware de Express utilizado para recibir archivos enviados mediante `multipart/form-data`         |
| xlsx        | Librería utilizada para leer archivos Excel y convertir sus hojas en datos procesables por el backend |

---

## Instalación de tipados para Multer

### Comando ejecutado

```bash
npm install -D @types/multer
```

### Descripción

Se instalaron los tipados de TypeScript para `multer`.

Esto permite:

- Usar `req.file` con soporte de TypeScript
- Validar correctamente los tipos del archivo recibido
- Obtener autocompletado en el editor
- Evitar errores de tipado durante el desarrollo

---

# 13. Instalación de Socket.IO

## Comando ejecutado

```bash
npm install socket.io
```

## Descripción

Se instaló la dependencia `socket.io`, utilizada para implementar comunicación en tiempo real entre el backend y el frontend.

En el sistema de PQR, Socket.IO permite que los usuarios, agentes y administradores puedan enviar y recibir mensajes dentro del chat de una PQR sin necesidad de recargar la página.

## Dependencia instalada

| Dependencia | Descripción                                                                    |
| ----------- | ------------------------------------------------------------------------------ |
| socket.io   | Librería utilizada para habilitar comunicación en tiempo real mediante eventos |

---

## Uso dentro del proyecto

Socket.IO se utiliza en el módulo de chat de PQR para:

* Conectar usuarios autenticados mediante JWT.
* Permitir que un usuario se una a la sala de una PQR específica.
* Enviar mensajes en tiempo real.
* Recibir mensajes nuevos automáticamente.
* Mantener la conversación separada por cada PQR.
* Emitir errores de autenticación, permisos o validación.

---

# 14. Instalación de Socket.IO Client para pruebas

## Comando ejecutado

```bash
npm install -D socket.io-client
```

## Descripción

Se instaló `socket.io-client` como dependencia de desarrollo para realizar pruebas temporales de conexión con Socket.IO desde el backend.

Esta dependencia permite simular un cliente conectado al socket sin necesidad de tener aún implementado el frontend.

## Dependencia instalada

| Dependencia      | Descripción                                                           |
| ---------------- | --------------------------------------------------------------------- |
| socket.io-client | Cliente de Socket.IO utilizado para probar la conexión en tiempo real |

---

## Uso dentro del proyecto

Esta dependencia se utilizó para crear un archivo temporal de prueba llamado:

```txt
test-socket.ts
```

El archivo permite validar:

* Conexión al socket.
* Envío del token JWT.
* Unión a una sala de PQR.
* Envío de mensajes.
* Recepción de mensajes en tiempo real.
* Manejo de errores del socket.

---
