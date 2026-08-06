from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.agenda import Agenda
from app.models.compra import Compra, EstadoCompra
from app.models.orden_trabajo import OrdenTrabajo
from app.models.presupuesto import EstadoPresupuesto, Presupuesto
from app.models.producto import ProductoServicio
from app.models.stock import Stock
from app.models.venta import Venta
from app.schemas.dashboard import (
    AgendaDia,
    ComprasPendientes,
    DashboardOut,
    OTPorEstado,
    PresupuestosPendientes,
    StockCritico,
    VentasMes,
)


def _ventas_mes(db: Session) -> VentasMes:
    inicio_mes = date.today().replace(day=1)
    cantidad, monto = (
        db.query(func.count(Venta.id), func.coalesce(func.sum(Venta.total), 0))
        .filter(Venta.fecha >= inicio_mes, Venta.estado != "cancelada")
        .first()
    )
    return VentasMes(cantidad=cantidad or 0, monto_total=monto or Decimal("0"))


def _ot_por_estado(db: Session) -> list[OTPorEstado]:
    filas = (
        db.query(OrdenTrabajo.estado, func.count(OrdenTrabajo.id))
        .group_by(OrdenTrabajo.estado)
        .all()
    )
    return [OTPorEstado(estado=estado.value, cantidad=cantidad) for estado, cantidad in filas]


def _stock_critico(db: Session) -> list[StockCritico]:
    """Productos cuyo stock total (sumado entre depósitos) está por debajo del mínimo."""
    filas = (
        db.query(
            ProductoServicio.id,
            ProductoServicio.codigo,
            ProductoServicio.nombre,
            func.coalesce(func.sum(Stock.cantidad), 0).label("stock_actual"),
            ProductoServicio.stock_minimo,
        )
        .outerjoin(Stock, Stock.producto_id == ProductoServicio.id)
        .filter(ProductoServicio.maneja_stock.is_(True), ProductoServicio.activo.is_(True))
        .group_by(ProductoServicio.id)
        .having(func.coalesce(func.sum(Stock.cantidad), 0) < ProductoServicio.stock_minimo)
        .all()
    )
    return [
        StockCritico(
            producto_id=fila.id,
            codigo=fila.codigo,
            nombre=fila.nombre,
            stock_actual=fila.stock_actual,
            stock_minimo=fila.stock_minimo,
        )
        for fila in filas
    ]


def _presupuestos_pendientes(db: Session) -> PresupuestosPendientes:
    cantidad, monto = (
        db.query(func.count(Presupuesto.id), func.coalesce(func.sum(Presupuesto.total), 0))
        .filter(Presupuesto.estado == EstadoPresupuesto.enviado)
        .first()
    )
    return PresupuestosPendientes(cantidad=cantidad or 0, monto_total=monto or Decimal("0"))


def _compras_pendientes(db: Session) -> ComprasPendientes:
    cantidad, monto = (
        db.query(func.count(Compra.id), func.coalesce(func.sum(Compra.total), 0))
        .filter(Compra.estado == EstadoCompra.pendiente)
        .first()
    )
    return ComprasPendientes(cantidad=cantidad or 0, monto_total=monto or Decimal("0"))


def _agenda_proxima_semana(db: Session) -> list[AgendaDia]:
    hoy = date.today()
    en_una_semana = hoy + timedelta(days=7)
    filas = (
        db.query(Agenda.fecha, func.count(Agenda.id))
        .filter(Agenda.fecha >= hoy, Agenda.fecha <= en_una_semana)
        .filter(Agenda.estado != "cancelado")
        .group_by(Agenda.fecha)
        .order_by(Agenda.fecha)
        .all()
    )
    return [AgendaDia(fecha=fecha, cantidad=cantidad) for fecha, cantidad in filas]


def get_resumen(db: Session) -> DashboardOut:
    return DashboardOut(
        ventas_mes=_ventas_mes(db),
        ot_por_estado=_ot_por_estado(db),
        stock_critico=_stock_critico(db),
        presupuestos_pendientes=_presupuestos_pendientes(db),
        compras_pendientes=_compras_pendientes(db),
        agenda_proxima_semana=_agenda_proxima_semana(db),
    )
