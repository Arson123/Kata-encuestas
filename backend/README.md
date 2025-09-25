# Backend – Encuestas (Node.js + TS + TypeORM + Fastify)

Monolito modular para gestionar encuestas: **Auth, Users, Surveys, Questions, Options, Public, Responses, Results, Export, Realtime (opcional)**.
Stack principal: **Node 20+, TypeScript, Fastify v5, TypeORM, PostgreSQL, Redis (opcional), Docker Compose**.

---

## 🚀 Features

* **Auth JWT** (login/register/me) con RBAC (**ADMIN/EDITOR/VIEWER**).
* **Surveys** CRUD parcial + publicación/cierre + clonación (opcional).
* **Questions/Options** para tipos `TEXT | SCALE | SINGLE | MULTI`.
* **Public API** para exponer encuestas/árbol y **ingestar respuestas**.
* **Resultados** (summary y series de tiempo) + **Export CSV**.
* **Observabilidad**: logs Pino, `/health` & `/ready` (si aplica).
* **Arquitectura modular** y repos/queries UseCase-First.
* **UUIDs** en todas las entidades y FKs.

---

## 📦 Requisitos

* **Node** 20+
* **Docker** & **Docker Compose**
* **PostgreSQL** (lo levanta Docker)
* (Opcional) **Redis** para rate limit / pub-sub realtime

---

## 🧰 Variables de entorno

Crear `.env` en `backend/`:

```env
DB_URL=postgres://app:app@localhost:5432/surveys
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1h
PORT=3000
```

> En Docker, si corres la API dentro del compose, `DB_URL` debe usar host `db`:
> `postgres://app:app@db:5432/surveys`

---

## 🐳 Levantar infra (DB/Redis)

```bash
docker compose up -d db redis
```

> Si el puerto 5432 está ocupado, o tienes otro Postgres corriendo:
>
> * Para liberar: para el proceso/contendor que usa 5432
> * O cambia el mapeo en `docker-compose.yml` a `5433:5432` y ajusta `DB_URL`.

---

## 📚 Migraciones

Incluimos migraciones “fijas” iniciales:

```bash
# ejecutar migraciones
npm run migration:run

# (opcional) ver migraciones
npm run typeorm -- migration:show
```

> Si en algún refactor agregas columnas/claves, crea una nueva migración en `src/infrastructure/orm/migrations/` y vuelve a ejecutar `migration:run`.

---

## ▶️ Desarrollo

```bash
# instalar dependencias
npm ci

# compilar tipos (solo verificación, no emite)
npm run typecheck

# levantar en dev (tsx watch)
npm run dev
```

* Fastify escuchará en: `http://localhost:3000`
* Healthcheck: `GET /health`

---

## 🔐 Roles y permisos (RBAC)

* **ADMIN**: todo (CRUD de usuarios, ver/editar encuestas de todos).
* **EDITOR**: crear/editar **sus** encuestas, ver/exportar **sus** datos.
* **VIEWER**: lectura (si lo habilitas) — por defecto no se usa.

**Público**: `/public/s/:publicId` y `POST /public/responses` sin JWT (con rate limit/validaciones).

---

## 🧭 Endpoints principales

**Auth**

* `POST /auth/register` → `{email,password,role?}` → `{ token, user }` *(token sin exp, si configuraste el modo permanente en register)*
* `POST /auth/login` → `{email,password}` → `{ token, user }` *(token con `exp`)*
* `GET /auth/me` (JWT)

**Users** (ADMIN)

* `GET /users` (lista/paginación)
* `POST /users` (crear con rol/passwordHash)
* `PATCH /users/:id` (cambio de rol/estado)
* `PATCH /users/:id/password` (reset)

**Surveys**

* `GET /surveys` (filtros)
* `POST /surveys` (crear)
* `GET /surveys/:id` (privado; RBAC)
* `PATCH /surveys/:id` (editar/publicar/cerrar)
* `POST /surveys/:id/clone` (opcional)

**Questions/Options**

* `GET /surveys/:surveyId/questions`
* `POST /surveys/:surveyId/questions`
* `PATCH /questions/:id`
* `POST /questions/:id/move` (reordenar)
* `GET /questions/:id/options`
* `POST /questions/:id/options`
* `PATCH /options/:id`
* `DELETE /options/:id`

**Público / Ingesta**

* `GET /public/s/:publicId`
* `GET /public/s/:publicId/questions`
* `POST /public/responses` → `{ surveyId, answers:[{questionId, type, value | optionIds[]}] }`

