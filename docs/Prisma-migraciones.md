# Documentación de Prisma, creación de tablas, migraciones y alteraciones

## Descripción

Este documento registra el proceso utilizado en el proyecto para la creación, modificación y actualización de tablas en la base de datos mediante Prisma ORM.

El backend del proyecto utiliza Prisma como ORM para conectarse con MySQL y gestionar los modelos de datos desde el archivo `schema.prisma`.

Prisma permite trabajar la base de datos de una forma más organizada, ya que los modelos se definen en código y luego se convierten en tablas reales dentro de MySQL mediante migraciones.

---

# 1. Archivo principal de Prisma

## Ubicación

```txt
prisma/schema.prisma
```

## Descripción

El archivo `schema.prisma` es el archivo principal donde se define la estructura de la base de datos del proyecto.

En este archivo se crean los modelos, campos, relaciones y enumeraciones que Prisma convertirá posteriormente en tablas dentro de MySQL.

---

# 2. ¿Qué es un modelo en Prisma?

Un modelo en Prisma representa una tabla de la base de datos.

Por ejemplo:

```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
}
```

Este modelo crea una tabla de usuarios con los siguientes campos:

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int | Identificador único del usuario |
| name | String | Nombre del usuario |
| email | String | Correo electrónico único |
| password | String | Contraseña encriptada del usuario |

---

# 3. ¿Qué es un campo en Prisma?

Un campo en Prisma representa una columna dentro de una tabla.

Ejemplo:

```prisma
email String @unique
```

Este campo indica que la tabla tendrá una columna llamada `email`, de tipo texto, y que su valor no se puede repetir.

---

# 4. Tipos de datos comunes en Prisma

Prisma permite definir diferentes tipos de datos para los campos de los modelos.

| Tipo | Descripción |
|---|---|
| Int | Números enteros |
| String | Texto |
| Boolean | Verdadero o falso |
| DateTime | Fecha y hora |
| Float | Números decimales |
| enum | Lista de valores permitidos |

Ejemplo:

```prisma
createdAt DateTime @default(now())
```

Este campo guarda automáticamente la fecha y hora en que se crea un registro.

---

# 5. Atributos comunes en Prisma

Los atributos permiten definir reglas especiales para los campos.

| Atributo | Descripción |
|---|---|
| @id | Indica que el campo es clave primaria |
| @default | Define un valor por defecto |
| @unique | Evita valores repetidos |
| @updatedAt | Actualiza automáticamente la fecha cuando el registro cambia |
| @relation | Define relaciones entre tablas |

Ejemplo:

```prisma
id Int @id @default(autoincrement())
```

Este campo será la clave primaria de la tabla y aumentará automáticamente.

---

# 6. Creación de enums en Prisma

## Descripción

Un `enum` permite definir una lista fija de valores permitidos para un campo.

En el proyecto se creó el enum `Role` para manejar los roles del sistema.

```prisma
enum Role {
  USER
  ADMIN
}
```

Este enum permite que el sistema solo acepte dos tipos de roles:

| Rol | Descripción |
|---|---|
| USER | Usuario normal del sistema |
| ADMIN | Administrador del sistema |

---

# 7. ¿Qué es una migración en Prisma?

Una migración es el proceso mediante el cual Prisma convierte los cambios realizados en el archivo `schema.prisma` en cambios reales dentro de la base de datos MySQL.

Cuando se agrega, elimina o modifica un modelo o campo, Prisma necesita aplicar esos cambios a la base de datos.

---

# 8. Comando para crear una migración

Para aplicar el cambio del campo `role` en la tabla `User`, se ejecutó el siguiente comando:

```bash
npx prisma migrate dev --name add_role_to_user
```

El comando realiza las siguientes acciones:

1. Lee el archivo `schema.prisma`.
2. Detecta los cambios realizados en los modelos.
3. Crea una nueva carpeta de migración dentro de `prisma/migrations`.
4. Genera un archivo SQL con las instrucciones necesarias.
5. Aplica los cambios en la base de datos MySQL.
6. Actualiza el historial de migraciones del proyecto.

---

# 9. Carpeta de migraciones

Después de ejecutar el comando de migración, Prisma crea una carpeta dentro de:

```txt
prisma/migrations
```

Ejemplo:

```txt
prisma/migrations/
└── 20260512153000_add_role_to_user/
    └── migration.sql
```

Dentro del archivo `migration.sql` queda registrada la instrucción SQL que Prisma ejecutó en MySQL.

---

# 10. ¿Qué es el archivo migration.sql?

El archivo `migration.sql` contiene las instrucciones SQL generadas por Prisma para modificar la base de datos.

Por ejemplo, cuando se agrega un campo nuevo, Prisma genera una instrucción SQL para alterar la tabla correspondiente.

Este archivo permite tener un historial claro de los cambios aplicados a la base de datos.

---

# 11. ¿Qué es Prisma Client?

Prisma Client es la herramienta que permite consultar la base de datos desde el código TypeScript.

Ejemplo:

