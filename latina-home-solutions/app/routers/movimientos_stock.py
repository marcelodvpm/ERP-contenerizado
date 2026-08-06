from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.inventario import MovimientoStockCreate, MovimientoStockOut
from app.services.inventario_service import registrar_movimiento

router = APIRouter(
    prefix="/movimientos-stock",
    tags=["catalogo-inventario"],
    dependencies=[Depends(get_current_usuario)],
)


@router.post(
    "", response_model=MovimientoStockOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "deposito"))],
)
def crear_movimiento(
    data: MovimientoStockCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return registrar_movimiento(db, data, usuario_id=usuario.id)
