from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate


def get_usuario_by_username(db: Session, username: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.username == username).first()


def authenticate_usuario(db: Session, username: str, password: str) -> Usuario | None:
    usuario = get_usuario_by_username(db, username)
    if not usuario or not usuario.activo:
        return None
    if not verify_password(password, usuario.password_hash):
        return None
    return usuario


def create_usuario(db: Session, data: UsuarioCreate) -> Usuario:
    usuario = Usuario(
        username=data.username,
        email=data.email,
        nombre_completo=data.nombre_completo,
        rol_id=data.rol_id,
        password_hash=hash_password(data.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario
