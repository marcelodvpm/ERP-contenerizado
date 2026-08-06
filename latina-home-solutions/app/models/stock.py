import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class TipoMovimiento(str, enum.Enum):
    entrada = "entrada"
    salida = "salida"
    ajuste = "ajuste"
    transferencia = "transferencia"


class OrigenMovimiento(str, enum.Enum):
    compra = "compra"
    venta = "venta"
    orden_trabajo = "orden_trabajo"
    ajuste_manual = "ajuste_manual"
    transferencia = "transferencia"


class Deposito(Base):
    __tablename__ = "depositos"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(250))
    activo = Column(Boolean, nullable=False, default=True)

    stock = relationship("Stock", back_populates="deposito")


class Stock(Base):
    __tablename__ = "stock"
    __table_args__ = (UniqueConstraint("producto_id", "deposito_id"),)

    id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("productos_servicios.id", ondelete="CASCADE"), nullable=False)
    deposito_id = Column(Integer, ForeignKey("depositos.id", ondelete="CASCADE"), nullable=False)
    cantidad = Column(Numeric(12, 2), nullable=False, default=0)

    producto = relationship("ProductoServicio", back_populates="stock")
    deposito = relationship("Deposito", back_populates="stock")


class MovimientoStock(Base):
    __tablename__ = "movimientos_stock"

    id = Column(Integer, primary_key=True)
    producto_id = Column(Integer, ForeignKey("productos_servicios.id"), nullable=False)
    deposito_id = Column(Integer, ForeignKey("depositos.id"), nullable=False)
    tipo = Column(Enum(TipoMovimiento, name="tipo_movimiento"), nullable=False)
    cantidad = Column(Numeric(12, 2), nullable=False)
    origen = Column(Enum(OrigenMovimiento, name="origen_movimiento"), nullable=False)
    referencia_id = Column(Integer)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    notas = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
