# ERP Eléctrico - Contenerizado

Sistema ERP para gestión de ventas, instalación, reparación y mantenimiento de materiales
eléctricos. Este repositorio contiene **todo el stack dockerizado** para levantarlo de forma
simple en cualquier computadora.

## ¿Para qué sirve este repo?

Permite poner en marcha la aplicación completa (base de datos + API + interfaz web) con un
solo comando, sin necesidad de instalar Python, Node ni PostgreSQL en la máquina destino.
Todo corre dentro de contenedores Docker.

## Componentes

| Servicio | Tecnología | Descripción |
|---|---|---|
| `frontend` | React + Vite + Nginx | Interfaz web del ERP (SPA). Nginx sirve el build y proxya `/api/` a la API |
| `backend` | FastAPI (Python) | API REST: autenticación, ventas, compras, presupuestos, órdenes de trabajo, stock, proyectos, técnicos, agenda |
| `db` | PostgreSQL 17 | Base de datos, inicializada automáticamente con `schema_erp.sql` |

```
ERP-contenerizado/
├── erp-frontend/            # Frontend (Dockerfile + nginx.conf)
├── latina-home-solutions/   # Backend (Dockerfile + docker-compose.yml + schema_erp.sql)
└── .gitignore
```

## Requisitos

- Docker Engine 24+ y Docker Compose (plugin `docker compose`, no el `docker-compose` antiguo).
- Instalalo en Windows con Docker Desktop: https://www.docker.com/products/docker-desktop/
- En Linux: `sudo apt install docker.io docker-compose-v2`

## Instalación en otra PC

### Opción A — Clonar desde GitHub (recomendada)

```bash
git clone https://github.com/marcelodvpm/ERP-contenerizado.git
cd ERP-contenerizado
```

### Opción B — Si ya tenés el repo en otro lado (ej. esta PC)

```bash
git pull
```

## Configuración (obligatorio)

El repo no incluye secretos. Creá el archivo de entorno del backend a partir del ejemplo:

```bash
cd latina-home-solutions
copy .env.example .env      # En Windows
cp .env.example .env        # En Linux/Mac
```

Editá `.env` y cambiá al menos `SECRET_KEY` por una clave larga y aleatoria:

```
DATABASE_URL=postgresql+psycopg2://erp_user:erp_pass@db:5432/erp_electrico
SECRET_KEY=poner-una-clave-larga-y-aleatoria-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=production
```

> Ojo: `DATABASE_URL` debe apuntar al host `db` (el nombre del servicio de Docker), no a `localhost`.

## Levantar la aplicación

Desde la carpeta `latina-home-solutions` (donde está el `docker-compose.yml`):

```bash
docker compose up -d --build
```

La primera vez descarga imágenes y compila los contenedores (puede tardar varios minutos).
Para ver si quedó todo arriba:

```bash
docker compose ps
```

## Puertos

| Servicio | URL |
|---|---|
| Aplicación web | http://localhost |
| API / docs interactivos | http://localhost:8000/docs |
| PostgreSQL (host) | localhost:5433 |

## Actualizar el código en otra PC

```bash
git pull
docker compose up -d --build   # reconstruye con los cambios
```

## Comandos útiles

```bash
docker compose logs -f         # ver logs en vivo de todos los servicios
docker compose logs -f backend # logs solo de la API
docker compose down            # detener contenedores (conserva la base de datos)
docker compose down -v         # detener y borrar la base de datos (OJO: pierde datos)
docker compose ps              # estado de los servicios
```

## Estructura de la API

El backend organiza su código en `app/`:

```
app/
  core/       # configuración, seguridad (JWT, hashing), dependencias
  db/         # conexión SQLAlchemy
  models/     # modelos ORM
  schemas/    # Pydantic (entrada/salida)
  routers/    # endpoints por módulo
  services/   # lógica de negocio
```
