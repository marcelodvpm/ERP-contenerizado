import enum

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class EstadoProyecto(str, enum.Enum):
    planificacion = "planificacion"
    activo = "activo"
    pausado = "pausado"
    finalizado = "finalizado"
    cancelado = "cancelado"


class TipoDocumentoProyecto(str, enum.Enum):
    documento = "documento"
    fotografia = "fotografia"


class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True)
    numero = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    cliente_id = Column(Integer, ForeignKey("terceros.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    estado = Column(Enum(EstadoProyecto, name="estado_proyecto"), nullable=False, default=EstadoProyecto.planificacion)
    fecha_inicio = Column(Date)
    fecha_fin_estimada = Column(Date)
    fecha_fin_real = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    tecnicos = relationship("ProyectoTecnico", back_populates="proyecto", cascade="all, delete-orphan")
    documentos = relationship("DocumentoProyecto", back_populates="proyecto", cascade="all, delete-orphan")
    costos = relationship("CostoProyecto", back_populates="proyecto", cascade="all, delete-orphan")


class ProyectoTecnico(Base):
    __tablename__ = "proyecto_tecnicos"

    proyecto_id = Column(Integer, ForeignKey("proyectos.id", ondelete="CASCADE"), primary_key=True)
    tecnico_id = Column(Integer, ForeignKey("tecnicos.usuario_id", ondelete="CASCADE"), primary_key=True)
    rol_en_proyecto = Column(String(100))

    proyecto = relationship("Proyecto", back_populates="tecnicos")


class DocumentoProyecto(Base):
    __tablename__ = "documentos_proyecto"

    id = Column(Integer, primary_key=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(Enum(TipoDocumentoProyecto, name="tipo_documento_proyecto"), nullable=False)
    nombre_archivo = Column(String(250), nullable=False)
    url_o_ruta = Column(String(500), nullable=False)
    descripcion = Column(Text)
    subido_por = Column(Integer, ForeignKey("usuarios.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    proyecto = relationship("Proyecto", back_populates="documentos")


class CostoProyecto(Base):
    __tablename__ = "costos_proyecto"

    id = Column(Integer, primary_key=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id", ondelete="CASCADE"), nullable=False)
    concepto = Column(String(200), nullable=False)
    monto = Column(Numeric(14, 2), nullable=False)
    fecha = Column(Date, server_default=func.current_date())
    notas = Column(Text)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    proyecto = relationship("Proyecto", back_populates="costos")
