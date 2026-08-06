import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class TipoOT(str, enum.Enum):
    instalacion = "instalacion"
    reparacion = "reparacion"
    mantenimiento = "mantenimiento"


class EstadoOT(str, enum.Enum):
    pendiente = "pendiente"
    asignada = "asignada"
    en_progreso = "en_progreso"
    completada = "completada"
    cancelada = "cancelada"


class PrioridadOT(str, enum.Enum):
    baja = "baja"
    media = "media"
    alta = "alta"
    urgente = "urgente"


class OrdenTrabajo(Base):
    __tablename__ = "ordenes_trabajo"

    id = Column(Integer, primary_key=True)
    numero = Column(String(30), unique=True, nullable=False)
    presupuesto_id = Column(Integer, ForeignKey("presupuestos.id"))
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    cliente_id = Column(Integer, ForeignKey("terceros.id"), nullable=False)
    tecnico_id = Column(Integer, ForeignKey("tecnicos.usuario_id"))
    tipo = Column(Enum(TipoOT, name="tipo_ot"), nullable=False)
    estado = Column(Enum(EstadoOT, name="estado_ot"), nullable=False, default=EstadoOT.pendiente)
    prioridad = Column(Enum(PrioridadOT, name="prioridad_ot"), nullable=False, default=PrioridadOT.media)
    direccion_servicio = Column(String(250))
    descripcion = Column(Text)
    notas_tecnicas = Column(Text)
    fecha_solicitud = Column(DateTime(timezone=True), server_default=func.now())
    fecha_programada = Column(DateTime(timezone=True))
    fecha_completada = Column(DateTime(timezone=True))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("OTItem", back_populates="ot", cascade="all, delete-orphan")


class OTItem(Base):
    __tablename__ = "ot_items"

    id = Column(Integer, primary_key=True)
    ot_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos_servicios.id"), nullable=False)
    cantidad = Column(Numeric(12, 2), nullable=False, default=1)
    precio_unitario = Column(Numeric(14, 2), nullable=False)

    ot = relationship("OrdenTrabajo", back_populates="items")
