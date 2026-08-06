from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(150), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    ultimo_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    rol = relationship("Rol", back_populates="usuarios")
    tecnico = relationship("Tecnico", back_populates="usuario", uselist=False)

    @property
    def rol_nombre(self) -> str:
        return self.rol.nombre


class Tecnico(Base):
    __tablename__ = "tecnicos"

    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    especialidad = Column(String(100))
    zona_cobertura = Column(String(150))
    telefono = Column(String(30))
    activo = Column(Boolean, nullable=False, default=True)

    usuario = relationship("Usuario", back_populates="tecnico")
