import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class TipoItem(str, enum.Enum):
    producto = "producto"
    servicio = "servicio"


class ProductoServicio(Base):
    __tablename__ = "productos_servicios"

    id = Column(Integer, primary_key=True)
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    tipo = Column(Enum(TipoItem, name="tipo_item"), nullable=False)
    unidad_medida = Column(String(20), nullable=False, default="unidad")
    precio_venta = Column(Numeric(14, 2), nullable=False, default=0)
    precio_costo = Column(Numeric(14, 2), nullable=False, default=0)
    maneja_stock = Column(Boolean, nullable=False, default=True)
    stock_minimo = Column(Numeric(12, 2), default=0)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    categoria = relationship("Categoria", back_populates="productos")
    stock = relationship("Stock", back_populates="producto")