```ts
const user = await prisma.user.findUnique({
  where: {
    email,
  },
});
```

Prisma Client permite usar métodos como:

```ts
prisma.user.findMany()
prisma.user.findUnique()
prisma.user.create()
prisma.user.update()
prisma.user.delete()
```

---

# 12. Flujo recomendado después de modificar `schema.prisma`

## Descripción

Cada vez que se modifica el archivo `schema.prisma`, es recomendable seguir un orden para evitar errores antes de aplicar cambios en la base de datos.

El flujo recomendado es:

```bash
npx prisma validate
npx prisma format
npx prisma migrate dev --name nombre_de_la_migracion
npx prisma generate
```

Cada comando cumple una función diferente dentro del proceso de trabajo con Prisma.

---

# 13. Comando `npx prisma validate`

## Descripción

El comando `npx prisma validate` sirve para revisar si el archivo `schema.prisma` está bien escrito.

Este comando valida la estructura del esquema antes de crear una migración o generar el cliente de Prisma.

```bash
npx prisma validate
```

## ¿Para qué sirve?

Sirve para confirmar que:

1. Los modelos están bien definidos.
2. Los campos tienen tipos válidos.
3. Las relaciones entre tablas están correctamente escritas.
4. Los enums no tienen errores.
5. Prisma puede entender correctamente el archivo `schema.prisma`.

## Ejemplo de uso

```bash
npx prisma validate
```

Si todo está correcto, Prisma muestra un mensaje indicando que el esquema es válido.

Ejemplo:

```txt
The schema at prisma/schema.prisma is valid
```

## Importancia en el proyecto

Este comando se ejecuta antes de migrar para evitar aplicar cambios dañados o mal escritos en la base de datos.

---

# 14. Comando `npx prisma format`

## Descripción

El comando `npx prisma format` sirve para ordenar y formatear automáticamente el archivo `schema.prisma`.

```bash
npx prisma format
```

## ¿Para qué sirve?

Sirve para:

1. Organizar los espacios y saltos de línea.
2. Alinear los campos de los modelos.
3. Mejorar la lectura del archivo.
4. Mantener una estructura limpia y ordenada.
5. Evitar desorden visual cuando se agregan nuevos modelos o relaciones.

## Ejemplo de uso

```bash
npx prisma format
```

## Importancia en el proyecto

Este comando no crea tablas ni modifica la base de datos.

Solo organiza el archivo `schema.prisma` para que el código quede limpio y fácil de revisar.

---

# 15. Comando `npx prisma migrate dev --name nombre_de_la_migracion`

## Descripción

El comando `npx prisma migrate dev` sirve para crear y aplicar una migración en ambiente de desarrollo.

```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

El nombre de la migración debe describir el cambio realizado.

Ejemplo:

```bash
npx prisma migrate dev --name add_requisition_approval_and_hiring_confirmation
```

## ¿Para qué sirve?

Sirve para convertir los cambios hechos en `schema.prisma` en cambios reales dentro de la base de datos MySQL.

Este comando realiza varias acciones:

1. Lee el archivo `schema.prisma`.
2. Compara los modelos actuales con la base de datos.
3. Detecta los cambios nuevos.
4. Crea una carpeta dentro de `prisma/migrations`.
5. Genera el archivo `migration.sql`.
6. Aplica los cambios en MySQL.
7. Registra la migración en el historial de Prisma.

## Importancia en el proyecto

Este comando sí modifica la base de datos.

Por eso se recomienda ejecutar primero:

```bash
npx prisma validate
```

y luego:

```bash
npx prisma format
```

antes de crear la migración.

---

# 16. Comando `npx prisma generate`

## Descripción

El comando `npx prisma generate` sirve para actualizar Prisma Client después de hacer cambios en `schema.prisma`.

```bash
npx prisma generate
```

## ¿Para qué sirve?

Sirve para que el backend reconozca los nuevos modelos, campos, relaciones y enums desde el código TypeScript o JavaScript.

Por ejemplo, si se agrega un nuevo modelo llamado:

```prisma
model PersonnelRequisition {
  id Int @id @default(autoincrement())
}
```

Después de ejecutar:

```bash
npx prisma generate
```

el backend ya podrá usar:

```ts
prisma.personnelRequisition.findMany()
prisma.personnelRequisition.create()
prisma.personnelRequisition.update()
prisma.personnelRequisition.delete()
```

## Importancia en el proyecto

Este comando no crea tablas en MySQL.

Su función es actualizar Prisma Client para que el código del backend pueda trabajar con los cambios nuevos.

---

# 17. Orden correcto de comandos al trabajar con Prisma

## Descripción

Cuando se modifica el archivo `schema.prisma`, el orden recomendado es el siguiente:

```bash
npx prisma validate
```

Primero se valida que el esquema no tenga errores.

```bash
npx prisma format
```

Luego se organiza el archivo para que quede limpio.

```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

Después se crea y aplica la migración en la base de datos.

```bash
npx prisma generate
```

Finalmente se actualiza Prisma Client para que el backend reconozca los nuevos cambios.