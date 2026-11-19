# API REST de Gestión de Tareas

Prueba técnica para el puesto de Backend Node.js. Es una API RESTful hecha con **Node.js**, **Express** y **TypeScript** para gestionar tareas (CRUD completo), con filtros por estado y responsable, paginación, validación de datos, migraciones y tests de integración.

## Stack

- Node.js (v24) + TypeScript
- Express
- Prisma 7 + SQLite (con driver adapter `@prisma/adapter-better-sqlite3`)
- Zod 4
- Jest + Supertest

## Cómo ejecutarlo

### 1. Clonar e instalar

```bash
git clone https://github.com/ybaguilera92/task-api.git
cd task-api
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

Por defecto apunta a SQLite local:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
```

### 3. Generar el cliente de Prisma

Con Prisma 7 el cliente ya no vive en `node_modules`, se genera en la carpeta que definas en el `schema.prisma` (en este caso `src/generated/prisma`):

```bash
npx prisma generate
```

### 4. Migraciones

```bash
npx prisma migrate dev
```

Esto crea la base de datos y la tabla Task.

### 5. Arrancar el servidor

```bash
npm run dev
```

_(Si deseas compilar y ejecutar la versión de producción, usa `npm run build` seguido de `npm start`)._

La API quedará disponible en `http://localhost:3000/api/tasks`.

### 5. Ejecutar los tests

Para correr la suite de pruebas de integración con Jest y Supertest:

```bash
npm test
```

---

## Endpoints y ejemplos de uso

| Método| Ruta | Descripción |
| `POST`| `/api/tasks` | Crea una nueva tarea. |
| `GET` | `/api/tasks`| Lista tareas con filtros (`status`, `assignee`) y paginación (`page`,`limit`).|
| `GET` | `/api/tasks/:id`| Obtiene el detalle de una tarea por ID.|
| `PUT` | `/api/tasks/:id`| Actualiza los datos de una tarea existente.|
| `DELETE`| `/api/tasks/:id`| Elimina una tarea. |

### Crear una tarea (`POST /api/tasks`)

**Request Body:**

```json
{
  "title": "Preparar arquitectura de microservicios",
  "description": "Definir contratos de API y base de datos",
  "status": "en_curso",
  "assignee": "Yoel",
  "dueDate": "2026-12-01"
}
```

_(Valores permitidos para `status`: `pendiente`, `en_curso`, `hecha`. Si se omite, toma `pendiente` por defecto)._

### Listar con filtros y paginación (`GET /api/tasks`)

**Ejemplo de consulta:**

```http
GET /api/tasks?status=pendiente&assignee=Yoel&page=1&limit=10
```

**Respuesta (`200 OK`):**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Revisar pull requests",
      "description": "Validar cambios del sprint",
      "status": "pendiente",
      "assignee": "Yoel",
      "dueDate": "2026-11-25T00:00:00.000Z",
      "createdAt": "2026-11-18T10:00:00.000Z",
      "updatedAt": "2026-11-18T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Decisiones que tomé

- Separé todo por capas. Rutas, controladores, servicios, esquemas de validación y middlewares. Así los controladores quedan limpios y la lógica de negocio se puede probar o cambiar sin tocar Express directamente.

- SQLite + Prisma. SQLite porque cualquiera que revise el repo puede levantarlo en segundos sin configurar Postgres ni Docker. Prisma porque me da tipado automático y control de versiones del esquema con migraciones.

- Prisma 7 con driver adapter. En Prisma 7 el cliente ya no incluye motor interno para SQLite; hay que pasarle un adapter (@prisma/adapter-better-sqlite3) al instanciarlo. Centralicé esa inicialización en src/prisma.ts para que toda la app use una sola conexión.

- Generador prisma-client con output. En Prisma 7 el generador prisma-client-js está obsoleto y el campo output es obligatorio. El cliente se genera en src/generated/prisma y se importa desde ahí, no desde @prisma/client.

- Configuración en prisma.config.ts. En Prisma 7 la URL de conexión ya no va en el bloque datasource del schema; se define en `prisma.config.ts usando env("DATABASE_URL").

- Zod 4 para validar. En Zod 4 la propiedad errors de ZodError fue eliminada; se usa issues. El middleware global convierte cualquier error de validación en un 400 con el detalle campo a campo.

- Separé app.ts de server.ts. Así Supertest puede importar la app sin tener que levantar un puerto real durante los tests.

- Códigos HTTP consistentes. 201 al crear, 200 en consultas y ediciones, 204 al borrar, 400 en validaciones o IDs mal formados, y 404 cuando el recurso no existe.

---

## Problemas que encontré durante el desarrollo

- Prisma 7 rompió el flujo clásico. El schema.prisma que funcionaba en versiones anteriores ya no compila: cambia el generador, el output es obligatorio y la URL sale del datasource. Lo resolví migrando a prisma-client y creando prisma.config.ts.

- new PrismaClient() sin argumentos falla. Prisma 7 exige un driver adapter en el constructor. Por eso creé src/prisma.ts con el adapter de better-sqlite3 y lo importo desde el servicio, en vez de instanciar el cliente en cada archivo.

- better-sqlite3 no cargaba en Node 24. Las versiones 11.x no traen binarios para Node 24 (ABI 137) en Windows. Lo resolví forzando better-sqlite3@^12 con un overrides en package.json para que el adaptador de Prisma no instalara su propia copia incompatible.

- Zod 4 cambió la API de errores. err.errors ya no existe; hay que usar err.issues en el middleware de errores.

---

## Qué haría con más tiempo

- Aislar la base de datos de tests. Ahora los tests limpian la tabla antes de correr; en un proyecto real usaría una DB aparte (NODE_ENV=test) o SQLite en memoria para no tocar los datos de desarrollo.

- Swagger / OpenAPI. Expondría /api/docs generado desde los esquemas de Zod para que frontend o QA puedan probar sin Postman.

- Autenticación con JWT. Para proteger rutas y asociar tareas a usuarios reales con permisos.

- Docker y CI. Un Dockerfile, un docker-compose.yml con Postgres para producción y un workflow de GitHub Actions que corra tests y linter en cada push.

---

## Cómo usé la IA durante la prueba

La usé como apoyo para no perder tiempo en configuración repetitiva y centrarme en la arquitectura y la calidad del código.

- Qué le pedí: la estructura inicial del proyecto Express con TypeScript, la config de Jest con ts-jest, ejemplos de validación de fechas y coerción de números en query params con Zod, y ayuda para entender los cambios de Prisma 7.

- Qué acepté: el patrón para centralizar errores (AppError y ZodError) en un solo middleware, la estructura base de los tests de integración con Supertest y el archivo src/prisma.ts con el adapter.

- Qué corregí:
  - La IA propuso inicialmente un enum nativo en schema.prisma, pero SQLite no soporta enums en Prisma. Lo cambié a String y dejé la restricción de valores (pendiente, en_curso, hecha) en la capa de validación con Zod.

  - Ajusté el filtro por assignee en el servicio para que permitiera búsquedas parciales (contains) en vez de coincidencia exacta, y armé la respuesta de paginación con metadatos (total, page, limit, totalPages).

  - Corregí la sintaxis de env en prisma.config.ts (era env["DATABASE_URL"], debía ser env("DATABASE_URL")).

  - Cambié err.errors por err.issues en el middleware de errores al detectar que Zod 4 eliminó la propiedad errors.

  - Forcé better-sqlite3@^12 con overrides cuando el adaptador de Prisma seguía instalando una copia 11.x incompatible con Node 24.
