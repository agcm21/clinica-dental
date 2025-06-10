-- Verificar si la tabla presupuestos existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'presupuestos'
    ) THEN
        CREATE TABLE public.presupuestos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            cedula TEXT NOT NULL,
            telefono TEXT,
            email TEXT,
            fecha DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            monto NUMERIC(10,2) NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            metodo_envio TEXT
        );
    END IF;
END
$$;

-- Verificar si la columna metodo_envio existe en la tabla presupuestos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'presupuestos' 
        AND column_name = 'metodo_envio'
    ) THEN
        ALTER TABLE public.presupuestos ADD COLUMN metodo_envio TEXT;
    END IF;
END
$$;

-- Insertar datos de ejemplo si la tabla está vacía
INSERT INTO public.presupuestos (nombre, apellido, cedula, telefono, email, fecha, monto, estado)
SELECT 'Ayrton', 'Senna', '16123456', '04123451234', 'ayrton@ejemplo.com', '2025-05-01', 25.00, 'aprobado'
WHERE NOT EXISTS (SELECT 1 FROM public.presupuestos);

INSERT INTO public.presupuestos (nombre, apellido, cedula, telefono, email, fecha, monto, estado)
SELECT 'Niki', 'Lauda', '18.667.388', '04241234567', 'niki@ejemplo.com', '2025-05-01', 19.00, 'pendiente'
WHERE NOT EXISTS (SELECT 1 FROM public.presupuestos WHERE nombre = 'Niki');
