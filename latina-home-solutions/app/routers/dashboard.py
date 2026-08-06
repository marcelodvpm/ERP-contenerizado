from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_usuario
from app.db.session import get_db
from app.schemas.dashboard import DashboardOut
from app.services.dashboard_service import get_resumen

router = APIRouter(
    prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_usuario)]
)


@router.get("/resumen", response_model=DashboardOut)
def resumen(db: Session = Depends(get_db)):
    return get_resumen(db)
