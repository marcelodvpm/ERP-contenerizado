from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class TipoTercero(str, Enum):
    cliente = "cliente"
    proveedor = "proveedor"
    ambos = "ambos"


class ContactoBase(BaseModel):
    nombre: str
    cargo: str | None = None
    telefono: str | None = None
    email: str | None = None
    es_principal: bool = False


class ContactoCreate(ContactoBase):
    pass


class ContactoOut(ContactoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TerceroBase(BaseModel):
    tipo: TipoTercero
    razon_social: str
    nombre_fantasia: str | None = None
    cuit_dni: str | None = None
    email: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    condicion_iva: str | None = None
    notas: str | None = None


class TerceroCreate(TerceroBase):
    pass


class TerceroUpdate(BaseModel):
    tipo: TipoTercero | None = None
    razon_social: str | None = None
    nombre_fantasia: str | None = None
    cuit_dni: str | None = None
    email: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    condicion_iva: str | None = None
    notas: str | None = None
    activo: bool | None = None


class TerceroOut(TerceroBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activo: bool
    created_at: datetime
    contactos: list[ContactoOut] = []
