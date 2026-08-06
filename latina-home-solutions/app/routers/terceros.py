from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.tercero import Contacto, Tercero, TipoTercero
from app.schemas.tercero import (
    ContactoCreate,
    ContactoOut,
    TerceroCreate,
    TerceroOut,
    TerceroUpdate,
)
from app.services import tercero_service

router = APIRouter(
    prefix="/terceros",
    tags=["terceros"],
    dependencies=[Depends(get_current_usuario)],  # todos los endpoints requieren login
)


def _get_tercero_o_404(db: Session, tercero_id: int) -> Tercero:
    tercero = tercero_service.get_tercero(db, tercero_id)
    if not tercero:
        raise HTTPException(status_code=404, detail="Tercero no encontrado")
    return tercero


@router.get("", response_model=list[TerceroOut])
def listar_terceros(
    tipo: TipoTercero | None = None,
    buscar: str | None = None,
    solo_activos: bool = True,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return tercero_service.list_terceros(db, tipo, buscar, solo_activos, skip, limit)


@router.post(
    "", response_model=TerceroOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def crear_tercero(data: TerceroCreate, db: Session = Depends(get_db)):
    if data.cuit_dni:
        existente = (
            db.query(Tercero).filter(Tercero.cuit_dni == data.cuit_dni).first()
        )
        if existente:
            raise HTTPException(status_code=400, detail="Ya existe un tercero con ese CUIT/DNI")
    return tercero_service.create_tercero(db, data)


@router.get("/{tercero_id}", response_model=TerceroOut)
def obtener_tercero(tercero_id: int, db: Session = Depends(get_db)):
    return _get_tercero_o_404(db, tercero_id)


@router.put(
    "/{tercero_id}", response_model=TerceroOut,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def actualizar_tercero(tercero_id: int, data: TerceroUpdate, db: Session = Depends(get_db)):
    tercero = _get_tercero_o_404(db, tercero_id)
    return tercero_service.update_tercero(db, tercero, data)


@router.delete(
    "/{tercero_id}", response_model=TerceroOut,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def desactivar_tercero(tercero_id: int, db: Session = Depends(get_db)):
    """Baja lógica: no se borra el registro (queda referenciado por ventas/compras/OTs),
    solo se marca como inactivo."""
    tercero = _get_tercero_o_404(db, tercero_id)
    return tercero_service.desactivar_tercero(db, tercero)


@router.post(
    "/{tercero_id}/contactos", response_model=ContactoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def agregar_contacto(tercero_id: int, data: ContactoCreate, db: Session = Depends(get_db)):
    _get_tercero_o_404(db, tercero_id)
    contacto = Contacto(tercero_id=tercero_id, **data.model_dump())
    db.add(contacto)
    db.commit()
    db.refresh(contacto)
    return contacto
