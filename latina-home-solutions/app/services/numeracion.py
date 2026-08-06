from sqlalchemy import func
from sqlalchemy.orm import Session


def generar_numero(db: Session, modelo, prefijo: str) -> str:
    """Genera un número correlativo simple: PREFIJO-0001, PREFIJO-0002, ..."""
    total = db.query(func.count(modelo.id)).scalar() or 0
    return f"{prefijo}-{total + 1:04d}"
