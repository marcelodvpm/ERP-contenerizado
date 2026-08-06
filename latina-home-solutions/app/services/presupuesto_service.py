from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models.presupuesto import EstadoPresupuesto, Presupuesto, PresupuestoItem
from app.schemas.presupuesto import PresupuestoCreate
from app.services.numeracion import generar_numero


def get_presupuesto(db: Session, presupuesto_id: int) -> Presupuesto | None:
    return (
        db.query(Presupuesto)
        .options(joinedload(Presupuesto.items))
        .filter(Presupuesto.id == presupuesto_id)
        .first()
    )


def list_presupuestos(
    db: Session,
    cliente_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoPresupuesto | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Presupuesto]:
    query = db.query(Presupuesto).options(joinedload(Presupuesto.items))
    if cliente_id:
        query = query.filter(Presupuesto.cliente_id == cliente_id)
    if proyecto_id:
        query = query.filter(Presupuesto.proyecto_id == proyecto_id)
    if estado:
        query = query.filter(Presupuesto.estado == estado)
    return query.order_by(Presupuesto.id.desc()).offset(skip).limit(limit).all()


def create_presupuesto(db: Session, data: PresupuestoCreate, usuario_id: int) -> Presupuesto:
    subtotal = Decimal("0")
    items_orm = []
    for item in data.items:
        item_subtotal = (item.cantidad * item.precio_unitario) - item.descuento
        subtotal += item_subtotal
        items_orm.append(
            PresupuestoItem(
                producto_servicio_id=item.producto_servicio_id,
                descripcion=item.descripcion,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
                descuento=item.descuento,
                subtotal=item_subtotal,
            )
        )

    presupuesto = Presupuesto(
        numero=generar_numero(db, Presupuesto, "PRES"),
        cliente_id=data.cliente_id,
        proyecto_id=data.proyecto_id,
        usuario_id=usuario_id,
        fecha_validez=data.fecha_validez,
        notas=data.notas,
        subtotal=subtotal,
        total=subtotal,  # sin descuento/impuestos globales por ahora
        items=items_orm,
    )
    db.add(presupuesto)
    db.commit()
    db.refresh(presupuesto)
    return presupuesto


def cambiar_estado(db: Session, presupuesto: Presupuesto, estado: EstadoPresupuesto) -> Presupuesto:
    presupuesto.estado = estado
    db.commit()
    db.refresh(presupuesto)
    return presupuesto
