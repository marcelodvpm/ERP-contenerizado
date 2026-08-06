from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class VentasMes(BaseModel):
    cantidad: int
    monto_total: Decimal


class OTPorEstado(BaseModel):
    estado: str
    cantidad: int


class StockCritico(BaseModel):
    producto_id: int
    codigo: str
    nombre: str
    stock_actual: Decimal
    stock_minimo: Decimal


class PresupuestosPendientes(BaseModel):
    cantidad: int
    monto_total: Decimal


class ComprasPendientes(BaseModel):
    cantidad: int
    monto_total: Decimal


class AgendaDia(BaseModel):
    fecha: date
    cantidad: int


class DashboardOut(BaseModel):
    ventas_mes: VentasMes
    ot_por_estado: list[OTPorEstado]
    stock_critico: list[StockCritico]
    presupuestos_pendientes: PresupuestosPendientes
    compras_pendientes: ComprasPendientes
    agenda_proxima_semana: list[AgendaDia]