**Resultados**

* `GET /results/surveys/:id/summary`
* `GET /results/surveys/:id/timeseries?granularity=minute|hour`

**Export**

* `GET /exports/surveys/:id/responses.csv`
* `GET /exports/surveys/:id/summary.csv`

---

## 🧪 Postman

> Ya te compartí una **colección Postman v2.1** y un **Environment** con variables (`baseUrl`, `token`, `surveyId`, etc.).
> **Orden sugerido**:

1. Auth → Register
2. Auth → Login (guarda `{{token}}`)
3. Surveys → POST (guarda `{{surveyId}}`, `{{publicId}}`)
4. Surveys → PATCH publish
5. Questions → POST SCALE (guarda `{{qScaleId}}`)
6. Questions → POST SINGLE (guarda `{{qSingleId}}`)
7. Options → POST 1/2/3 (la 3 guarda `{{optId}}`)
8. Public → GET metadata/questions
9. Responses → POST (usa `{{surveyId}}`, `{{qScaleId}}`, `{{qSingleId}}`, `{{optId}}`)
10. Results → summary/timeseries
11. Export → responses.csv

---

## 🧱 Entidades (resumen)

* **User**: `id, email (UQ), passwordHash, role, createdAt, updatedAt`
* **Survey**: `id, publicId (UQ), title, description?, status, isAnonymous, startAt?, endAt?, createdAt, updatedAt, createdById?`
* **Question**: `id, surveyId (FK), order (UQ por survey), type, title, helpText?, required, scaleMin?, scaleMax?`
* **Option**: `id, questionId (FK), order (UQ por question), label, value`
* **Response**: `id, surveyId (FK), respondentId?, createdAt, ipHash?, userAgent?, meta?`
* **Answer**: `id, responseId (FK), questionId (FK), valueText?, valueNumber?, createdAt`
* **AnswerOption**: `answerId (FK), optionId (FK)` (N\:N para SINGLE/MULTI)

> Todas las IDs/FKs son **UUID** (`uuid-ossp/pgcrypto` habilitado por migración).

---

## ⚙️ Config Fastify/JWT

* **Fastify v5** con plugins compatibles:
  `@fastify/jwt@^9`, `@fastify/cors@^10`, `@fastify/rate-limit@^10`, `@fastify/websocket@^9` (si lo usas).
* Config JWT en bootstrap:

  ```ts
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN } // p.ej. "1h"
  });
  ```
* Si quieres token **sin exp** en `/auth/register`, usa un signer “permanente” para ese endpoint.

---

## 🧩 Scripts útiles

```bash
# lint/format (si están configurados)
npm run typecheck      # tsc --noEmit
npm run dev            # tsx watch
npm run build          # tsc
npm run migration:gen  # generar migración a partir de entidades (usa con cuidado)
npm run migration:run  # ejecutar migraciones pendientes
npm run typeorm -- -h  # ayuda del CLI
```

---

## 🩺 Troubleshooting (errores comunes)

* **`FST_JWT_NO_AUTHORIZATION_IN_HEADER`** → falta `Authorization: Bearer <token>` en la request.
* **`relation "user" does not exist`** → ejecuta migraciones (`npm run migration:run`).
* **`column "createdById" does not exist`** → aplica migración `AddSurveyCreatedBy...`.
* **`ColumnTypeUndefinedError`** → asegura `import "reflect-metadata";` al inicio de `src/index.ts` y tipos explícitos en `@Column` (ej. `type: 'varchar'`/`'uuid'`/`'jsonb'`).
* **`__dirname is not defined`** (ESM) → en `data-source.ts` usa `fileURLToPath(import.meta.url)` y `path.join(...)`.
* **SASL: client password must be a string** → `DB_URL` no cargó; añade `import "dotenv/config";` en `data-source.ts` y verifica `.env`.
* **Port 5432 ya en uso** → libera el puerto o mapea a `5433:5432` y ajusta `DB_URL`.
* **Plugin version mismatch** (Fastify v4 vs v5) → alinea versiones de `fastify` y `@fastify/*`.

---

## 🛡️ Seguridad

* Tokens **expirables** para login (`JWT_EXPIRES_IN`).
* (Opcional) **Refresh tokens** via cookie HttpOnly + `/auth/refresh`.
* **Rate limiting** en `POST /public/responses`.
* Sanitización/validaciones con Zod/DTOs.
* (Opcional) Anonimización de export si fuese necesario.

---

## 📄 Licencia

Uso interno / educativo. Ajusta según tus necesidades.

---