from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario, require_roles
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.proyecto import (
    CostoProyectoCreate,
    CostoProyectoOut,
    DocumentoProyectoCreate,
    DocumentoProyectoOut,
    EstadoProyecto,
    ProyectoCreate,
    ProyectoOut,
    ProyectoResumen,
    ProyectoTecnicoCreate,
    ProyectoTecnicoOut,
    ProyectoUpdate,
)
from app.services import proyecto_service

router = APIRouter(
    prefix="/proyectos", tags=["proyectos"], dependencies=[Depends(get_current_usuario)]
)


def _get_o_404(db: Session, proyecto_id: int):
    proyecto = proyecto_service.get_proyecto(db, proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.get("", response_model=list[ProyectoOut])
def listar_proyectos(
    cliente_id: int | None = None,
    estado: EstadoProyecto | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return proyecto_service.list_proyectos(db, cliente_id, estado, skip, limit)


@router.post(
    "", response_model=ProyectoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def crear_proyecto(
    data: ProyectoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    return proyecto_service.create_proyecto(db, data, usuario.id)


@router.get("/{proyecto_id}", response_model=ProyectoOut)
def obtener_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    return _get_o_404(db, proyecto_id)


@router.put(
    "/{proyecto_id}", response_model=ProyectoOut,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def actualizar_proyecto(proyecto_id: int, data: ProyectoUpdate, db: Session = Depends(get_db)):
    proyecto = _get_o_404(db, proyecto_id)
    return proyecto_service.update_proyecto(db, proyecto, data)


@router.get("/{proyecto_id}/resumen", response_model=ProyectoResumen)
def resumen_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Totales agregados: presupuestado, comprado, vendido, costos adicionales y estado de OTs."""
    proyecto = _get_o_404(db, proyecto_id)
    return proyecto_service.get_resumen(db, proyecto)


@router.post(
    "/{proyecto_id}/tecnicos", response_model=ProyectoTecnicoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def asignar_tecnico(
    proyecto_id: int, data: ProyectoTecnicoCreate, db: Session = Depends(get_db)
):
    _get_o_404(db, proyecto_id)
    return proyecto_service.asignar_tecnico(db, proyecto_id, data)


@router.post(
    "/{proyecto_id}/documentos",
    response_model=DocumentoProyectoOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas", "tecnico"))],
)
def agregar_documento(
    proyecto_id: int,
    data: DocumentoProyectoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    _get_o_404(db, proyecto_id)
    return proyecto_service.agregar_documento(db, proyecto_id, data, usuario.id)


@router.post(
    "/{proyecto_id}/costos", response_model=CostoProyectoOut, status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "ventas"))],
)
def agregar_costo(
    proyecto_id: int,
    data: CostoProyectoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_usuario),
):
    _get_o_404(db, proyecto_id)
    return proyecto_service.agregar_costo(db, proyecto_id, data, usuario.id)
