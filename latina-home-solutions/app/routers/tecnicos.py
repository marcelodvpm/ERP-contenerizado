from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario
from app.db.session import get_db
from app.models.usuario import Tecnico, Usuario
from app.schemas.tecnicos import TecnicoOut

router = APIRouter(prefix="/tecnicos", tags=["tecnicos"], dependencies=[Depends(get_current_usuario)])


@router.get("", response_model=list[TecnicoOut])
def listar_tecnicos(db: Session = Depends(get_db)):
    filas = (
        db.query(Tecnico, Usuario.nombre_completo)
        .join(Usuario, Usuario.id == Tecnico.usuario_id)
        .filter(Tecnico.activo.is_(True))
        .all()
    )
    return [
        TecnicoOut(
            usuario_id=tecnico.usuario_id,
            nombre_completo=nombre,
            especialidad=tecnico.especialidad,
            zona_cobertura=tecnico.zona_cobertura,
            activo=tecnico.activo,
        )
        for tecnico, nombre in filas
    ]
