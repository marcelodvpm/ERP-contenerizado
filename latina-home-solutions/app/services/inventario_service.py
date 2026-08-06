from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.stock import MovimientoStock, Stock, TipoMovimiento
from app.schemas.inventario import MovimientoStockCreate

# Tipos de movimiento que suman al stock; el resto resta
MOVIMIENTOS_QUE_SUMAN = {TipoMovimiento.entrada}
MOVIMIENTOS_QUE_RESTAN = {TipoMovimiento.salida}
# "ajuste" y "transferencia" pueden sumar o restar según el signo de `cantidad`


def get_stock_producto(db: Session, producto_id: int) -> list[Stock]:
    return db.query(Stock).filter(Stock.producto_id == producto_id).all()


def registrar_movimiento(
    db: Session, data: MovimientoStockCreate, usuario_id: int
) -> MovimientoStock:
    """Registra un movimiento y actualiza (o crea) el saldo de stock correspondiente,
    dentro de la misma transacción para que nunca queden desincronizados."""

    stock = (
        db.query(Stock)
        .filter(Stock.producto_id == data.producto_id, Stock.deposito_id == data.deposito_id)
        .first()
    )
    if not stock:
        stock = Stock(producto_id=data.producto_id, deposito_id=data.deposito_id, cantidad=0)
        db.add(stock)
        db.flush()  # asegura que stock.cantidad exista antes de operar sobre él

    if data.tipo in MOVIMIENTOS_QUE_SUMAN:
        stock.cantidad += data.cantidad
    elif data.tipo in MOVIMIENTOS_QUE_RESTAN:
        if stock.cantidad < data.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente: disponible {stock.cantidad}, solicitado {data.cantidad}",
            )
        stock.cantidad -= data.cantidad
    else:
        # ajuste / transferencia: la cantidad puede ser positiva o negativa
        nuevo_saldo = stock.cantidad + data.cantidad
        if nuevo_saldo < 0:
            raise HTTPException(status_code=400, detail="El ajuste dejaría el stock en negativo")
        stock.cantidad = nuevo_saldo

    movimiento = MovimientoStock(
        producto_id=data.producto_id,
        deposito_id=data.deposito_id,
        tipo=data.tipo,
        cantidad=data.cantidad,
        origen=data.origen,
        referencia_id=data.referencia_id,
        usuario_id=usuario_id,
        notas=data.notas,
    )
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    return movimiento
