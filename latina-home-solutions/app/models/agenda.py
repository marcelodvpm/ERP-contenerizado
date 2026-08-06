import enum

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Text, Time, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class EstadoAgenda(str, enum.Enum):
    programado = "programado"
    confirmado = "confirmado"
    completado = "completado"
    cancelado = "cancelado"


class Agenda(Base):
    __tablename__ = "agenda"

    id = Column(Integer, primary_key=True)
    tecnico_id = Column(Integer, ForeignKey("tecnicos.usuario_id"), nullable=False)
    ot_id = Column(Integer, ForeignKey("ordenes_trabajo.id"))
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    estado = Column(Enum(EstadoAgenda, name="estado_agenda"), nullable=False, default=EstadoAgenda.programado)
    notas = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
