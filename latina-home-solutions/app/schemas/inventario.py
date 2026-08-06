from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


# ---------- Categorías ----------

class CategoriaBase(BaseModel):
    nombre: str
    categoria_padre_id: int | None = None
    descripcion: str | None = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaOut(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Productos y servicios ----------

class TipoItem(str, Enum):
    producto = "producto"
    servicio = "servicio"


class ProductoServicioBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: str | None = None
    categoria_id: int | None = None
    tipo: TipoItem
    unidad_medida: str = "unidad"
    precio_venta: Decimal = Decimal("0")
    precio_costo: Decimal = Decimal("0")
    maneja_stock: bool = True
    stock_minimo: Decimal = Decimal("0")


class ProductoServicioCreate(ProductoServicioBase):
    pass


class ProductoServicioUpdate(BaseModel):
    codigo: str | None = None
    nombre: str | None = None
    descripcion: str | None = None
    categoria_id: int | None = None
    tipo: TipoItem | None = None
    unidad_medida: str | None = None
    precio_venta: Decimal | None = None
    precio_costo: Decimal | None = None
    maneja_stock: bool | None = None
    stock_minimo: Decimal | None = None
    activo: bool | None = None


class ProductoServicioOut(ProductoServicioBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    activo: bool
    created_at: datetime


# ---------- Depósitos ----------

class DepositoBase(BaseModel):
    nombre: str
    direccion: str | None = None


class DepositoCreate(DepositoBase):
    pass


class DepositoOut(DepositoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    activo: bool


# ---------- Stock y movimientos ----------

class StockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    producto_id: int
    deposito_id: int
    cantidad: Decimal


class TipoMovimiento(str, Enum):
    entrada = "entrada"
    salida = "salida"
    ajuste = "ajuste"
    transferencia = "transferencia"


class OrigenMovimiento(str, Enum):
    compra = "compra"
    venta = "venta"
    orden_trabajo = "orden_trabajo"
    ajuste_manual = "ajuste_manual"
    transferencia = "transferencia"


class MovimientoStockCreate(BaseModel):
    producto_id: int
    deposito_id: int
    tipo: TipoMovimiento
    cantidad: Decimal
    origen: OrigenMovimiento = OrigenMovimiento.ajuste_manual
    referencia_id: int | None = None
    notas: str | None = None


class MovimientoStockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    producto_id: int
    deposito_id: int
    tipo: TipoMovimiento
    cantidad: Decimal
    origen: OrigenMovimiento
    referencia_id: int | None
    notas: str | None
    created_at: datetime
