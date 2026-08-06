from pydantic import BaseModel, ConfigDict


class TecnicoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    usuario_id: int
    nombre_completo: str
    especialidad: str | None
    zona_cobertura: str | None
    activo: bool
