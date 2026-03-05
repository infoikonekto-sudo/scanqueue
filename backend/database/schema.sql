-- Esquema de Base de Datos para ScanQueue

-- Tabla de Usuarios (Admin/Operadores)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'operator',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Rutas de Transporte
CREATE TABLE IF NOT EXISTS transport_routes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INT,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(50) NOT NULL,
  photo_url VARCHAR(500),
  transport_route_id INT REFERENCES transport_routes(id),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  unique_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Códigos QR
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  qr_data JSONB,
  barcode VARCHAR(255) UNIQUE,
  data_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Escaneos
CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  operator_id INT REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  transport_marked BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_scans_student_id ON scans(student_id);
CREATE INDEX idx_scans_timestamp ON scans(timestamp);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_qr_codes_student_id ON qr_codes(student_id);
CREATE INDEX idx_users_email ON users(email);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON qr_codes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_routes_updated_at
BEFORE UPDATE ON transport_routes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
