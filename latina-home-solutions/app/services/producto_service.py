from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.producto import ProductoServicio, TipoItem
from app.models.categoria import Categoria
from app.models.stock import Deposito
from app.schemas.inventario import (
    CategoriaCreate,
    DepositoCreate,
    ProductoServicioCreate,
    ProductoServicioUpdate,
)


# ---------- Categorías ----------

def list_categorias(db: Session) -> list[Categoria]:
    return db.query(Categoria).order_by(Categoria.nombre).all()


def create_categoria(db: Session, data: CategoriaCreate) -> Categoria:
    categoria = Categoria(**data.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


# ---------- Productos y servicios ----------

def get_producto(db: Session, producto_id: int) -> ProductoServicio | None:
    return db.query(ProductoServicio).filter(ProductoServicio.id == producto_id).first()


def list_productos(
    db: Session,
    tipo: TipoItem | None = None,
    categoria_id: int | None = None,
    buscar: str | None = None,
    solo_activos: bool = True,
    skip: int = 0,
    limit: int = 50,
) -> list[ProductoServicio]:
    query = db.query(ProductoServicio)

    if solo_activos:
        query = query.filter(ProductoServicio.activo.is_(True))
    if tipo:
        query = query.filter(ProductoServicio.tipo == tipo)
    if categoria_id:
        query = query.filter(ProductoServicio.categoria_id == categoria_id)
    if buscar:
        patron = f"%{buscar}%"
        query = query.filter(
            or_(ProductoServicio.nombre.ilike(patron), ProductoServicio.codigo.ilike(patron))
        )

    return query.order_by(ProductoServicio.nombre).offset(skip).limit(limit).all()


def create_producto(db: Session, data: ProductoServicioCreate) -> ProductoServicio:
    producto = ProductoServicio(**data.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def update_producto(
    db: Session, producto: ProductoServicio, data: ProductoServicioUpdate
) -> ProductoServicio:
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return producto


def desactivar_producto(db: Session, producto: ProductoServicio) -> ProductoServicio:
    producto.activo = False
    db.commit()
    db.refresh(producto)
    return producto


# ---------- Depósitos ----------

def list_depositos(db: Session) -> list[Deposito]:
    return db.query(Deposito).filter(Deposito.activo.is_(True)).order_by(Deposito.nombre).all()


def create_deposito(db: Session, data: DepositoCreate) -> Deposito:
    deposito = Deposito(**data.model_dump())
    db.add(deposito)
    db.commit()
    db.refresh(deposito)
    return deposito
