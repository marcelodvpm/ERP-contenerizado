# ERP Eléctrico - Frontend

React + TypeScript + Vite + Tailwind CSS v4.

## Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Confirmar que `.env` apunte a tu backend (por defecto ya está bien si seguiste
   la guía del backend, corriendo en `http://localhost:8000`):
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Con el backend y la base de datos ya corriendo (Docker + `uvicorn`), levantar el frontend:
   ```bash
   npm run dev
   ```

4. Abrir `http://localhost:5173` — te va a redirigir al login.

5. Usá las credenciales de tu usuario `admin` (las que ya venís usando en Swagger).

## Qué hay hecho hasta ahora

- **Login** con JWT, persistido en `localStorage` (no se pierde la sesión al refrescar).
- **Dashboard**: consume `GET /dashboard/resumen` y muestra ventas del mes, OTs por estado,
  stock crítico, presupuestos y compras pendientes, y agenda de la semana.
- **Clientes y proveedores**: listado con búsqueda y filtro por tipo, más alta de nuevos
  registros mediante un formulario modal.
- El resto de los módulos (Proyectos, Catálogo, Presupuestos, OT, Agenda, Compras, Ventas)
  aparecen en la barra lateral pero deshabilitados ("Próximamente") — se van habilitando
  a medida que se construya cada pantalla.

## Estructura

```
src/
  api/          # llamadas HTTP a cada módulo del backend (axios)
  context/      # AuthContext: sesión, token, usuario logueado
  components/   # Layout (sidebar), ProtectedRoute, StatCard
  pages/        # una página por pantalla
  types/        # interfaces TypeScript que reflejan los schemas del backend
```

## Identidad visual

Paleta grafito (`#1F2430`) + cobre (`#C17A3E`, el color del cable de cobre — un guiño
al rubro de la empresa) en vez de una paleta genérica. Tipografía Inter para la interfaz
e IBM Plex Mono para números de documento (`OT-0001`, `PRES-0001`), dándoles un aire
técnico. Los tokens de color/tipografía están centralizados en `src/index.css` (Tailwind v4,
config vía `@theme`).

## Próximos pasos

Cada módulo nuevo sigue el mismo patrón: agregar el tipo en `types/`, las funciones de
API en `api/`, la página en `pages/`, y habilitar el ítem correspondiente en
`components/Layout.tsx` (cambiar `disponible: false` a `true` y agregar la ruta en `App.tsx`).
