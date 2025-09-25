# Encuestas Frontend – README

Frontend de Angular para la app de **Encuestas**. Consume el backend en `http://localhost:3000` mediante **proxy** desde el dev-server (`http://localhost:4200`).

---

## 🧰 Stack

* **Angular 20** (standalone components, signals)
* **Angular Material** (UI)
* **RxJS**, **Day.js**
* **SCSS**
* Proxy dev-server (`proxy.conf.json`) hacia el backend

---

## 🚀 Puesta en marcha

### Requisitos

* Node 20+ (recomendado)
* Backend corriendo en `http://localhost:3000`

### Instalar dependencias

```bash
npm i
```

### Proxy (importante)

Archivo en la raíz del proyecto: `proxy.conf.json`

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

En `package.json`:

```json
"scripts": {
  "start": "ng serve --proxy-config proxy.conf.json",
  "build": "ng build",
  "test": "ng test"
}
```

### Servir en desarrollo

```bash
npm start
# abre http://localhost:4200
```

> En consola de `ng serve` deberías ver logs `[HPM] GET /surveys -> http://localhost:3000` cuando el proxy funciona.

---

## 🗂️ Estructura relevante

```
src/
  main.ts
  styles.scss
  app/
    app.ts                 # App root (navbar + <router-outlet>)
    app.html
    app.scss
    app.config.ts          # Router + HttpClient + interceptores
    app.routes.ts          # Rutas de la app
    guards/
      auth.guard.ts
      admin.guard.ts
    interceptors/
      auth-token.interceptor.ts
    services/
      auth.service.ts
      surveys.service.ts
      questions.service.ts
      options.service.ts
      public.service.ts
      results.service.ts
      users.service.ts
      exports.service.ts
    pages/
      login/               # Login (Material + Reactive Forms)
      register/            # Registro (devuelve token)
      surveys/             # Listar/crear/publicar encuestas
      survey-detail/       # Gestionar preguntas/opciones
      public-survey/       # Form público por publicId
      results/             # Resumen + serie de tiempo
      users/               # Listado ADMIN
```

---

## 🧭 Rutas

```ts
// app.routes.ts
[
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'surveys', canActivate: [authGuard], loadComponent: () => import('./pages/surveys/surveys').then(m => m.Surveys) },
  { path: 'surveys/:id', canActivate: [authGuard], loadComponent: () => import('./pages/survey-detail/survey-detail').then(m => m.SurveyDetail) },
  { path: 'public/:publicId', loadComponent: () => import('./pages/public-survey/public-survey').then(m => m.PublicSurvey) },
  { path: 'results/:id', canActivate: [authGuard], loadComponent: () => import('./pages/results/results').then(m => m.Results) },
  { path: 'users', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/users/users').then(m => m.Users) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: '' }
]
```

---

## 🔐 Autenticación

* **Login** (`/auth/login`) y **Register** (`/auth/register`) guardan `token`, `role`, `email` en `localStorage`.
* **Interceptor** agrega `Authorization: Bearer <token>` a toda petición.

`auth-token.interceptor.ts`:

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(req);
};
```

`auth.guard.ts`:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated) return true;
  router.navigate(['/login']);
  return false;
};
```

`admin.guard.ts`:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated && auth.role === 'ADMIN') return true;
  router.navigate(['/surveys']);
  return false;
};
```

---

## 🧩 Páginas clave

* **Login / Register**: Angular Material + Reactive Forms.
  Tras éxito, navegan a `/surveys`.

* **Surveys**:

  * Lista (`GET /surveys`)
  * Crear (`POST /surveys` con `{title, description}`)
  * Publicar (`PATCH /surveys/:id` `{status:'PUBLISHED'}`)
  * Accesos rápidos a:

    * Detalle `/surveys/:id`
    * Público `/public/:publicId`
    * Resultados `/results/:id`
    * Export CSV (`GET /exports/surveys/:id/responses.csv`)

* **Survey Detail**:

  * Ver encuesta (`GET /surveys/:id`)
  * Listar preguntas (`GET /surveys/:id/questions`)
  * Crear **SCALE** (`POST /surveys/:id/questions`)
  * Crear **SINGLE** (`POST /surveys/:id/questions`)
  * Crear opciones para SINGLE (`POST /questions/:questionId/options`)
  * Publicar encuesta

* **Public Survey**:

  * Metadata (`GET /public/s/:publicId`)
  * Árbol preguntas (`GET /public/s/:publicId/questions`)
  * Enviar respuestas (`POST /public/responses`)

* **Results**:

  * Resumen (`GET /results/surveys/:id/summary`)
  * Serie (`GET /results/surveys/:id/timeseries?granularity=hour`)

* **Users (ADMIN)**:

  * Listado (`GET /users`)

---

## 🎨 Estilos globales / Material

`src/styles.scss` (los `@use` deben ir arriba del archivo):

```scss
@use '@angular/material' as mat;

@include mat.core();

$theme: mat.define-theme();

@include mat.all-component-themes($theme);

/* Estilos globales */
html, body { height: 100%; margin: 0; }
```

> Si cambias el tema, hazlo aquí. Evita poner reglas **antes** de `@use` (Sass las requiere primero).

---

## 🧪 Flujo de prueba rápido

1. **Registro** (crea cuenta y token):

   * Ir a `/register` → crear usuario (ej. `admin@example.com / changeme / ADMIN`)
   * Debe redirigir a `/surveys`

2. **Crear encuesta**:

   * En `/surveys`, completa título/descr. → **Crear**
   * Debe aparecer en la tabla

3. **Detalle**:

   * Click en **editar** o en el título → `/surveys/:id`
   * Añade pregunta **SCALE** y **SINGLE**
   * Agrega **opciones** a la SINGLE
   * **Publicar**

4. **Público**:

   * Click “Público” o ve a `/public/:publicId`
   * Responde y **Enviar** → muestra `responseId`

5. **Resultados**:

   * `/results/:id` → ver **summary** y **timeseries**
   * Exportar CSV desde `/surveys`

---

## 🛠️ Troubleshooting

* **Veo llamadas a `http://localhost:4200/...` y CORS**
  Falta el proxy o no arrancaste con `--proxy-config`.

  * Revisa `proxy.conf.json`
  * `npm start` (reinicia el dev server tras cambios al proxy)
  * Observa `[HPM]` en consola

* **401 en endpoints privados**
  No hay token. Haz login/registro otra vez. Revisa interceptor.

* **404 en resultados**
  Deben ser:

  * `/results/surveys/:id/summary`
  * `/results/surveys/:id/timeseries?granularity=hour`

* **Material “@use rules must be written before any other rules.”**
  Mueve `@use '@angular/material' as mat;` al inicio de `styles.scss`.

* **Router no navega al detalle**
  Asegura `routerLink="/surveys/:id"` y que la ruta exista `surveys/:id`.
  Quita temporalmente el `authGuard` para descartar bloqueo.

---

## 🧩 Scripts útiles

```bash
# Generar servicio
ng g s src/app/services/foo

# Generar guard funcional
ng g guard src/app/guards/auth --functional

# Crear página standalone
ng g c src/app/pages/new-page --standalone --skip-tests
```

---

## 📦 Build

```bash
npm run build
# artefactos en dist/encuestas-app
```

> En producción, configura la **baseUrl**/servidor para que el frontend apunte al backend real (o usa el mismo host con reverse proxy).

---

## 📜 Licencia

MIT (o la que prefieras).

---