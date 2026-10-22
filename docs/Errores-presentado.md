# Historial de Incidentes Backend

---

# Incidente #001 — Error al ejecutar TSX

## Fecha

2026-05-08

---

## Descripción del incidente

Durante la ejecución del backend se presentó un error relacionado con el comando `tsx`, impidiendo iniciar el servidor en modo desarrollo.

---

## Error presentado

### Mensaje obtenido

```txt
"tsx" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.
```

---

## Causa identificada

El paquete `tsx` no se encontraba instalado dentro de las dependencias de desarrollo del proyecto.

---

# Solución aplicada

## Instalación de TSX

### Comando ejecutado

```bash
npm install -D tsx
```

---

## Resultado de la instalación

```txt
added 5 packages, and audited 254 packages in 6s
```

---

## Validación realizada

Después de instalar `tsx`, el backend pudo ejecutarse correctamente utilizando el siguiente comando:

```bash
npm run dev
```

---

## Resultado final

- Ejecución correcta del servidor backend.
- Reinicio automático habilitado mediante `tsx watch`.
- Soporte para ejecución directa de archivos TypeScript.

---

## Observaciones

Se recomienda validar que todas las dependencias de desarrollo necesarias se encuentren instaladas después de clonar el proyecto o actualizar dependencias.

---

# Incidente #002 — Error Prisma Client Runtime

## Fecha

2026-05-08

---

## Descripción del incidente

Durante la ejecución del backend se presentó un error relacionado con Prisma Client, impidiendo iniciar correctamente el servidor.

---

## Error presentado

### Mensaje obtenido

```txt
Error: Cannot find module
'@prisma/client/runtime/library.js'
```

---

## Causa identificada

El cliente de Prisma no se encontraba generado correctamente debido a:

- Incompatibilidad presentada con Prisma v7.
- Archivos corruptos dentro de `node_modules`.
- Prisma Client no generado después de la instalación.
- Configuración desactualizada del datasource en `schema.prisma`.

---

# Solución aplicada

## Eliminación de dependencias Prisma

### Comando ejecutado

```bash
npm uninstall prisma @prisma/client
```

---

## Limpieza del proyecto

### Eliminación de módulos y lock

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

---

## Instalación de Prisma v6

### Comando ejecutado

```bash
npm install prisma@6 @prisma/client@6
```

---

## Generación del cliente Prisma

### Comando ejecutado

```bash
npx prisma generate
```

---

## Resultado obtenido

```txt
✔ Generated Prisma Client
```

---

## Validación realizada

Después de regenerar Prisma Client, el backend pudo ejecutarse correctamente utilizando:

```bash
npm run dev
```

---

## Resultado final

- Prisma Client generado correctamente.
- Conexión funcional con la base de datos MySQL.
- Backend ejecutándose sin errores de runtime.
- APIs funcionando correctamente.

---

## Observaciones

Se identificó que Prisma v7 presenta cambios importantes en la configuración del datasource y posibles incompatibilidades con algunas versiones recientes de Node.js.

Se recomienda:

- Utilizar Prisma v6 para proyectos backend tradicionales.
- Ejecutar `npx prisma generate` después de instalar dependencias.
- Validar la compatibilidad de versiones entre Prisma y Node.js se recomienda utilizar:

```txt
Node.js v20 LTS
Prisma v6
```

---

# Incidente #003 — Migración fallida en la tabla de revisiones de cargo

## Fecha

2026-10-21

---

## Descripción del incidente

Al ejecutar `npx prisma migrate dev` para aplicar las migraciones de la rama `ajuste-traslado-cargos`, Prisma detectó diferencias entre la base de datos y el historial de migraciones, y propuso reiniciar la base de datos, lo que habría borrado todos los datos.

La causa fue una migración anterior, `20260929214600_remove_revision_unique_constraint`, que falló a mitad de su ejecución y cuya carpeta no existe en el repositorio.

---

## Error presentado

### Mensaje obtenido

```txt
- The migration `20260929214600_remove_revision_unique_constraint` failed.
- Drift detected: Your database schema is not in sync with your migration history.

[*] Changed the `positionprofilerevision` table
  [-] Removed foreign key on columns (positionProfileId)
  [-] Removed unique index on columns (positionProfileId, revisionNumber)

- The migrations recorded in the database diverge from the local migrations directory.
  Last common migration: `20260915154400`.
  Migrations applied to the database but absent from the migrations directory are:
  20260929214600_remove_revision_unique_constraint

We need to reset the MySQL database "th-development" at "localhost:3306"
All data will be lost.
```

---

## Causa identificada

La migración `20260929214600_remove_revision_unique_constraint` alcanzó a eliminar la llave foránea y el índice único de `PositionProfileRevision`, y luego falló con el error `1005: Can't create table personnelrequisitionapproval (errno: 121 "Duplicate key on write or update")`.

Quedó registrada como fallida en la tabla `_prisma_migrations`, pero su carpeta no existe en el repositorio. Como `schema.prisma` mantiene `@@unique([positionProfileId, revisionNumber])`, la base de datos quedó distinta a lo que esperan las migraciones.

---

# Solución aplicada

> No se ejecutó `prisma migrate reset`, porque borra todos los datos de la base de datos.

## 1. Respaldo de la base de datos

Desde HeidiSQL: clic derecho sobre la base de datos → **Exportar base de datos como SQL**, con Tablas **Crear**, Datos **Insertar** y salida en un **Archivo .sql individual**.

---

## 2. Validación de duplicados

Antes de volver a crear el índice único se verificó que no existieran revisiones repetidas:

```sql
SELECT positionProfileId, revisionNumber, COUNT(*) AS cantidad
FROM `positionprofilerevision`
GROUP BY positionProfileId, revisionNumber
HAVING COUNT(*) > 1;
```

La consulta no devolvió filas.

---

## 3. Restauración del índice único y la llave foránea

```sql
CREATE UNIQUE INDEX `PositionProfileRevision_positionProfileId_revisionNumber_key`
ON `positionprofilerevision`(`positionProfileId`, `revisionNumber`);

ALTER TABLE `positionprofilerevision`
ADD CONSTRAINT `PositionProfileRevision_positionProfileId_fkey`
FOREIGN KEY (`positionProfileId`) REFERENCES `positionprofile`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## 4. Eliminación del registro de la migración fallida

```sql
DELETE FROM `th-development`.`_prisma_migrations`
WHERE migration_name = '20260929214600_remove_revision_unique_constraint';
```

Se debe indicar el nombre de la base de datos en la consulta cuando HeidiSQL no tiene una base seleccionada; de lo contrario se obtiene el error `1046: No database selected`.

---

## 5. Aplicación de las migraciones pendientes

```bash
npx prisma migrate dev
```

---

## Observaciones

- Una migración que falla debe resolverse en el momento y no eliminarse del repositorio sin limpiar su registro en `_prisma_migrations`.
- Cuando Prisma propone reiniciar la base de datos, se debe responder `N` y analizar la causa antes de continuar.
- Siempre se debe sacar un respaldo antes de modificar manualmente la estructura de la base de datos.

---

# Próximos incidentes

## Incidente #004 — Pendiente