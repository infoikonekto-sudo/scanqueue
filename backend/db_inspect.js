import { query } from './src/config/database.js';

async function inspect() {
    console.log('--- INSPECCIÓN DE ESQUEMA REAL ---');
    try {
        console.log('\nColumnas de la tabla "scans":');
        const scansCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'scans'
    `);
        console.table(scansCols.rows);

        console.log('\nColumnas de la tabla "students":');
        const studentsCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
    `);
        console.table(studentsCols.rows);

        console.log('\nColumnas de la tabla "transport_routes":');
        const routesCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transport_routes'
    `);
        console.table(routesCols.rows);

    } catch (e) {
        console.error('❌ Error durante la inspección:', e);
    } finally {
        process.exit(0);
    }
}

inspect();
