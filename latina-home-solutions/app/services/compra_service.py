from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models.compra import Compra, CompraItem, EstadoCompra
from app.schemas.compra import CompraCreate
from app.schemas.inventario import MovimientoStockCreate, OrigenMovimiento, TipoMovimiento
from app.services.inventario_service import registrar_movimiento
from app.services.numeracion import generar_numero


def get_compra(db: Session, compra_id: int) -> Compra | None:
    return (
        db.query(Compra).options(joinedload(Compra.items)).filter(Compra.id == compra_id).first()
    )


def list_compras(
    db: Session,
    proveedor_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoCompra | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Compra]:
    query = db.query(Compra).options(joinedload(Compra.items))
    if proveedor_id:
        query = query.filter(Compra.proveedor_id == proveedor_id)
    if proyecto_id:
        query = query.filter(Compra.proyecto_id == proyecto_id)
    if estado:
        query = query.filter(Compra.estado == estado)
    return query.order_by(Compra.id.desc()).offset(skip).limit(limit).all()


def create_compra(db: Session, data: CompraCreate, usuario_id: int) -> Compra:
    subtotal = Decimal("0")
    items_orm = []
    for item in data.items:
        item_subtotal = item.cantidad * item.precio_unitario
        subtotal += item_subtotal
        items_orm.append(
            CompraItem(
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                subtotal=item_subtotal,
            )
        )

    compra = Compra(
        numero=generar_numero(db, Compra, "COMP"),
        proveedor_id=data.proveedor_id,
        proyecto_id=data.proyecto_id,
        usuario_id=usuario_id,
        notas=data.notas,
        subtotal=subtotal,
        total=subtotal,
        items=items_orm,
    )
    db.add(compra)
    db.commit()
    db.refresh(compra)
    return compra


def recibir_compra(db: Session, compra: Compra, deposito_id: int, usuario_id: int) -> Compra:
    """Marca la compra como recibida y da entrada a cada ítem en el depósito indicado."""
    for item in compra.items:
        registrar_movimiento(
            db,
            MovimientoStockCreate(
                producto_id=item.producto_id,
                deposito_id=deposito_id,
                tipo=TipoMovimiento.entrada,
                cantidad=item.cantidad,
                origen=OrigenMovimiento.compra,
                referencia_id=compra.id,
                notas=f"Recepción de compra {compra.numero}",
            ),
            usuario_id=usuario_id,
        )
    compra.estado = EstadoCompra.recibida
    db.commit()
    db.refresh(compra)
    return compra
