from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class EstadoProyecto(str, Enum):
    planificacion = "planificacion"
    activo = "activo"
    pausado = "pausado"
    finalizado = "finalizado"
    cancelado = "cancelado"


class TipoDocumentoProyecto(str, Enum):
    documento = "documento"
    fotografia = "fotografia"


class ProyectoCreate(BaseModel):
    nombre: str
    descripcion: str | None = None
    cliente_id: int
    fecha_inicio: date | None = None
    fecha_fin_estimada: date | None = None


class ProyectoUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    estado: EstadoProyecto | None = None
    fecha_inicio: date | None = None
    fecha_fin_estimada: date | None = None
    fecha_fin_real: date | None = None


class ProyectoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: str
    nombre: str
    descripcion: str | None
    cliente_id: int
    usuario_id: int
    estado: EstadoProyecto
    fecha_inicio: date | None
    fecha_fin_estimada: date | None
    fecha_fin_real: date | None
    created_at: datetime


class ProyectoTecnicoCreate(BaseModel):
    tecnico_id: int
    rol_en_proyecto: str | None = None


class ProyectoTecnicoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    proyecto_id: int
    tecnico_id: int
    rol_en_proyecto: str | None


class DocumentoProyectoCreate(BaseModel):
    tipo: TipoDocumentoProyecto
    nombre_archivo: str
    url_o_ruta: str
    descripcion: str | None = None


class DocumentoProyectoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    proyecto_id: int
    tipo: TipoDocumentoProyecto
    nombre_archivo: str
    url_o_ruta: str
    descripcion: str | None
    subido_por: int | None
    created_at: datetime


class CostoProyectoCreate(BaseModel):
    concepto: str
    monto: Decimal
    fecha: date | None = None
    notas: str | None = None


class CostoProyectoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    proyecto_id: int
    concepto: str
    monto: Decimal
    fecha: date
    notas: str | None
    usuario_id: int | None


class ProyectoResumen(BaseModel):
    """Vista consolidada de todo lo que cuelga de un proyecto."""
    proyecto: ProyectoOut
    total_presupuestado: Decimal
    total_comprado: Decimal
    total_vendido: Decimal
    total_costos_adicionales: Decimal
    cantidad_ots: int
    cantidad_ots_completadas: int
