import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  connectionTimeoutMillis: 2000, // Timeout rápido para detectar fallos
});

export let isDbAvailable = true;

// Verificar conexión inicial
pool.connect()
  .then(client => {
    console.log('✅ Conexión a PostgreSQL establecida');
    isDbAvailable = true;
    client.release();
  })
  .catch(err => {
    console.error('⚠️ PostgreSQL no disponible. Activando modo persistencia JSON local.');
    isDbAvailable = false;
  });

pool.on('error', (err) => {
  console.error('Error en conexión de base de datos:', err);
  if (err.code === 'ECONNREFUSED' || err.code === '57P01') {
    isDbAvailable = false;
  }
});

/**
 * Ejecuta una query en la base de datos
 * @param {string} query - Consulta SQL
 * @param {array} values - Parámetros de la query
 * @returns {Promise} Resultado de la query
 */
export async function query(queryText, values = []) {
  const client = await pool.connect();
  try {
    return await client.query(queryText, values);
  } finally {
    client.release();
  }
}

/**
 * Obtiene una conexión de la pool
 * @returns {Promise} Cliente de base de datos
 */
export async function getClient() {
  return pool.connect();
}

export default pool;
