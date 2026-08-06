# ERP Eléctrico - Backend

## Puesta en marcha

1. Crear entorno virtual e instalar dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate       # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Copiar el archivo de entorno y ajustar `DATABASE_URL` con tus datos
   (usuario `erp_user`, base `erp_electrico`, puerto `5433` según lo configurado en Docker):
   ```bash
   cp .env.example .env
   ```

3. Levantar el servidor:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Abrir la documentación interactiva en:
   http://localhost:8000/docs

## Probar el flujo de autenticación

1. `POST /auth/registro` — crear un usuario (necesita un `rol_id` existente; la base ya trae
   los roles `admin`, `ventas`, `tecnico`, `deposito` desde el seed inicial — revisá sus IDs
   con `SELECT * FROM roles;`).
2. `POST /auth/login` — devuelve un `access_token`.
3. `GET /usuarios/me` — usando el botón "Authorize" en `/docs` con el token obtenido.

## Estructura

```
app/
  core/       # configuración, seguridad (JWT, hashing), dependencias
  db/         # conexión SQLAlchemy
  models/     # modelos ORM (mapean a las tablas ya existentes en Postgres)
  schemas/    # Pydantic (entrada/salida de la API)
  routers/    # endpoints, agrupados por módulo
  services/   # lógica de negocio
```

## Próximos módulos

Cada módulo nuevo (CRM, catálogo/inventario, presupuestos, órdenes de trabajo, agenda,
compras/ventas) sigue el mismo patrón: `models/` → `schemas/` → `services/` → `routers/`,
y se registra en `app/main.py`.

Nota: Alembic (migraciones) todavía no está inicializado en este scaffold — las tablas
ya existen porque se crearon directamente con `schema_erp.sql`. Cuando empecemos a evolucionar
el esquema conviene correr `alembic init alembic` y generar una migración inicial desde el
estado actual de la base, para que los cambios futuros queden versionados.
