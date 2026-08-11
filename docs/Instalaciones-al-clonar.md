# Configuración del Proyecto Clonado

Esta guía explica cómo configurar y ejecutar el backend localmente después de clonar el repositorio.

---

# 1. Clonar el repositorio

```bash
git clone + url
```

---

# 2. Instalar dependencias

```bash
npm install
```

## Descripción

Este comando instalará automáticamente todas las dependencias definidas en:

```txt
package.json
```

Incluyendo:

- Express
- Prisma
- TypeScript
- JWT
- Cors
- Dotenv
- TSX
- Tipados de TypeScript

---

# 3. Configurar variables de entorno

Crear un archivo:

```txt
.env
```

## Ejemplo

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/backend_inc"
JWT_SECRET="secret_key"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

## Descripción

Las variables de entorno permiten configurar datos importantes del proyecto sin escribirlos directamente en el código.

La variable:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/backend_inc"
```

se utiliza para conectar el backend con la base de datos MySQL. En esta variable se especifica el usuario, la contraseña, el servidor, el puerto y el nombre de la base de datos.

La variable:

```env
JWT_SECRET="secret_key"
```

se utiliza para firmar y validar los tokens de autenticación JWT. Esta clave permite proteger las sesiones de los usuarios dentro del sistema.

La variable:

```env
PORT=3000
```

indica el puerto en el que se ejecutará el servidor backend.

La variable:

```env
FRONTEND_URL="http://localhost:5173"
```

indica la dirección donde se ejecuta el frontend. Esta variable se utiliza principalmente para permitir la comunicación entre el frontend y el backend, por ejemplo, en la configuración de CORS.

---

# 4. Generar Prisma Client

## Comando

```bash
npx prisma generate
```

## Descripción

Genera automáticamente el cliente de Prisma necesario para conectarse a la base de datos.

---

# 5. Ejecutar migraciones

## Opción 1: Crear la base de datos con migraciones (Recomendado)

### Comando

```bash
npx prisma migrate dev
```

### Descripción

Aplica todas las migraciones almacenadas en `prisma/migrations`, crea o actualiza la base de datos y mantiene un historial de los cambios realizados. Esta es la opción recomendada para trabajar en equipo.

---

## Opción 2: Crear la base de datos directamente desde el esquema

### Comando

```bash
npx prisma db push
```

### Descripción

Sincroniza la base de datos directamente con el archivo:

```txt
prisma/schema.prisma
```

Crea o actualiza las tablas sin utilizar las migraciones. Es útil para crear la base de datos rápidamente durante el desarrollo o para pruebas, pero **no genera un historial de migraciones**, por lo que no se recomienda para proyectos colaborativos.

---

# 6. Cargar la estructura organizacional de Talento Humano

## Comando

```bash
npx tsx prisma/seed-humanTalent.ts
```

## Descripción

Este comando ejecuta directamente el archivo:

```text
prisma/seed-humanTalent.ts
```

El archivo carga o actualiza la información necesaria para el módulo de Talento Humano.

Entre los datos cargados se encuentran:

* Departamentos y áreas.
* Perfiles de cargo.
* Cargos aprobadores.
* Jerarquía organizacional.
* Departamentos superiores.
* Configuración del flujo de Talento Humano.
* Cargos responsables de cada departamento.
* Requisitos fijos de los perfiles de cargo.

Este seed debe ejecutarse después de crear o actualizar las tablas de la base de datos.

También debe ejecutarse antes del seed de usuarios de prueba, porque los usuarios necesitan que los cargos ya existan en la tabla de perfiles de cargo.

---

# 7. Cargar los usuarios de prueba de Talento Humano

## Comando

```bash
npx tsx prisma/seed-test-users-humanTalent.ts
```

## Descripción

Este comando ejecuta directamente el archivo:

```text
prisma/seed-test-users-humanTalent.ts
```

El archivo crea o actualiza los usuarios de prueba del módulo de Talento Humano y asigna a cada usuario su cargo correspondiente.

Entre los usuarios creados se encuentran:

* Subgerente General.
* Director de Operaciones.
* Jefes de áreas.
* Coordinadores.
* Gerente Ejecutivo.
* Gerente Financiero.
* Jefe de Talento Humano.
* Auxiliar de Talento Humano.
* Otros cargos participantes en el flujo de aprobación.

Este archivo debe ejecutarse después de:

```bash
npx tsx prisma/seed-humanTalent.ts
```

Si se ejecuta primero el archivo de usuarios, puede aparecer un error indicando que no se encontró uno de los cargos.

---

# 8 Iniciar el servidor

## Comando

```bash
npm run dev
```

---

# Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js
- MySQL
- Git
- npm

---

# Scripts y comandos disponibles

| Comando                                         | Descripción                                             |
| ----------------------------------------------- | ------------------------------------------------------- |
| `npm run dev`                                   | Ejecuta el servidor en modo de desarrollo               |
| `npx prisma studio`                             | Abre la interfaz visual de Prisma                       |
| `npx prisma generate`                           | Genera Prisma Client                                    |
| `npx prisma migrate dev`                        | Ejecuta las migraciones en desarrollo                   |
| `npx prisma db push`                            | Sincroniza el esquema directamente con la base de datos |
| `npx tsx prisma/seed-humanTalent.ts`            | Carga la estructura organizacional de Talento Humano    |
| `npx tsx prisma/seed-test-users-humanTalent.ts` | Carga los usuarios de prueba y asigna sus cargos        |