from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.orden_trabajo import (
    EstadoOT,
    OrdenTrabajoCreate,
    OrdenTrabajoOut,
    OrdenTrabajoUpdate,
)
from app.services import ot_service

router = APIRouter(
    prefix="/ordenes-trabajo", tags=["ordenes-trabajo"], dependencies=[Depends(get_current_usuario)]
)


def _get_o_404(db: Session, ot_id: int):
    ot = ot_service.get_ot(db, ot_id)
    if not ot:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    return ot


@router.get("", response_model=list[OrdenTrabajoOut])
def listar_ots(
    cliente_id: int | None = None,
    tecnico_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoOT | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return ot_service.list_ots(db, cliente_id, tecnico_id, proyecto_id, estado, skip, limit)


@router.post(
    "", response_model=OrdenTrabajoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def crear_ot(
    data: OrdenTrabajoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return ot_service.create_ot(db, data, usuario.id)


@router.get("/{ot_id}", response_model=OrdenTrabajoOut)
def obtener_ot(ot_id: int, db: Session = Depends(get_db)):
    return _get_o_404(db, ot_id)


@router.put(
    "/{ot_id}", response_model=OrdenTrabajoOut,
    dependencies=[Depends(require_roles("admin", "ventas", "tecnico"))],
)
def actualizar_ot(ot_id: int, data: OrdenTrabajoUpdate, db: Session = Depends(get_db)):
    ot = _get_o_404(db, ot_id)
    return ot_service.update_ot(db, ot, data)
