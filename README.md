
---

# Encuestas – Monorepo (Backend + Frontend)

Aplicación de **encuestas** con backend en `http://localhost:3000` y frontend Angular en `http://localhost:4200`.

## 🧭 Índice

* [Requisitos](#requisitos)
* [Estructura](#estructura)
* [Backend](#backend)

  * [Arranque](#arranque)
  * [Probar API (cURL rápidos)](#probar-api-curl-rápidos)
  * [Flujo mínimo end-to-end](#flujo-mínimo-end-to-end)
* [Frontend](#frontend)

  * [Instalación y arranque](#instalación-y-arranque)
  * [Proxy de desarrollo](#proxy-de-desarrollo)
  * [Temas/estilos Angular Material](#temasestilos-angular-material)
  * [Rutas principales](#rutas-principales)
* [Troubleshooting](#troubleshooting)
* [Scripts útiles](#scripts-útiles)
* [Licencia](#licencia)

---

## Requisitos

* **Node.js 20+**
* **npm 9+**
* (Opcional) `jq` para parsear JSON en bash.
* (Windows) PowerShell (los ejemplos incluyen variantes).

---

## Estructura

```
.
├─ backend/                     # Servidor API (puerto 3000)
│  └─ (código del back)
└─ frontend/encuestas-app/      # Angular app (puerto 4200)
   └─ src/...
```

> Si tu repo no tiene carpetas `backend/` y `frontend/`, ajusta los paths según corresponda. Lo importante: back corre en **:3000**, front en **:4200** con **proxy** hacia el back.

---

## Backend

> Asumimos que el backend expone los endpoints documentados en la suite de cURL que ya tienes.

### Arranque

```bash
# Entra al backend
cd backend

# Instala dependencias
npm i

# Arranca el servidor en el puerto 3000
npm start
# → Deberías ver logs indicando que escucha en http://localhost:3000
```

### Probar API (cURL rápidos)

**Health**

```bash
curl -s http://localhost:3000/health
# {"status":"ok"}
```

**Login** (captura token en bash)

```bash
TOKEN=$(curl -sX POST http://localhost:3000/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}' | jq -r .token)
echo "$TOKEN"
```

**Crear encuesta**

```bash
curl -sX POST http://localhost:3000/surveys \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d '{"title":"Encuesta NPS","description":"Demo"}' | jq .
```

> Tienes la **suite completa** de cURL en tu doc original. Úsala para probar **questions**, **options**, **public**, **results**, **exports** y **users**.

### Flujo mínimo end-to-end

1. **Login** o **Register** (retorna token).
2. **Crear encuesta** (`POST /surveys`).
3. **Añadir preguntas**:

   * SCALE 0–10 (`POST /surveys/:id/questions`)
   * SINGLE (`POST /surveys/:id/questions`)
   * Opciones para SINGLE (`POST /questions/:questionId/options`)
4. **Publicar** (`PATCH /surveys/:id {status:'PUBLISHED'}`).
5. **Formulario público**: `GET /public/s/:publicId` + `GET /public/s/:publicId/questions` → `POST /public/responses`.
6. **Resultados**: `GET /results/surveys/:id/summary` y `GET /results/surveys/:id/timeseries`.
7. **Export CSV**: `GET /exports/surveys/:id/responses.csv`.

---

## Frontend

### Instalación y arranque

```bash
# Entra al frontend
cd frontend/encuestas-app

# Instala dependencias
npm i

# Arranca dev-server (puerto 4200) con proxy al backend
npm start
# → Abre http://localhost:4200
```

### Proxy de desarrollo

Archivo en `frontend/encuestas-app/proxy.conf.json`:

```json
{
  "/auth":     { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/surveys":  { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/questions":{ "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/public":   { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/results":  { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/exports":  { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" },
  "/users":    { "target": "http://localhost:3000", "secure": false, "changeOrigin": true, "logLevel": "debug" }
}
```

`package.json`:

```json
"scripts": {
  "start": "ng serve --proxy-config proxy.conf.json",
  "build": "ng build",
  "test": "ng test"
}
```

> En la consola de `ng serve` deben aparecer líneas `[HPM] GET /surveys -> http://localhost:3000` al interactuar.

### Temas/estilos Angular Material

`src/styles.scss` (los `@use` deben ir **antes** de cualquier regla):

```scss
@use '@angular/material' as mat;

@include mat.core();

$theme: mat.define-theme();

@include mat.all-component-themes($theme);

/* Estilos globales */
html, body { height: 100%; margin: 0; }
```

### Rutas principales

* `/login` – Inicio de sesión (guarda token)
* `/register` – Registro (backend retorna token)
* `/surveys` – Listar/crear/publicar encuestas
* `/surveys/:id` – Detalle (gestión de preguntas/opciones + publicar)
* `/public/:publicId` – Formulario público (sin JWT)
* `/results/:id` – Resumen y serie de tiempo
* `/users` – Administración (ADMIN)

> Las rutas privadas usan `authGuard` (y `adminGuard` para `/users`). El interceptor agrega `Authorization: Bearer <token>` a las peticiones.

---

## Troubleshooting

**El navegador llama `http://localhost:4200/...` en vez de `:3000`**
✔️ Es correcto: el dev-server proxyea a `:3000`.
Si ves CORS o no llega al backend:

* Revisa `proxy.conf.json` y que **arranques** con `--proxy-config`.
* Reinicia el dev server tras cambiar el proxy.
* Observa `[HPM]` en la consola de `ng serve`.

**401 en endpoints privados**

* Falta token (login/register).
* Verifica el **interceptor**:

  ```ts
  export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');
    if (token) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(req);
  };
  ```
* DevTools → Application → Local Storage: debe existir `token`.

**404 en resultados**

* Debe ser `/results/surveys/:id/summary` y `/results/surveys/:id/timeseries?granularity=hour`.
* Desde el frontend no llames `:3000` absoluto; usa `/results/...` (el proxy resuelve).

**Material “@use rules must be written before any other rules.”**

* Mueve `@use '@angular/material' as mat;` al **inicio** de `styles.scss`.

**No navega al detalle**

* Verifica `routerLink="/surveys/:id"` o `[routerLink]="['/surveys', id]"`.
* Revisa que la ruta esté definida como `surveys/:id`.
* Si hay guard, quítalo temporalmente para descartar bloqueo.

**Crear encuesta “no hace nada”**

* Mira DevTools → Network: status y body del error.
* Revisa que el payload sea `{ title, description }`.
* Si ves 401, es token/interceptor; 403, permisos; 404, proxy; 500, backend.

---

## Scripts útiles

**Backend**

```bash
cd backend
npm i
npm start
```

**Frontend**

```bash
cd frontend/encuestas-app
npm i
npm start
npm run build
```

**PowerShell (login y crear encuesta sin jq)**

```powershell
# login
$resp = curl.exe -s -X POST http://localhost:3000/auth/login `
  -H "content-type: application/json" `
  -d '{"email":"admin@example.com","password":"changeme"}'
$TOKEN = ($resp.Content | ConvertFrom-Json).token

# crear encuesta
$resp = curl.exe -s -X POST http://localhost:3000/surveys `
  -H "authorization: Bearer $TOKEN" -H "content-type: application/json" `
  -d '{"title":"Encuesta NPS","description":"Demo"}'
$js = $resp.Content | ConvertFrom-Json
$SURVEY_ID = $js.id
$PUBLIC_ID = $js.publicId
"$SURVEY_ID $PUBLIC_ID"
```

