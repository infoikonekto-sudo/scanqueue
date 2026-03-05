import { query, isDbAvailable } from '../config/database.js';
import { scanStorage } from '../utils/jsonStorage.js';

/**
 * Obtiene todos los escaneos
 */
export async function getAllScans(limit = 100, offset = 0) {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    return scans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(offset, offset + limit);
  }

  const res = await query(
    `SELECT s.*, st.name as student_name, u.name as operator_name 
     FROM scans s 
     LEFT JOIN students st ON s.student_id = st.id 
     LEFT JOIN users u ON s.operator_id = u.id 
     ORDER BY s.created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
}

/**
 * Obtiene escaneos del día
 */
export async function getScansToday() {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    return scans.filter(s => s.created_at.startsWith(today))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const res = await query(
    `SELECT s.*, st.name as student_name, u.name as operator_name 
     FROM scans s 
     LEFT JOIN students st ON s.student_id = st.id 
     LEFT JOIN users u ON s.operator_id = u.id 
     WHERE s.created_at::date = CURRENT_DATE 
     ORDER BY s.created_at DESC`
  );
  return res.rows;
}

/**
 * Obtiene escaneos por rango de fechas
 */
export async function getScansByDateRange(startDate, endDate) {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    return scans.filter(s => {
      const ts = new Date(s.created_at);
      return ts >= new Date(startDate) && ts <= new Date(endDate);
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const res = await query(
    `SELECT s.*, st.name as student_name, u.name as operator_name 
     FROM scans s 
     LEFT JOIN students st ON s.student_id = st.id 
     LEFT JOIN users u ON s.operator_id = u.id 
     WHERE s.timestamp >= $1 AND s.timestamp <= $2 
     ORDER BY s.timestamp DESC`,
    [startDate, endDate]
  );
  return res.rows;
}

/**
 * Obtiene escaneos pendientes
 */
export async function getPendingScans() {
  if (!isDbAvailable) {
    const scans = await scanStorage.find(s => s.status === 'pending');
    return scans.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  const res = await query(
    `SELECT s.*, st.name as student_name 
     FROM scans s 
     LEFT JOIN students st ON s.student_id = st.id 
     WHERE s.status = 'pending' 
     ORDER BY s.timestamp ASC`
  );
  return res.rows;
}

/**
 * Crea un nuevo escaneo
 */
export async function createScan(studentId, operatorId, status = 'pending') {
  if (!isDbAvailable) {
    return await scanStorage.insert({
      student_id: studentId,
      operator_id: operatorId,
      status,
      timestamp: new Date().toISOString(), // mantener por compatibilidad
      created_at: new Date().toISOString()
    });
  }

  const res = await query(
    `INSERT INTO scans (student_id, operator_id, status) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [studentId, operatorId, status]
  );
  return res.rows[0];
}

/**
 * Actualiza el estado de un escaneo
 */
export async function updateScanStatus(scanId, status, notes = null) {
  if (!isDbAvailable) {
    return await scanStorage.update(scanId, { status, notes });
  }

  const res = await query(
    `UPDATE scans SET status = $1, notes = $2 WHERE id = $3 RETURNING *`,
    [status, notes, scanId]
  );
  return res.rows[0];
}

/**
 * Marca un escaneo como transporte
 */
export async function markScanAsTransport(scanId) {
  if (!isDbAvailable) {
    return await scanStorage.update(scanId, { transport_marked: true, status: 'transport' });
  }

  const res = await query(
    `UPDATE scans SET transport_marked = true, status = 'transport' WHERE id = $1 RETURNING *`,
    [scanId]
  );
  return res.rows[0];
}

/**
 * Obtiene escaneos recientes de un estudiante
 */
