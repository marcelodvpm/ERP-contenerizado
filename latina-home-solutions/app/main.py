from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    agenda,
    auth,
    compras,
    dashboard,
    movimientos_stock,
    ordenes_trabajo,
    presupuestos,
    productos,
    proyectos,
    tecnicos,
    terceros,
    usuarios,
    ventas,
)

app = FastAPI(
    title="ERP Eléctrico API",
    description="API para gestión de ventas, instalación, reparación y mantenimiento",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # el frontend en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(terceros.router)
app.include_router(productos.categorias_router)
app.include_router(productos.depositos_router)
app.include_router(productos.router)
app.include_router(movimientos_stock.router)
app.include_router(presupuestos.router)
app.include_router(ordenes_trabajo.router)
app.include_router(agenda.router)
app.include_router(compras.router)
app.include_router(ventas.router)
app.include_router(dashboard.router)
app.include_router(proyectos.router)
app.include_router(tecnicos.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
