from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models.venta import EstadoVenta, Venta, VentaItem
from app.schemas.inventario import MovimientoStockCreate, OrigenMovimiento, TipoMovimiento
from app.schemas.venta import VentaCreate
from app.services.inventario_service import registrar_movimiento
from app.services.numeracion import generar_numero
from app.services.producto_service import get_producto


def get_venta(db: Session, venta_id: int) -> Venta | None:
    return db.query(Venta).options(joinedload(Venta.items)).filter(Venta.id == venta_id).first()


def list_ventas(
    db: Session,
    cliente_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoVenta | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Venta]:
    query = db.query(Venta).options(joinedload(Venta.items))
    if cliente_id:
        query = query.filter(Venta.cliente_id == cliente_id)
    if proyecto_id:
        query = query.filter(Venta.proyecto_id == proyecto_id)
    if estado:
        query = query.filter(Venta.estado == estado)
    return query.order_by(Venta.id.desc()).offset(skip).limit(limit).all()


def create_venta(db: Session, data: VentaCreate, usuario_id: int) -> Venta:
    subtotal = Decimal("0")
    items_orm = []
    for item in data.items:
        item_subtotal = item.cantidad * item.precio_unitario
        subtotal += item_subtotal
        items_orm.append(
            VentaItem(
                producto_servicio_id=item.producto_servicio_id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=item_subtotal,
            )
        )

    venta = Venta(
        numero=generar_numero(db, Venta, "VTA"),
        cliente_id=data.cliente_id,
        ot_id=data.ot_id,
        presupuesto_id=data.presupuesto_id,
        proyecto_id=data.proyecto_id,
        usuario_id=usuario_id,
        subtotal=subtotal,
        total=subtotal,
        items=items_orm,
    )
    db.add(venta)
    db.commit()
    db.refresh(venta)

    # Si se indicó depósito, descontar stock de los productos que lo manejan
    if data.deposito_id:
        for item in data.items:
            producto = get_producto(db, item.producto_servicio_id)
            if producto and producto.maneja_stock:
                registrar_movimiento(
                    db,
                    MovimientoStockCreate(
                        producto_id=item.producto_servicio_id,
                        deposito_id=data.deposito_id,
                        tipo=TipoMovimiento.salida,
                        cantidad=item.cantidad,
                        origen=OrigenMovimiento.venta,
                        referencia_id=venta.id,
                        notas=f"Salida por venta {venta.numero}",
                    ),
                    usuario_id=usuario_id,
                )

    return venta


def marcar_pagada(db: Session, venta: Venta) -> Venta:
    venta.estado = EstadoVenta.pagada
    db.commit()
    db.refresh(venta)
    return venta
