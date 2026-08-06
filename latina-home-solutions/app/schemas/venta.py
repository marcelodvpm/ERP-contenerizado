from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class EstadoVenta(str, Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    cancelada = "cancelada"


class VentaItemCreate(BaseModel):
    producto_servicio_id: int
    cantidad: Decimal
    precio_unitario: Decimal


class VentaItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    producto_servicio_id: int
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal


class VentaCreate(BaseModel):
    cliente_id: int
    ot_id: int | None = None
    presupuesto_id: int | None = None
    proyecto_id: int | None = None
    deposito_id: int | None = None  # de dónde se descuenta el stock; si es None, no se mueve stock
    items: list[VentaItemCreate]


class VentaUpdateEstado(BaseModel):
    estado: EstadoVenta


class VentaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: str
    cliente_id: int
    ot_id: int | None
    presupuesto_id: int | None
    proyecto_id: int | None
    usuario_id: int
    fecha: date
    estado: EstadoVenta
    subtotal: Decimal
    descuento: Decimal
    impuestos: Decimal
    total: Decimal
    items: list[VentaItemOut] = []
