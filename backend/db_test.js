import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'scanqueue_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function testQueries() {
    console.log('--- DIAGNÓSTICO DE BASE DE DATOS ---');
    try {
        const client = await pool.connect();
        console.log('✅ Conexión exitosa');

        console.log('\n1. Verificando tablas...');
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tablas encontradas:', tables.rows.map(t => t.table_name).join(', '));

        console.log('\n2. Probando query de Scans Today...');
        try {
            const resScans = await client.query(
                `SELECT s.*, st.name as student_name, u.name as operator_name 
         FROM scans s 
         LEFT JOIN students st ON s.student_id = st.id 
         LEFT JOIN users u ON s.operator_id = u.id 
         WHERE s.timestamp::date = CURRENT_DATE`
            );
            console.log('✅ Query Scans Today: OK (Encontrados: ' + resScans.rowCount + ')');
        } catch (e) {
            console.error('❌ Error en Query Scans Today:', e.message);
        }

        console.log('\n3. Probando query de Routes...');
        try {
            const resRoutes = await client.query(
                `SELECT r.id, r.name, r.capacity, r.description, r.active, COUNT(s.id) as student_count 
         FROM transport_routes r 
         LEFT JOIN students s ON r.id = s.transport_route_id 
         WHERE r.active = true 
         GROUP BY r.id, r.name, r.capacity, r.description, r.active`
            );
            console.log('✅ Query Routes: OK (Encontradas: ' + resRoutes.rowCount + ')');
        } catch (e) {
            console.error('❌ Error en Query Routes:', e.message);
        }

        console.log('\n4. Verificando conteo de estudiantes...');
        try {
            const resStudents = await client.query('SELECT COUNT(*) as count FROM students WHERE active = true');
            console.log('✅ Query Students Count: OK (Total: ' + resStudents.rows[0].count + ')');
        } catch (e) {
            console.error('❌ Error en Query Students Count:', e.message);
        }

        client.release();
    } catch (err) {
        console.error('❌ Error general de conexión:', err.message);
    } finally {
        await pool.end();
    }
}

testQueries();
