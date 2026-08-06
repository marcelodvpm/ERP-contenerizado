from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.presupuesto import (
    EstadoPresupuesto,
    PresupuestoCreate,
    PresupuestoOut,
    PresupuestoUpdateEstado,
)
from app.services import presupuesto_service

router = APIRouter(
    prefix="/presupuestos", tags=["presupuestos"], dependencies=[Depends(get_current_usuario)]
)


def _get_o_404(db: Session, presupuesto_id: int):
    presupuesto = presupuesto_service.get_presupuesto(db, presupuesto_id)
    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return presupuesto


@router.get("", response_model=list[PresupuestoOut])
def listar_presupuestos(
    cliente_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoPresupuesto | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return presupuesto_service.list_presupuestos(db, cliente_id, proyecto_id, estado, skip, limit)


@router.post(
    "", response_model=PresupuestoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def crear_presupuesto(
    data: PresupuestoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return presupuesto_service.create_presupuesto(db, data, usuario.id)


@router.get("/{presupuesto_id}", response_model=PresupuestoOut)
def obtener_presupuesto(presupuesto_id: int, db: Session = Depends(get_db)):
    return _get_o_404(db, presupuesto_id)


@router.patch(
    "/{presupuesto_id}/estado", response_model=PresupuestoOut,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def cambiar_estado_presupuesto(
    presupuesto_id: int, data: PresupuestoUpdateEstado, db: Session = Depends(get_db)
):
    presupuesto = _get_o_404(db, presupuesto_id)
    return presupuesto_service.cambiar_estado(db, presupuesto, data.estado)
