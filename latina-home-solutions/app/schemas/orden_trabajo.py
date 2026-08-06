from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class TipoOT(str, Enum):
    instalacion = "instalacion"
    reparacion = "reparacion"
    mantenimiento = "mantenimiento"


class EstadoOT(str, Enum):
    pendiente = "pendiente"
    asignada = "asignada"
    en_progreso = "en_progreso"
    completada = "completada"
    cancelada = "cancelada"


class PrioridadOT(str, Enum):
    baja = "baja"
    media = "media"
    alta = "alta"
    urgente = "urgente"


class OTItemCreate(BaseModel):
    producto_id: int
    cantidad: Decimal = Decimal("1")
    precio_unitario: Decimal


class OTItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    producto_id: int
    cantidad: Decimal
    precio_unitario: Decimal


class OrdenTrabajoCreate(BaseModel):
    cliente_id: int
    presupuesto_id: int | None = None
    proyecto_id: int | None = None
    tecnico_id: int | None = None
    tipo: TipoOT
    prioridad: PrioridadOT = PrioridadOT.media
    direccion_servicio: str | None = None
    descripcion: str | None = None
    items: list[OTItemCreate] = []


class OrdenTrabajoUpdate(BaseModel):
    tecnico_id: int | None = None
    estado: EstadoOT | None = None
    prioridad: PrioridadOT | None = None
    notas_tecnicas: str | None = None
    fecha_programada: datetime | None = None


class OrdenTrabajoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: str
    presupuesto_id: int | None
    proyecto_id: int | None
    cliente_id: int
    tecnico_id: int | None
    tipo: TipoOT
    estado: EstadoOT
    prioridad: PrioridadOT
    direccion_servicio: str | None
    descripcion: str | None
    notas_tecnicas: str | None
    fecha_solicitud: datetime
    fecha_programada: datetime | None
    fecha_completada: datetime | None
    items: list[OTItemOut] = []
