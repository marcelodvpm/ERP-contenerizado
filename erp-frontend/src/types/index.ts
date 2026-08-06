export interface Categoria {
  id: number
  nombre: string
  categoria_padre_id: number | null
  descripcion: string | null
}

export interface Deposito {
  id: number
  nombre: string
  direccion: string | null
  activo: boolean
}

export type TipoItem = 'producto' | 'servicio'

export interface ProductoServicio {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  categoria_id: number | null
  tipo: TipoItem
  unidad_medida: string
  precio_venta: string
  precio_costo: string
  maneja_stock: boolean
  stock_minimo: string
  activo: boolean
  created_at: string
}

export interface ProductoFormInput {
  codigo: string
  nombre: string
  categoria_id?: number
  tipo: TipoItem
  unidad_medida: string
  precio_venta: number
  precio_costo: number
  maneja_stock: boolean
  stock_minimo: number
}

export interface StockPorDeposito {
  producto_id: number
  deposito_id: number
  cantidad: string
}

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'transferencia'

export interface MovimientoStockInput {
  producto_id: number
  deposito_id: number
  tipo: TipoMovimiento
  cantidad: number
  origen: 'ajuste_manual'
  notas?: string
}

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'vencido'

export interface PresupuestoItem {
  id: number
  producto_servicio_id: number
  descripcion: string | null
  cantidad: string
  precio_unitario: string
  descuento: string
  subtotal: string
}

export interface Presupuesto {
  id: number
  numero: string
  cliente_id: number
  proyecto_id: number | null
  usuario_id: number
  fecha: string
  fecha_validez: string | null
  estado: EstadoPresupuesto
  subtotal: string
  descuento: string
  impuestos: string
  total: string
  notas: string | null
  created_at: string
  items: PresupuestoItem[]
}

export interface PresupuestoItemInput {
  producto_servicio_id: number
  descripcion?: string
  cantidad: number
  precio_unitario: number
  descuento?: number
}

export interface PresupuestoFormInput {
  cliente_id: number
  proyecto_id?: number
  fecha_validez?: string
  notas?: string
  items: PresupuestoItemInput[]
}

export interface Tecnico {
  usuario_id: number
  nombre_completo: string
  especialidad: string | null
  zona_cobertura: string | null
  activo: boolean
}

export type TipoOT = 'instalacion' | 'reparacion' | 'mantenimiento'
export type EstadoOT = 'pendiente' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada'
export type PrioridadOT = 'baja' | 'media' | 'alta' | 'urgente'

export interface OTItem {
  id: number
  producto_id: number
  cantidad: string
  precio_unitario: string
}

export interface OrdenTrabajo {
  id: number
  numero: string
  presupuesto_id: number | null
  proyecto_id: number | null
  cliente_id: number
  tecnico_id: number | null
  tipo: TipoOT
  estado: EstadoOT
  prioridad: PrioridadOT
  direccion_servicio: string | null
  descripcion: string | null
  notas_tecnicas: string | null
  fecha_solicitud: string
  fecha_programada: string | null
  fecha_completada: string | null
  items: OTItem[]
}

export interface OTFormInput {
  cliente_id: number
  presupuesto_id?: number
  proyecto_id?: number
  tecnico_id?: number
  tipo: TipoOT
  prioridad: PrioridadOT
  direccion_servicio?: string
  descripcion?: string
}

export interface OTUpdateInput {
  tecnico_id?: number
  estado?: EstadoOT
  prioridad?: PrioridadOT
  notas_tecnicas?: string
}

export type EstadoAgenda = 'programado' | 'confirmado' | 'completado' | 'cancelado'

export interface Turno {
  id: number
  tecnico_id: number
  ot_id: number | null
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: EstadoAgenda
  notas: string | null
  created_at: string
}

export interface TurnoFormInput {
  tecnico_id: number
  ot_id?: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  notas?: string
}

export interface TurnoUpdateInput {
  estado?: EstadoAgenda
  fecha?: string
  hora_inicio?: string
  hora_fin?: string
  notas?: string
}

