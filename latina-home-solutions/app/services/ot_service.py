from sqlalchemy.orm import Session, joinedload

from app.models.orden_trabajo import EstadoOT, OrdenTrabajo, OTItem
from app.schemas.orden_trabajo import OrdenTrabajoCreate, OrdenTrabajoUpdate
from app.services.numeracion import generar_numero


def get_ot(db: Session, ot_id: int) -> OrdenTrabajo | None:
    return (
        db.query(OrdenTrabajo)
        .options(joinedload(OrdenTrabajo.items))
        .filter(OrdenTrabajo.id == ot_id)
        .first()
    )


def list_ots(
    db: Session,
    cliente_id: int | None = None,
    tecnico_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoOT | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[OrdenTrabajo]:
    query = db.query(OrdenTrabajo).options(joinedload(OrdenTrabajo.items))
    if cliente_id:
        query = query.filter(OrdenTrabajo.cliente_id == cliente_id)
    if tecnico_id:
        query = query.filter(OrdenTrabajo.tecnico_id == tecnico_id)
    if proyecto_id:
        query = query.filter(OrdenTrabajo.proyecto_id == proyecto_id)
    if estado:
        query = query.filter(OrdenTrabajo.estado == estado)
    return query.order_by(OrdenTrabajo.id.desc()).offset(skip).limit(limit).all()


def create_ot(db: Session, data: OrdenTrabajoCreate, usuario_id: int) -> OrdenTrabajo:
    items_orm = [
        OTItem(
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
        )
        for item in data.items
    ]
    estado_inicial = EstadoOT.asignada if data.tecnico_id else EstadoOT.pendiente

    ot = OrdenTrabajo(
        numero=generar_numero(db, OrdenTrabajo, "OT"),
        presupuesto_id=data.presupuesto_id,
        proyecto_id=data.proyecto_id,
        cliente_id=data.cliente_id,
        tecnico_id=data.tecnico_id,
        tipo=data.tipo,
        estado=estado_inicial,
        prioridad=data.prioridad,
        direccion_servicio=data.direccion_servicio,
        descripcion=data.descripcion,
        usuario_id=usuario_id,
        items=items_orm,
    )
    db.add(ot)
    db.commit()
    db.refresh(ot)
    return ot


def update_ot(db: Session, ot: OrdenTrabajo, data: OrdenTrabajoUpdate) -> OrdenTrabajo:
    cambios = data.model_dump(exclude_unset=True)
    for campo, valor in cambios.items():
        setattr(ot, campo, valor)

    # si se asigna un técnico y sigue en estado "pendiente", pasa a "asignada" automáticamente
    if data.tecnico_id and ot.estado == EstadoOT.pendiente:
        ot.estado = EstadoOT.asignada

    if data.estado == EstadoOT.completada:
        from datetime import datetime, timezone
        ot.fecha_completada = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ot)
    return ot
