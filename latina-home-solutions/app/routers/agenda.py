from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.schemas.agenda import AgendaCreate, AgendaOut, AgendaUpdate
from app.services import agenda_service

router = APIRouter(prefix="/agenda", tags=["agenda"], dependencies=[Depends(get_current_usuario)])


def _get_o_404(db: Session, agenda_id: int):
    item = agenda_service.get_agenda_item(db, agenda_id)
    if not item:
        raise HTTPException(status_code=404, detail="Turno de agenda no encontrado")
    return item


@router.get("", response_model=list[AgendaOut])
def listar_agenda(
    tecnico_id: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    db: Session = Depends(get_db),
):
    return agenda_service.list_agenda(db, tecnico_id, fecha_desde, fecha_hasta)


@router.post(
    "", response_model=AgendaOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas", "tecnico"))],
)
def crear_turno(data: AgendaCreate, db: Session = Depends(get_db)):
    if agenda_service.hay_superposicion(
        db, data.tecnico_id, data.fecha, data.hora_inicio, data.hora_fin
    ):
        raise HTTPException(
            status_code=400, detail="El técnico ya tiene un turno que se superpone ese horario"
        )
    return agenda_service.create_agenda_item(db, data)


@router.put(
    "/{agenda_id}", response_model=AgendaOut,
    dependencies=[Depends(require_roles("admin", "ventas", "tecnico"))],
)
def actualizar_turno(agenda_id: int, data: AgendaUpdate, db: Session = Depends(get_db)):
    item = _get_o_404(db, agenda_id)
    return agenda_service.update_agenda_item(db, item, data)
