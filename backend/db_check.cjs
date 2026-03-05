const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres', // Cambiar si es necesario
    database: 'postgres'
});

async function check() {
    console.log('Intentando conectar a postgres...');
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a la base "postgres" exitosa');

        const dbs = await client.query('SELECT datname FROM pg_database');
        console.log('Bases de datos encontradas:', dbs.rows.map(r => r.datname));

        client.release();
    } catch (e) {
        console.error('❌ Error fatal de conexión:', e);
    } finally {
        await pool.end();
    }
}

check();
