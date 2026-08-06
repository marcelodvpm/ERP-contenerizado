from datetime import date

from sqlalchemy.orm import Session

from app.models.agenda import Agenda
from app.schemas.agenda import AgendaCreate, AgendaUpdate


def get_agenda_item(db: Session, agenda_id: int) -> Agenda | None:
    return db.query(Agenda).filter(Agenda.id == agenda_id).first()


def list_agenda(
    db: Session,
    tecnico_id: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
) -> list[Agenda]:
    query = db.query(Agenda)
    if tecnico_id:
        query = query.filter(Agenda.tecnico_id == tecnico_id)
    if fecha_desde:
        query = query.filter(Agenda.fecha >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Agenda.fecha <= fecha_hasta)
    return query.order_by(Agenda.fecha, Agenda.hora_inicio).all()


def hay_superposicion(db: Session, tecnico_id: int, fecha: date, hora_inicio, hora_fin) -> bool:
    """Chequea si el técnico ya tiene un turno que se solapa ese día."""
    conflictos = (
        db.query(Agenda)
        .filter(
            Agenda.tecnico_id == tecnico_id,
            Agenda.fecha == fecha,
            Agenda.hora_inicio < hora_fin,
            Agenda.hora_fin > hora_inicio,
        )
        .count()
    )
    return conflictos > 0


def create_agenda_item(db: Session, data: AgendaCreate) -> Agenda:
    item = Agenda(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_agenda_item(db: Session, item: Agenda, data: AgendaUpdate) -> Agenda:
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item
