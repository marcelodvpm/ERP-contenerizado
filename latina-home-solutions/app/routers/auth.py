from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas.usuario import TokenResponse, UsuarioCreate, UsuarioOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = auth_service.authenticate_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    token = create_access_token(data={"sub": usuario.username})
    return TokenResponse(access_token=token)


@router.post("/registro", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registro(data: UsuarioCreate, db: Session = Depends(get_db)):
    if auth_service.get_usuario_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="El username ya existe")
    return auth_service.create_usuario(db, data)
