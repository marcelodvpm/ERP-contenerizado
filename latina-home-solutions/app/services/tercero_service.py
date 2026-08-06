from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.tercero import Tercero, TipoTercero
from app.schemas.tercero import TerceroCreate, TerceroUpdate


def get_tercero(db: Session, tercero_id: int) -> Tercero | None:
    return db.query(Tercero).filter(Tercero.id == tercero_id).first()


def list_terceros(
    db: Session,
    tipo: TipoTercero | None = None,
    buscar: str | None = None,
    solo_activos: bool = True,
    skip: int = 0,
    limit: int = 50,
) -> list[Tercero]:
    query = db.query(Tercero)

    if solo_activos:
        query = query.filter(Tercero.activo.is_(True))

    if tipo:
        # "ambos" debe aparecer tanto en listados de clientes como de proveedores
        if tipo == TipoTercero.cliente:
            query = query.filter(Tercero.tipo.in_([TipoTercero.cliente, TipoTercero.ambos]))
        elif tipo == TipoTercero.proveedor:
            query = query.filter(Tercero.tipo.in_([TipoTercero.proveedor, TipoTercero.ambos]))
        else:
            query = query.filter(Tercero.tipo == tipo)

    if buscar:
        patron = f"%{buscar}%"
        query = query.filter(
            or_(
                Tercero.razon_social.ilike(patron),
                Tercero.nombre_fantasia.ilike(patron),
                Tercero.cuit_dni.ilike(patron),
            )
        )

    return query.order_by(Tercero.razon_social).offset(skip).limit(limit).all()


def create_tercero(db: Session, data: TerceroCreate) -> Tercero:
    tercero = Tercero(**data.model_dump())
    db.add(tercero)
    db.commit()
    db.refresh(tercero)
    return tercero


def update_tercero(db: Session, tercero: Tercero, data: TerceroUpdate) -> Tercero:
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(tercero, campo, valor)
    db.commit()
    db.refresh(tercero)
    return tercero


def desactivar_tercero(db: Session, tercero: Tercero) -> Tercero:
    tercero.activo = False
    db.commit()
    db.refresh(tercero)
    return tercero
