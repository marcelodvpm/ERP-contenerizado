import enum

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class EstadoPresupuesto(str, enum.Enum):
    borrador = "borrador"
    enviado = "enviado"
    aprobado = "aprobado"
    rechazado = "rechazado"
    vencido = "vencido"


class Presupuesto(Base):
    __tablename__ = "presupuestos"

    id = Column(Integer, primary_key=True)
    numero = Column(String(30), unique=True, nullable=False)
    cliente_id = Column(Integer, ForeignKey("terceros.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    fecha = Column(Date, server_default=func.current_date())
    fecha_validez = Column(Date)
    estado = Column(
        Enum(EstadoPresupuesto, name="estado_presupuesto"),
        nullable=False,
        default=EstadoPresupuesto.borrador,
    )
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    descuento = Column(Numeric(14, 2), nullable=False, default=0)
    impuestos = Column(Numeric(14, 2), nullable=False, default=0)
    total = Column(Numeric(14, 2), nullable=False, default=0)
    notas = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship(
        "PresupuestoItem", back_populates="presupuesto", cascade="all, delete-orphan"
    )


class PresupuestoItem(Base):
    __tablename__ = "presupuesto_items"

    id = Column(Integer, primary_key=True)
    presupuesto_id = Column(Integer, ForeignKey("presupuestos.id", ondelete="CASCADE"), nullable=False)
    producto_servicio_id = Column(Integer, ForeignKey("productos_servicios.id"), nullable=False)
    descripcion = Column(String(250))
    cantidad = Column(Numeric(12, 2), nullable=False, default=1)
    precio_unitario = Column(Numeric(14, 2), nullable=False)
    descuento = Column(Numeric(14, 2), nullable=False, default=0)
    subtotal = Column(Numeric(14, 2), nullable=False)

    presupuesto = relationship("Presupuesto", back_populates="items")