export async function getRecentScans(studentId, minutes = 30) {
  if (!isDbAvailable) {
    const scans = await scanStorage.find(s => s.student_id === studentId);
    const cutoff = new Date(Date.now() - minutes * 60000);
    return scans.filter(s => new Date(s.created_at) > cutoff)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const res = await query(
    `SELECT * FROM scans 
     WHERE student_id = $1 AND timestamp > NOW() - INTERVAL '${minutes} minutes' 
     ORDER BY timestamp DESC`,
    [studentId]
  );
  return res.rows;
}

/**
 * Obtiene cola de escaneos sin procesar
 */
export async function getScanQueue() {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    const pendingToday = scans.filter(s => s.status === 'pending' && s.created_at.startsWith(today))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Deduplicar por student_id (quedarse con el más reciente)
    const uniqueMap = new Map();
    pendingToday.forEach(s => {
      if (!uniqueMap.has(s.student_id)) {
        uniqueMap.set(s.student_id, s);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  const res = await query(
    `SELECT DISTINCT ON (s.student_id) s.*, st.name as student_name, st.grade, st.level, st.photo_url 
     FROM scans s 
     LEFT JOIN students st ON s.student_id = st.id 
     WHERE s.status = 'pending' AND (s.created_at::date = CURRENT_DATE OR s.timestamp::date = CURRENT_DATE)
     ORDER BY s.student_id, s.created_at DESC`,
    []
  );

  // Re-ordenar por fecha de creación para mantener el orden de la cola original
  return res.rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

/**
 * Elimina un escaneo
 */
export async function deleteScan(id) {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    const index = scans.findIndex(s => s.id === id);
    if (index !== -1) {
      const deleted = scans.splice(index, 1);
      await scanStorage.save(scans);
      return deleted[0];
    }
    return null;
  }

  const res = await query('DELETE FROM scans WHERE id = $1 RETURNING id', [id]);
  return res.rows[0];
}

/**
 * Limpia todos los escaneos pendientes de hoy
 */
export async function clearTodayQueue() {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    scans.forEach(s => {
      if (s.status === 'pending' && s.created_at.startsWith(today)) {
        s.status = 'completed';
        s.notes = 'Queue cleared by admin';
      }
    });
    await scanStorage.save(scans);
    return scans.filter(s => s.status === 'completed' && s.created_at.startsWith(today));
  }

  const res = await query(
    `UPDATE scans 
     SET status = 'completed', notes = 'Queue cleared by admin' 
     WHERE status = 'pending' AND timestamp::date = CURRENT_DATE 
     RETURNING *`
  );
  return res.rows;
}

/**
 * Procesa todos los estudiantes de un nivel específico (transporte/despacho)
 */
export async function processTransportScanQueue(level) {
  if (!isDbAvailable) {
    const scans = await scanStorage.getAll();
    const studentsArr = await studentStorage.getAll(); // studentStorage ya está importado arriba
    const today = new Date().toISOString().split('T')[0];

    let processedCount = 0;
    scans.forEach(s => {
      const student = studentsArr.find(st => st.id === s.student_id);
      if (s.status === 'pending' && s.created_at.startsWith(today) &&
        student && student.level?.toLowerCase() === level.toLowerCase()) {
        s.status = 'completed';
        s.notes = `Despacho por nivel: ${level}`;
        processedCount++;
      }
    });

    if (processedCount > 0) {
      await scanStorage.save(scans);
    }
    return { success: true, count: processedCount };
  }

  const res = await query(
    `UPDATE scans s
     SET status = 'completed', notes = $1
     FROM students st
     WHERE s.student_id = st.id
     AND s.status = 'pending'
     AND s.created_at::date = CURRENT_DATE
     AND LOWER(st.level) = LOWER($2)
     RETURNING s.*`,
    [`Despacho por nivel: ${level}`, level]
  );
  return { success: true, count: res.rowCount, data: res.rows };
}

export default {
  getAllScans,
  getScansToday,
  getScansByDateRange,
  getPendingScans,
  createScan,
  updateScanStatus,
  markScanAsTransport,
  getRecentScans,
  getScanQueue,
  deleteScan,
  clearTodayQueue,
  processTransportScanQueue,
};
