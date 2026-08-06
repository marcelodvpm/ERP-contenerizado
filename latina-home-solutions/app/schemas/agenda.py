from datetime import date, datetime, time
from enum import Enum

from pydantic import BaseModel, ConfigDict


class EstadoAgenda(str, Enum):
    programado = "programado"
    confirmado = "confirmado"
    completado = "completado"
    cancelado = "cancelado"


class AgendaCreate(BaseModel):
    tecnico_id: int
    ot_id: int | None = None
    fecha: date
    hora_inicio: time
    hora_fin: time
    notas: str | None = None


class AgendaUpdate(BaseModel):
    estado: EstadoAgenda | None = None
    fecha: date | None = None
    hora_inicio: time | None = None
    hora_fin: time | None = None
    notas: str | None = None


class AgendaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tecnico_id: int
    ot_id: int | None
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: EstadoAgenda
    notas: str | None
    created_at: datetime