export type EstadoCompra = 'pendiente' | 'recibida' | 'cancelada'

export interface CompraItem {
  id: number
  producto_id: number
  cantidad: string
  precio_unitario: string
  subtotal: string
}

export interface Compra {
  id: number
  numero: string
  proveedor_id: number
  proyecto_id: number | null
  usuario_id: number
  fecha: string
  estado: EstadoCompra
  subtotal: string
  impuestos: string
  total: string
  notas: string | null
  created_at: string
  items: CompraItem[]
}

export interface CompraItemInput {
  producto_id: number
  cantidad: number
  precio_unitario: number
}

export interface CompraFormInput {
  proveedor_id: number
  proyecto_id?: number
  notas?: string
  items: CompraItemInput[]
}

export type EstadoVenta = 'pendiente' | 'pagada' | 'cancelada'

export interface VentaItem {
  id: number
  producto_servicio_id: number
  cantidad: string
  precio_unitario: string
  subtotal: string
}

export interface Venta {
  id: number
  numero: string
  cliente_id: number
  ot_id: number | null
  presupuesto_id: number | null
  proyecto_id: number | null
  usuario_id: number
  fecha: string
  estado: EstadoVenta
  subtotal: string
  descuento: string
  impuestos: string
  total: string
  items: VentaItem[]
}

export interface VentaItemInput {
  producto_servicio_id: number
  cantidad: number
  precio_unitario: number
}

export interface VentaFormInput {
  cliente_id: number
  ot_id?: number
  presupuesto_id?: number
  proyecto_id?: number
  deposito_id?: number
  items: VentaItemInput[]
}

export interface Usuario {
  id: number
  username: string
  email: string
  nombre_completo: string
  rol_id: number
  activo: boolean
  created_at: string
}

export type TipoTercero = 'cliente' | 'proveedor' | 'ambos'

export interface Contacto {
  id: number
  nombre: string
  cargo: string | null
  telefono: string | null
  email: string | null
  es_principal: boolean
}

export interface Tercero {
  id: number
  tipo: TipoTercero
  razon_social: string
  nombre_fantasia: string | null
  cuit_dni: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  condicion_iva: string | null
  notas: string | null
  activo: boolean
  created_at: string
  contactos: Contacto[]
}

export interface TerceroFormInput {
  tipo: TipoTercero
  razon_social: string
  cuit_dni?: string
  email?: string
  telefono?: string
  ciudad?: string
  provincia?: string
}

export type EstadoProyecto = 'planificacion' | 'activo' | 'pausado' | 'finalizado' | 'cancelado'

export interface Proyecto {
  id: number
  numero: string
  nombre: string
  descripcion: string | null
  cliente_id: number
  usuario_id: number
  estado: EstadoProyecto
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  fecha_fin_real: string | null
  created_at: string
}

export interface ProyectoFormInput {
  nombre: string
  descripcion?: string
  cliente_id: number
  fecha_inicio?: string
  fecha_fin_estimada?: string
}

export interface ProyectoResumen {
  proyecto: Proyecto
  total_presupuestado: string
  total_comprado: string
  total_vendido: string
  total_costos_adicionales: string
  cantidad_ots: number
  cantidad_ots_completadas: number
}

export interface VentasMes {
  cantidad: number
  monto_total: string
}

export interface OTPorEstado {
  estado: string
  cantidad: number
}

export interface StockCritico {
  producto_id: number
  codigo: string
  nombre: string
  stock_actual: string
  stock_minimo: string
}

export interface PresupuestosPendientes {
  cantidad: number
  monto_total: string
}

export interface ComprasPendientes {
  cantidad: number
  monto_total: string
}

export interface AgendaDia {
  fecha: string
  cantidad: number
}

export interface DashboardResumen {
  ventas_mes: VentasMes
  ot_por_estado: OTPorEstado[]
  stock_critico: StockCritico[]
  presupuestos_pendientes: PresupuestosPendientes
  compras_pendientes: ComprasPendientes
  agenda_proxima_semana: AgendaDia[]
}
