import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class TipoTercero(str, enum.Enum):
    cliente = "cliente"
    proveedor = "proveedor"
    ambos = "ambos"


class Tercero(Base):
    __tablename__ = "terceros"

    id = Column(Integer, primary_key=True)
    tipo = Column(Enum(TipoTercero, name="tipo_tercero"), nullable=False)
    razon_social = Column(String(200), nullable=False)
    nombre_fantasia = Column(String(200))
    cuit_dni = Column(String(20), unique=True)
    email = Column(String(150))
    telefono = Column(String(30))
    direccion = Column(String(250))
    ciudad = Column(String(100))
    provincia = Column(String(100))
    condicion_iva = Column(String(50))
    notas = Column(Text)
    activo = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    contactos = relationship("Contacto", back_populates="tercero", cascade="all, delete-orphan")


class Contacto(Base):
    __tablename__ = "contactos"

    id = Column(Integer, primary_key=True)
    tercero_id = Column(Integer, ForeignKey("terceros.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(150), nullable=False)
    cargo = Column(String(100))
    telefono = Column(String(30))
    email = Column(String(150))
    es_principal = Column(Boolean, nullable=False, default=False)

    tercero = relationship("Tercero", back_populates="contactos")
