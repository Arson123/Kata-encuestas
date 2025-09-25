
---

# Encuestas – Monorepo (Backend + Frontend)

Aplicación de **encuestas** con backend (API REST) en `http://localhost:3000` y frontend **Angular** en `http://localhost:4200` (con **Angular Material**).
Incluye autenticación JWT, creación/edición/publicación de encuestas, captura pública de respuestas, resultados agregados y export CSV.

---

## 🧭 Índice

* [Requisitos](#requisitos)
* [Estructura](#estructura)
* [Backend](#backend)
* [Frontend](#frontend)
* [Diagramas](#diagramas)
* [Flujo mínimo end-to-end](#flujo-mínimo-end-to-end)
* [Troubleshooting rápido](#troubleshooting-rápido)

---

## Requisitos

* **Node.js 20+**
* **npm 9+**
* (Opcional) `jq` en bash; en Windows, PowerShell

---

## Estructura

```
.
├─ backend/                      # API (puerto 3000)
│  └─ …
├─ frontend/encuestas-app/       # Angular (puerto 4200)
│  └─ …
└─ docs/
   ├─ ER.drawio.svg
   └─ Secuencia.drawio.svg
```

---

## Backend

**Instalación y arranque**

```bash
cd backend
npm i
npm start   # http://localhost:3000
```

**Smoke test**

```bash
curl -s http://localhost:3000/health
# {"status":"ok"}
```

> La suite de endpoints (auth, surveys, questions, options, public, results, exports, users) está alineada con el README de cURL del backend.

---

## Frontend

**Instalación y arranque**

```bash
cd frontend/encuestas-app
npm i
npm start   # http://localhost:4200
```

**Proxy de desarrollo** – `frontend/encuestas-app/proxy.conf.json`

```json
{
  "/auth":     { "target": "http://localhost:3000", "secure": false, "changeOrigin": true },
  "/surveys":  { "target": "http://localhost:3000", "secure": false, "changeOrigin": true },
  "/questions":{ "target": "http://localhost:3000", "secure": false, "changeOrigin": true },
  "/public":   { "target": "http://localhost:3000", "secure": false, "changeOrigin": true },
  "/results":  { "target": "http://localhost:3000", "secure": false, "changeOrigin": true },
  "/exports":  { "target": "http://localhost:3000", "secure": false, "changeOrigin": true },
  "/users":    { "target": "http://localhost:3000", "secure": false, "changeOrigin": true }
}
```

**Rutas clave (resumen)**

* `/login` – Iniciar sesión (guarda token)
* `/register` – Registro (retorna token)
* `/surveys` – Listar/crear/publicar encuestas (privado)
* `/surveys/:id` – Detalle, preguntas y opciones (privado)
* `/public/:publicId` – Formulario público (sin JWT)
* `/results/:id` – Resumen/serie de tiempo (privado)
* `/users` – Administración (solo ADMIN)

> El frontend usa rutas **relativas** (`/surveys`, `/results/...`) y el **proxy** las redirige al backend.
> El **interceptor** añade `Authorization: Bearer <token>` en endpoints privados.

---

## Diagramas

### Diagrama de Secuencia

<p align="center">
  <img src="docs/Secuencia.drawio.svg" alt="Diagrama de Secuencia" width="860">
</p>

### Diagrama Entidad–Relación (ER)

<p align="center">
  <img src="docs/ER.drawio.svg" alt="Diagrama ER" width="860">
</p>

---

## Flujo mínimo end-to-end

1. **Registrar o loguear** (token JWT).
2. **Crear encuesta** → `/surveys`.
3. **Agregar preguntas**:

   * SCALE 0–10 → `/surveys/:id/questions`.
   * SINGLE → `/surveys/:id/questions` + **opciones** → `/questions/:questionId/options`.
4. **Publicar** → `PATCH /surveys/:id {status:"PUBLISHED"}`.
5. **Responder públicamente**:

   * `/public/s/:publicId` + `/public/s/:publicId/questions` → `POST /public/responses`.
6. **Ver resultados**:

   * Resumen → `/results/surveys/:id/summary`.
   * Serie → `/results/surveys/:id/timeseries?granularity=hour`.
7. **Exportar CSV** → `/exports/surveys/:id/responses.csv`.

---

## Troubleshooting rápido

* **4200 llama directo y veo CORS** → Falta proxy o no arrancaste con `--proxy-config`.
  Reinicia `npm start` y confirma que el `proxy.conf.json` está en la raíz del front.

* **401 en privados** → No hay token o interceptor deshabilitado. Haz login/registro nuevamente.

* **404 en resultados** → Usa rutas correctas (`/results/surveys/:id/summary` y `/timeseries?...`).

* **Sass: “@use rules must be written before any other rules.”** → Mueve `@use '@angular/material' as mat;` al inicio de `src/styles.scss`.

---

