from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.producto import ProductoServicio, TipoItem
from app.schemas.inventario import (
    CategoriaCreate,
    CategoriaOut,
    DepositoCreate,
    DepositoOut,
    ProductoServicioCreate,
    ProductoServicioOut,
    ProductoServicioUpdate,
    StockOut,
)
from app.services import producto_service
from app.services.inventario_service import get_stock_producto

router = APIRouter(
    prefix="/productos",
    tags=["catalogo-inventario"],
    dependencies=[Depends(get_current_usuario)],
)

categorias_router = APIRouter(
    prefix="/categorias", tags=["catalogo-inventario"], dependencies=[Depends(get_current_usuario)]
)

depositos_router = APIRouter(
    prefix="/depositos", tags=["catalogo-inventario"], dependencies=[Depends(get_current_usuario)]
)


# ---------- Categorías ----------

@categorias_router.get("", response_model=list[CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return producto_service.list_categorias(db)


@categorias_router.post(
    "", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    return producto_service.create_categoria(db, data)


# ---------- Depósitos ----------

@depositos_router.get("", response_model=list[DepositoOut])
def listar_depositos(db: Session = Depends(get_db)):
    return producto_service.list_depositos(db)


@depositos_router.post(
    "", response_model=DepositoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def crear_deposito(data: DepositoCreate, db: Session = Depends(get_db)):
    return producto_service.create_deposito(db, data)


# ---------- Productos y servicios ----------

def _get_producto_o_404(db: Session, producto_id: int) -> ProductoServicio:
    producto = producto_service.get_producto(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto/servicio no encontrado")
    return producto


@router.get("", response_model=list[ProductoServicioOut])
def listar_productos(
    tipo: TipoItem | None = None,
    categoria_id: int | None = None,
    buscar: str | None = None,
    solo_activos: bool = True,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return producto_service.list_productos(
        db, tipo, categoria_id, buscar, solo_activos, skip, limit
    )


@router.post(
    "", response_model=ProductoServicioOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def crear_producto(data: ProductoServicioCreate, db: Session = Depends(get_db)):
    existente = (
        db.query(ProductoServicio).filter(ProductoServicio.codigo == data.codigo).first()
    )
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un producto con ese código")
    return producto_service.create_producto(db, data)


@router.get("/{producto_id}", response_model=ProductoServicioOut)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    return _get_producto_o_404(db, producto_id)


@router.put(
    "/{producto_id}", response_model=ProductoServicioOut,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def actualizar_producto(
    producto_id: int, data: ProductoServicioUpdate, db: Session = Depends(get_db)
):
    producto = _get_producto_o_404(db, producto_id)
    return producto_service.update_producto(db, producto, data)


@router.delete(
    "/{producto_id}", response_model=ProductoServicioOut,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def desactivar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = _get_producto_o_404(db, producto_id)
    return producto_service.desactivar_producto(db, producto)


@router.get("/{producto_id}/stock", response_model=list[StockOut])
def obtener_stock(producto_id: int, db: Session = Depends(get_db)):
    _get_producto_o_404(db, producto_id)
    return get_stock_producto(db, producto_id)
