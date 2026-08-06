from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    categoria_padre_id = Column(Integer, ForeignKey("categorias.id"))
    descripcion = Column(Text)

    subcategorias = relationship("Categoria", backref="categoria_padre", remote_side=[id])
    productos = relationship("ProductoServicio", back_populates="categoria")
