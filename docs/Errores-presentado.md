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

# Próximos incidentes

## Incidente #003 — Pendiente