from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class EstadoCompra(str, Enum):
    pendiente = "pendiente"
    recibida = "recibida"
    cancelada = "cancelada"


class CompraItemCreate(BaseModel):
    producto_id: int
    cantidad: Decimal
    precio_unitario: Decimal


class CompraItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    producto_id: int
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal


class CompraCreate(BaseModel):
    proveedor_id: int
    proyecto_id: int | None = None
    notas: str | None = None
    items: list[CompraItemCreate]


class CompraUpdateEstado(BaseModel):
    estado: EstadoCompra


class CompraRecibir(BaseModel):
    deposito_id: int


class CompraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: str
    proveedor_id: int
    proyecto_id: int | None
    usuario_id: int
    fecha: date
    estado: EstadoCompra
    subtotal: Decimal
    impuestos: Decimal
    total: Decimal
    notas: str | None
    created_at: datetime
    items: list[CompraItemOut] = []
