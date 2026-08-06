import enum

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class EstadoCompra(str, enum.Enum):
    pendiente = "pendiente"
    recibida = "recibida"
    cancelada = "cancelada"


class Compra(Base):
    __tablename__ = "compras"

    id = Column(Integer, primary_key=True)
    numero = Column(String(30), unique=True, nullable=False)
    proveedor_id = Column(Integer, ForeignKey("terceros.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    fecha = Column(Date, server_default=func.current_date())
    estado = Column(Enum(EstadoCompra, name="estado_compra"), nullable=False, default=EstadoCompra.pendiente)
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    impuestos = Column(Numeric(14, 2), nullable=False, default=0)
    total = Column(Numeric(14, 2), nullable=False, default=0)
    notas = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("CompraItem", back_populates="compra", cascade="all, delete-orphan")


class CompraItem(Base):
    __tablename__ = "compra_items"

    id = Column(Integer, primary_key=True)
    compra_id = Column(Integer, ForeignKey("compras.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos_servicios.id"), nullable=False)
    cantidad = Column(Numeric(12, 2), nullable=False)
    precio_unitario = Column(Numeric(14, 2), nullable=False)
    subtotal = Column(Numeric(14, 2), nullable=False)

    compra = relationship("Compra", back_populates="items")
