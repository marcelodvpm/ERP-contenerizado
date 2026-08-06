-- ============================================================
-- ERP Electricidad / Domótica / Fotovoltaica / CCTV / Redes / Sonido
-- Esquema PostgreSQL - v1
-- ============================================================

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USUARIOS Y PERMISOS
-- ============================================================

CREATE TABLE roles (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE,   -- admin, ventas, tecnico, deposito
    descripcion     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permisos (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(80) NOT NULL UNIQUE,   -- ej: 'ot.crear', 'inventario.editar'
    descripcion     TEXT
);

CREATE TABLE rol_permisos (
    rol_id          INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id      INTEGER NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol_id          INTEGER NOT NULL REFERENCES roles(id),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extiende a un usuario cuando su rol es técnico
CREATE TABLE tecnicos (
    usuario_id      INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad    VARCHAR(100),      -- ej: 'Fotovoltaica', 'CCTV', 'Sonido profesional'
    zona_cobertura  VARCHAR(150),
    telefono        VARCHAR(30),
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 2. CRM: CLIENTES Y PROVEEDORES
-- ============================================================

CREATE TYPE tipo_tercero AS ENUM ('cliente', 'proveedor', 'ambos');

CREATE TABLE terceros (
    id              SERIAL PRIMARY KEY,
    tipo            tipo_tercero NOT NULL,
    razon_social    VARCHAR(200) NOT NULL,
    nombre_fantasia VARCHAR(200),
    cuit_dni        VARCHAR(20) UNIQUE,
    email           VARCHAR(150),
    telefono        VARCHAR(30),
    direccion       VARCHAR(250),
    ciudad          VARCHAR(100),
    provincia       VARCHAR(100),
    condicion_iva   VARCHAR(50),        -- Resp. Inscripto, Monotributo, Consumidor Final, etc.
    notas           TEXT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contactos (
    id              SERIAL PRIMARY KEY,
    tercero_id      INTEGER NOT NULL REFERENCES terceros(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    cargo           VARCHAR(100),
    telefono        VARCHAR(30),
    email           VARCHAR(150),
    es_principal    BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- 3. CATÁLOGO E INVENTARIO
-- ============================================================

CREATE TABLE categorias (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    categoria_padre_id  INTEGER REFERENCES categorias(id),
    descripcion         TEXT
);

CREATE TYPE tipo_item AS ENUM ('producto', 'servicio');

CREATE TABLE productos_servicios (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(50) NOT NULL UNIQUE,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    categoria_id    INTEGER REFERENCES categorias(id),
    tipo            tipo_item NOT NULL,
    unidad_medida   VARCHAR(20) NOT NULL DEFAULT 'unidad',
    precio_venta    NUMERIC(14,2) NOT NULL DEFAULT 0,
    precio_costo    NUMERIC(14,2) NOT NULL DEFAULT 0,
    maneja_stock    BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE para servicios (mano de obra)
    stock_minimo    NUMERIC(12,2) DEFAULT 0,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE depositos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    direccion       VARCHAR(250),
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE stock (
    id              SERIAL PRIMARY KEY,
    producto_id     INTEGER NOT NULL REFERENCES productos_servicios(id) ON DELETE CASCADE,
    deposito_id     INTEGER NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
    cantidad        NUMERIC(12,2) NOT NULL DEFAULT 0,
    UNIQUE (producto_id, deposito_id)
);

CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida', 'ajuste', 'transferencia');
CREATE TYPE origen_movimiento AS ENUM ('compra', 'venta', 'orden_trabajo', 'ajuste_manual', 'transferencia');

CREATE TABLE movimientos_stock (
    id              SERIAL PRIMARY KEY,
    producto_id     INTEGER NOT NULL REFERENCES productos_servicios(id),
    deposito_id     INTEGER NOT NULL REFERENCES depositos(id),
    tipo            tipo_movimiento NOT NULL,
    cantidad        NUMERIC(12,2) NOT NULL,
    origen          origen_movimiento NOT NULL,
    referencia_id   INTEGER,           -- id de la compra/venta/OT que originó el movimiento
    usuario_id      INTEGER REFERENCES usuarios(id),
    notas           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. PRESUPUESTOS
-- ============================================================

CREATE TYPE estado_presupuesto AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido');

CREATE TABLE presupuestos (
    id              SERIAL PRIMARY KEY,
    numero          VARCHAR(30) NOT NULL UNIQUE,
    cliente_id      INTEGER NOT NULL REFERENCES terceros(id),
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_validez   DATE,
    estado          estado_presupuesto NOT NULL DEFAULT 'borrador',
    subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
    descuento       NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuestos       NUMERIC(14,2) NOT NULL DEFAULT 0,
    total           NUMERIC(14,2) NOT NULL DEFAULT 0,
    notas           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE presupuesto_items (
    id                      SERIAL PRIMARY KEY,
    presupuesto_id          INTEGER NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    producto_servicio_id    INTEGER NOT NULL REFERENCES productos_servicios(id),
    descripcion             VARCHAR(250),
    cantidad                NUMERIC(12,2) NOT NULL DEFAULT 1,
    precio_unitario         NUMERIC(14,2) NOT NULL,
    descuento               NUMERIC(14,2) NOT NULL DEFAULT 0,
    subtotal                NUMERIC(14,2) NOT NULL
);

-- ============================================================
-- 5. ÓRDENES DE TRABAJO
-- ============================================================

CREATE TYPE tipo_ot AS ENUM ('instalacion', 'reparacion', 'mantenimiento');
CREATE TYPE estado_ot AS ENUM ('pendiente', 'asignada', 'en_progreso', 'completada', 'cancelada');
CREATE TYPE prioridad_ot AS ENUM ('baja', 'media', 'alta', 'urgente');

CREATE TABLE ordenes_trabajo (
    id                  SERIAL PRIMARY KEY,
    numero              VARCHAR(30) NOT NULL UNIQUE,
    presupuesto_id      INTEGER REFERENCES presupuestos(id),
    cliente_id          INTEGER NOT NULL REFERENCES terceros(id),
    tecnico_id          INTEGER REFERENCES tecnicos(usuario_id),
    tipo                tipo_ot NOT NULL,
    estado              estado_ot NOT NULL DEFAULT 'pendiente',
    prioridad           prioridad_ot NOT NULL DEFAULT 'media',
    direccion_servicio  VARCHAR(250),
    descripcion         TEXT,
    notas_tecnicas      TEXT,
    fecha_solicitud     TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_programada    TIMESTAMPTZ,
    fecha_completada    TIMESTAMPTZ,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id),  -- quien creó la OT
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ot_items (
    id              SERIAL PRIMARY KEY,
    ot_id           INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    producto_id     INTEGER NOT NULL REFERENCES productos_servicios(id),
    cantidad        NUMERIC(12,2) NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(14,2) NOT NULL
);

-- ============================================================
-- 6. AGENDA DE TÉCNICOS
-- ============================================================

CREATE TYPE estado_agenda AS ENUM ('programado', 'confirmado', 'completado', 'cancelado');

CREATE TABLE agenda (
    id              SERIAL PRIMARY KEY,
    tecnico_id      INTEGER NOT NULL REFERENCES tecnicos(usuario_id),
    ot_id           INTEGER REFERENCES ordenes_trabajo(id),
    fecha           DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    estado          estado_agenda NOT NULL DEFAULT 'programado',
    notas           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. COMPRAS Y VENTAS
-- ============================================================

CREATE TYPE estado_compra AS ENUM ('pendiente', 'recibida', 'cancelada');

CREATE TABLE compras (
    id              SERIAL PRIMARY KEY,
    numero          VARCHAR(30) NOT NULL UNIQUE,
    proveedor_id    INTEGER NOT NULL REFERENCES terceros(id),
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    estado          estado_compra NOT NULL DEFAULT 'pendiente',
    subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuestos       NUMERIC(14,2) NOT NULL DEFAULT 0,
    total           NUMERIC(14,2) NOT NULL DEFAULT 0,
    notas           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compra_items (
    id              SERIAL PRIMARY KEY,
    compra_id       INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id     INTEGER NOT NULL REFERENCES productos_servicios(id),
    cantidad        NUMERIC(12,2) NOT NULL,
    precio_unitario NUMERIC(14,2) NOT NULL,
    subtotal        NUMERIC(14,2) NOT NULL
);

CREATE TYPE estado_venta AS ENUM ('pendiente', 'pagada', 'cancelada');

CREATE TABLE ventas (
    id              SERIAL PRIMARY KEY,
    numero          VARCHAR(30) NOT NULL UNIQUE,
    cliente_id      INTEGER NOT NULL REFERENCES terceros(id),
    ot_id           INTEGER REFERENCES ordenes_trabajo(id),
    presupuesto_id  INTEGER REFERENCES presupuestos(id),
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    estado          estado_venta NOT NULL DEFAULT 'pendiente',
    subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
    descuento       NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuestos       NUMERIC(14,2) NOT NULL DEFAULT 0,
    total           NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE venta_items (
    id                      SERIAL PRIMARY KEY,
    venta_id                INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_servicio_id    INTEGER NOT NULL REFERENCES productos_servicios(id),
    cantidad                NUMERIC(12,2) NOT NULL,
    precio_unitario         NUMERIC(14,2) NOT NULL,
    subtotal                NUMERIC(14,2) NOT NULL
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_terceros_tipo ON terceros(tipo);
CREATE INDEX idx_terceros_cuit ON terceros(cuit_dni);
CREATE INDEX idx_productos_categoria ON productos_servicios(categoria_id);
CREATE INDEX idx_productos_codigo ON productos_servicios(codigo);
CREATE INDEX idx_stock_producto ON stock(producto_id);
CREATE INDEX idx_movimientos_producto ON movimientos_stock(producto_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_stock(created_at);
CREATE INDEX idx_presupuestos_cliente ON presupuestos(cliente_id);
CREATE INDEX idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX idx_ot_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX idx_ot_tecnico ON ordenes_trabajo(tecnico_id);
CREATE INDEX idx_ot_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_agenda_tecnico_fecha ON agenda(tecnico_id, fecha);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);

-- ============================================================
-- DATOS INICIALES (seed básico)
-- ============================================================

INSERT INTO roles (nombre, descripcion) VALUES
    ('admin', 'Acceso total al sistema'),
    ('ventas', 'Gestión de presupuestos, ventas y CRM'),
    ('tecnico', 'Gestión de órdenes de trabajo y agenda propia'),
    ('deposito', 'Gestión de inventario y compras');

INSERT INTO categorias (nombre) VALUES
    ('Eléctrico'),
    ('Domótica'),
    ('Energía fotovoltaica'),
    ('Automatización industrial'),
    ('CCTV y alarmas'),
    ('Redes WiFi y satelital'),
    ('Electrónica de sonido profesional');

INSERT INTO depositos (nombre, direccion) VALUES
    ('Depósito central', 'A definir');
