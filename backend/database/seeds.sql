-- Seeds de Datos de Ejemplo para ScanQueue

-- Insertar usuario admin (password: admin123 - hash bcrypt)
INSERT INTO users (email, password, name, role, active) VALUES
('admin@scanqueue.local', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Admin ScanQueue', 'admin', TRUE),
('operator@scanqueue.local', '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Operador Principal', 'operator', TRUE);

-- Insertar rutas de transporte
INSERT INTO transport_routes (name, capacity, description, active) VALUES
('Ruta A - Zona Norte', 45, 'Transporte zona norte de la ciudad', TRUE),
('Ruta B - Zona Centro', 50, 'Transporte zona centro', TRUE),
('Ruta C - Zona Sur', 40, 'Transporte zona sur', TRUE),
('Ruta D - Zona Este', 45, 'Transporte zona este', TRUE);

-- Insertar estudiantes de ejemplo
INSERT INTO students (name, grade, transport_route_id, parent_email, parent_phone, active, unique_code) VALUES
('Juan Pérez García', '1° Básico', 1, 'juan.parent@email.com', '+56912345678', TRUE, 'STU001'),
('María López Rodríguez', '2° Básico', 2, 'maria.parent@email.com', '+56912345679', TRUE, 'STU002'),
('Carlos Martínez Silva', '3° Básico', 1, 'carlos.parent@email.com', '+56912345680', TRUE, 'STU003'),
('Ana García Morales', '4° Básico', 3, 'ana.parent@email.com', '+56912345681', TRUE, 'STU004'),
('Pedro Sánchez López', '5° Básico', 2, 'pedro.parent@email.com', '+56912345682', TRUE, 'STU005'),
('Laura Fernández Díaz', '6° Básico', 4, 'laura.parent@email.com', '+56912345683', TRUE, 'STU006'),
('Diego Ramírez Torres', '7° Básico', 1, 'diego.parent@email.com', '+56912345684', TRUE, 'STU007'),
('Sofía Acosta Mendez', '8° Básico', 3, 'sofia.parent@email.com', '+56912345685', TRUE, 'STU008'),
('Roberto Chávez Vega', '1° Medio', 2, 'roberto.parent@email.com', '+56912345686', TRUE, 'STU009'),
('Valentina Jiménez Flores', '2° Medio', 4, 'valentina.parent@email.com', '+56912345687', TRUE, 'STU010');

-- Nota: Los códigos QR se generarán dinámicamente cuando se guarden estudiantes
-- El campo password contiene un hash de ejemplo - en producción usar bcrypt real
