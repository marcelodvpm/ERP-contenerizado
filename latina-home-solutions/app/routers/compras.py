from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.compra import CompraCreate, CompraOut, CompraRecibir, EstadoCompra
from app.services import compra_service

router = APIRouter(prefix="/compras", tags=["compras"], dependencies=[Depends(get_current_usuario)])


def _get_o_404(db: Session, compra_id: int):
    compra = compra_service.get_compra(db, compra_id)
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    return compra


@router.get("", response_model=list[CompraOut])
def listar_compras(
    proveedor_id: int | None = None,
    proyecto_id: int | None = None,
    estado: EstadoCompra | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return compra_service.list_compras(db, proveedor_id, proyecto_id, estado, skip, limit)


@router.post(
    "", response_model=CompraOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def crear_compra(
    data: CompraCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return compra_service.create_compra(db, data, usuario.id)


@router.get("/{compra_id}", response_model=CompraOut)
def obtener_compra(compra_id: int, db: Session = Depends(get_db)):
    return _get_o_404(db, compra_id)


@router.post(
    "/{compra_id}/recibir", response_model=CompraOut,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def recibir_compra(
    compra_id: int,
    data: CompraRecibir,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    """Marca la compra como recibida y da entrada automática al stock en el depósito indicado."""
    compra = _get_o_404(db, compra_id)
    if compra.estado != EstadoCompra.pendiente:
        raise HTTPException(status_code=400, detail="Solo se pueden recibir compras pendientes")
    return compra_service.recibir_compra(db, compra, data.deposito_id, usuario.id)
