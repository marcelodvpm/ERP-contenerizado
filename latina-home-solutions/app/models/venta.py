import enum

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class EstadoVenta(str, enum.Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    cancelada = "cancelada"


class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True)
    numero = Column(String(30), unique=True, nullable=False)
    cliente_id = Column(Integer, ForeignKey("terceros.id"), nullable=False)
    ot_id = Column(Integer, ForeignKey("ordenes_trabajo.id"))
    presupuesto_id = Column(Integer, ForeignKey("presupuestos.id"))
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(Date, server_default=func.current_date())
    estado = Column(Enum(EstadoVenta, name="estado_venta"), nullable=False, default=EstadoVenta.pendiente)
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    descuento = Column(Numeric(14, 2), nullable=False, default=0)
    impuestos = Column(Numeric(14, 2), nullable=False, default=0)
    total = Column(Numeric(14, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("VentaItem", back_populates="venta", cascade="all, delete-orphan")


class VentaItem(Base):
    __tablename__ = "venta_items"

    id = Column(Integer, primary_key=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False)
    producto_servicio_id = Column(Integer, ForeignKey("productos_servicios.id"), nullable=False)
    cantidad = Column(Numeric(12, 2), nullable=False)
    precio_unitario = Column(Numeric(14, 2), nullable=False)
    subtotal = Column(Numeric(14, 2), nullable=False)

    venta = relationship("Venta", back_populates="items")
