from fastapi import APIRouter, Depends

from app.core.deps import get_current_usuario
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioOut

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me", response_model=UsuarioOut)
def read_current_usuario(usuario: Usuario = Depends(get_current_usuario)):
    return usuario
