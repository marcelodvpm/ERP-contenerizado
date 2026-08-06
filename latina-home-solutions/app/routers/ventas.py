from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.venta import EstadoVenta, VentaCreate, VentaOut
from app.services import venta_service

router = APIRouter(prefix="/ventas", tags=["ventas"], dependencies=[Depends(get_current_usuario)])


def _get_o_404(db: Session, venta_id: int):
    venta = venta_service.get_venta(db, venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


@router.get("", response_model=list[VentaOut])
def listar_ventas(
    cliente_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoVenta | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return venta_service.list_ventas(db, cliente_id, proyecto_id, estado, skip, limit)


@router.post(
    "", response_model=VentaOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def crear_venta(
    data: VentaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    """Si se indica deposito_id, descuenta stock automáticamente de los productos que lo manejan."""
    return venta_service.create_venta(db, data, usuario.id)


@router.get("/{venta_id}", response_model=VentaOut)
def obtener_venta(venta_id: int, db: Session = Depends(get_db)):
    return _get_o_404(db, venta_id)


@router.post(
    "/{venta_id}/marcar-pagada", response_model=VentaOut,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def marcar_pagada(venta_id: int, db: Session = Depends(get_db)):
    venta = _get_o_404(db, venta_id)
    return venta_service.marcar_pagada(db, venta)
