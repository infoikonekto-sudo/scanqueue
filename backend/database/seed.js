import { query } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Carga datos de ejemplo (seeds) en la base de datos
 */
async function seedDatabase() {
  try {
    console.log('🌱 Cargando datos de ejemplo...');

    // Leer el archivo seeds.sql
    const seedsPath = path.join(__dirname, 'seeds.sql');
    const seeds = fs.readFileSync(seedsPath, 'utf8');

    // Ejecutar cada sentencia SQL
    const statements = seeds.split(';').filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (error) {
          // Ignorar errores de duplicados (ON CONFLICT)
          if (!error.message.includes('duplicate')) {
            console.warn('⚠️  Advertencia:', error.message);
          }
        }
      }
    }

    console.log('✅ Datos de ejemplo cargados correctamente');
  } catch (error) {
    console.error('❌ Error cargando datos de ejemplo:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    console.log('✨ Proceso completado');
    process.exit(0);
  });
}

export default seedDatabase;
