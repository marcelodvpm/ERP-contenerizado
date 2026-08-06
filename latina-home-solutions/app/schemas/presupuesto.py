from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class EstadoPresupuesto(str, Enum):
    borrador = "borrador"
    enviado = "enviado"
    aprobado = "aprobado"
    rechazado = "rechazado"
    vencido = "vencido"


class PresupuestoItemCreate(BaseModel):
    producto_servicio_id: int
    descripcion: str | None = None
    cantidad: Decimal = Decimal("1")
    precio_unitario: Decimal
    descuento: Decimal = Decimal("0")


class PresupuestoItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    producto_servicio_id: int
    descripcion: str | None
    cantidad: Decimal
    precio_unitario: Decimal
    descuento: Decimal
    subtotal: Decimal


class PresupuestoCreate(BaseModel):
    cliente_id: int
    proyecto_id: int | None = None
    fecha_validez: date | None = None
    notas: str | None = None
    items: list[PresupuestoItemCreate]


class PresupuestoUpdateEstado(BaseModel):
    estado: EstadoPresupuesto


class PresupuestoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: str
    cliente_id: int
    proyecto_id: int | None
    usuario_id: int
    fecha: date
    fecha_validez: date | None
    estado: EstadoPresupuesto
    subtotal: Decimal
    descuento: Decimal
    impuestos: Decimal
    total: Decimal
    notas: str | None
    created_at: datetime
    items: list[PresupuestoItemOut] = []
