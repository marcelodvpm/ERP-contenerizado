from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.compra import Compra
from app.models.orden_trabajo import EstadoOT, OrdenTrabajo
from app.models.presupuesto import Presupuesto
from app.models.proyecto import CostoProyecto, DocumentoProyecto, Proyecto, ProyectoTecnico
from app.models.venta import Venta
from app.schemas.proyecto import (
    CostoProyectoCreate,
    DocumentoProyectoCreate,
    ProyectoCreate,
    ProyectoResumen,
    ProyectoTecnicoCreate,
    ProyectoUpdate,
)
from app.services.numeracion import generar_numero


def get_proyecto(db: Session, proyecto_id: int) -> Proyecto | None:
    return (
        db.query(Proyecto)
        .options(joinedload(Proyecto.tecnicos), joinedload(Proyecto.documentos), joinedload(Proyecto.costos))
        .filter(Proyecto.id == proyecto_id)
        .first()
    )


def list_proyectos(
    db: Session,
    cliente_id: int | None = None,
    estado=None,
    skip: int = 0,
    limit: int = 50,
) -> list[Proyecto]:
    query = db.query(Proyecto)
    if cliente_id:
        query = query.filter(Proyecto.cliente_id == cliente_id)
    if estado:
        query = query.filter(Proyecto.estado == estado)
    return query.order_by(Proyecto.id.desc()).offset(skip).limit(limit).all()


def create_proyecto(db: Session, data: ProyectoCreate, usuario_id: int) -> Proyecto:
    proyecto = Proyecto(
        numero=generar_numero(db, Proyecto, "PROY"),
        nombre=data.nombre,
        descripcion=data.descripcion,
        cliente_id=data.cliente_id,
        usuario_id=usuario_id,
        fecha_inicio=data.fecha_inicio,
        fecha_fin_estimada=data.fecha_fin_estimada,
    )
    db.add(proyecto)
    db.commit()
    db.refresh(proyecto)
    return proyecto


def update_proyecto(db: Session, proyecto: Proyecto, data: ProyectoUpdate) -> Proyecto:
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(proyecto, campo, valor)
    db.commit()
    db.refresh(proyecto)
    return proyecto


def asignar_tecnico(db: Session, proyecto_id: int, data: ProyectoTecnicoCreate) -> ProyectoTecnico:
    asignacion = ProyectoTecnico(
        proyecto_id=proyecto_id, tecnico_id=data.tecnico_id, rol_en_proyecto=data.rol_en_proyecto
    )
    db.merge(asignacion)  # merge para que sea idempotente si ya existía esa asignación
    db.commit()
    return asignacion


def agregar_documento(
    db: Session, proyecto_id: int, data: DocumentoProyectoCreate, usuario_id: int
) -> DocumentoProyecto:
    documento = DocumentoProyecto(
        proyecto_id=proyecto_id,
        tipo=data.tipo,
        nombre_archivo=data.nombre_archivo,
        url_o_ruta=data.url_o_ruta,
        descripcion=data.descripcion,
        subido_por=usuario_id,
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)
    return documento


def agregar_costo(
    db: Session, proyecto_id: int, data: CostoProyectoCreate, usuario_id: int
) -> CostoProyecto:
    costo = CostoProyecto(
        proyecto_id=proyecto_id,
        concepto=data.concepto,
        monto=data.monto,
        fecha=data.fecha,
        notas=data.notas,
        usuario_id=usuario_id,
    )
    db.add(costo)
    db.commit()
    db.refresh(costo)
    return costo


def get_resumen(db: Session, proyecto: Proyecto) -> ProyectoResumen:
    """Agrega todo lo que cuelga del proyecto: presupuestado, comprado, vendido, costos, OTs."""
    total_presupuestado = (
        db.query(func.coalesce(func.sum(Presupuesto.total), 0))
        .filter(Presupuesto.proyecto_id == proyecto.id)
        .scalar()
    )
    total_comprado = (
        db.query(func.coalesce(func.sum(Compra.total), 0))
        .filter(Compra.proyecto_id == proyecto.id)
        .scalar()
    )
    total_vendido = (
        db.query(func.coalesce(func.sum(Venta.total), 0))
        .filter(Venta.proyecto_id == proyecto.id)
        .scalar()
    )
    total_costos = (
        db.query(func.coalesce(func.sum(CostoProyecto.monto), 0))
        .filter(CostoProyecto.proyecto_id == proyecto.id)
        .scalar()
    )
    cantidad_ots = db.query(func.count(OrdenTrabajo.id)).filter(
        OrdenTrabajo.proyecto_id == proyecto.id
    ).scalar()
    cantidad_completadas = (
        db.query(func.count(OrdenTrabajo.id))
        .filter(OrdenTrabajo.proyecto_id == proyecto.id, OrdenTrabajo.estado == EstadoOT.completada)
        .scalar()
    )

    return ProyectoResumen(
        proyecto=proyecto,
        total_presupuestado=total_presupuestado or Decimal("0"),
        total_comprado=total_comprado or Decimal("0"),
        total_vendido=total_vendido or Decimal("0"),
        total_costos_adicionales=total_costos or Decimal("0"),
        cantidad_ots=cantidad_ots or 0,
        cantidad_ots_completadas=cantidad_completadas or 0,
    )
