import { query, isDbAvailable } from '../config/database.js';
import { studentStorage } from '../utils/jsonStorage.js';

/**
 * Obtiene todos los estudiantes
 */
export async function getAllStudents(limit = 100, offset = 0) {
  if (!isDbAvailable) {
    const students = await studentStorage.find(s => s.active !== false);
    return students.sort((a, b) => a.name.localeCompare(b.name))
      .slice(offset, offset + limit);
  }

  const res = await query(
    `SELECT s.*, tr.name as transport_route_name 
     FROM students s 
     LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id 
     WHERE s.active = true 
     ORDER BY s.name 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
}

/**
 * Obtiene el total de estudiantes
 */
export async function getTotalStudents() {
  if (!isDbAvailable) {
    const students = await studentStorage.find(s => s.active !== false);
    return students.length;
  }

  const res = await query('SELECT COUNT(*) as count FROM students WHERE active = true');
  return parseInt(res.rows[0].count);
}

/**
 * Obtiene un estudiante por ID
 */
export async function getStudentById(id) {
  if (!isDbAvailable) {
    const students = await studentStorage.find(s => String(s.id) === String(id));
    return students[0] || null;
  }

  const res = await query(
    `SELECT s.*, tr.name as transport_route_name 
     FROM students s 
     LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id 
     WHERE s.id = $1`,
    [id]
  );
  return res.rows[0];
}

/**
 * Obtiene estudiantes por grado
 */
export async function getStudentsByGrade(grade) {
  if (!isDbAvailable) {
    return await studentStorage.find(s => s.grade === grade && s.active !== false);
  }

  const res = await query(
    `SELECT s.*, tr.name as transport_route_name 
     FROM students s 
     LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id 
     WHERE s.grade = $1 AND s.active = true`,
    [grade]
  );
  return res.rows;
}

/**
 * Obtiene estudiantes por ruta de transporte
 */
export async function getStudentsByRoute(routeId) {
  if (!isDbAvailable) {
    return await studentStorage.find(s => s.transport_route_id === routeId && s.active !== false);
  }

  const res = await query(
    `SELECT s.*, tr.name as transport_route_name 
     FROM students s 
     LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id 
     WHERE s.transport_route_id = $1 AND s.active = true`,
    [routeId]
  );
  return res.rows;
}

/**
 * Crea un nuevo estudiante
 */
export async function createStudent(data) {
  if (!isDbAvailable) {
    return await studentStorage.insert({
      ...data,
      active: true,
      created_at: new Date().toISOString()
    });
  }

  const res = await query(
    `INSERT INTO students (name, grade, photo_url, transport_route_id, parent_email, parent_phone, unique_code, transport_type, daily_transport) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     RETURNING *`,
    [
      data.name,
      data.grade,
      data.photo_url || null,
      data.transport_route_id || null,
      data.parent_email || null,
      data.parent_phone || null,
      data.unique_code,
      data.transport_type || 'parent',
      data.daily_transport || false,
    ]
  );
  return res.rows[0];
}

/**
 * Actualiza un estudiante
 */
export async function updateStudent(id, data) {
  if (!isDbAvailable) {
    return await studentStorage.update(id, data);
  }

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.grade !== undefined) {
    fields.push(`grade = $${paramIndex++}`);
    values.push(data.grade);
  }
  if (data.photo_url !== undefined) {
    fields.push(`photo_url = $${paramIndex++}`);
    values.push(data.photo_url);
  }
  if (data.transport_route_id !== undefined) {
    fields.push(`transport_route_id = $${paramIndex++}`);
    values.push(data.transport_route_id);
  }
  if (data.parent_email !== undefined) {
    fields.push(`parent_email = $${paramIndex++}`);
    values.push(data.parent_email);
  }
  if (data.parent_phone !== undefined) {
    fields.push(`parent_phone = $${paramIndex++}`);
    values.push(data.parent_phone);
  }
  if (data.transport_type !== undefined) {
    fields.push(`transport_type = $${paramIndex++}`);
    values.push(data.transport_type);
  }
  if (data.daily_transport !== undefined) {
    fields.push(`daily_transport = $${paramIndex++}`);
    values.push(data.daily_transport);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const res = await query(
    `UPDATE students SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return res.rows[0];
}

/**
 * Desactiva un estudiante
 */
export async function deleteStudent(id) {
  if (!isDbAvailable) {
    return await studentStorage.update(id, { active: false });
  }

  const res = await query('UPDATE students SET active = false WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

/**
 * Busca estudiantes por nombre
 */
export async function searchStudents(searchTerm) {
  if (!isDbAvailable) {
    const term = searchTerm.toLowerCase();
    const students = await studentStorage.getAll();
    return students.filter(s =>
      s.active !== false &&
      (s.name.toLowerCase().includes(term) || s.unique_code === searchTerm)
    );
  }

  const res = await query(
    `SELECT s.*, tr.name as transport_route_name 
     FROM students s 
     LEFT JOIN transport_routes tr ON s.transport_route_id = tr.id 
     WHERE (LOWER(s.name) LIKE LOWER($1) OR s.unique_code = $2) AND s.active = true`,
    [`%${searchTerm}%`, searchTerm]
  );
  return res.rows;
}

/**
 * Crea múltiples estudiantes de forma masiva
 */
export async function bulkCreateStudents(studentsData) {
  if (!isDbAvailable) {
    // bulkInsert: 1 lectura + 1 escritura para N estudiantes
    const { inserted, skipped } = await studentStorage.bulkInsert(studentsData, 'id');
    return { created: inserted, skipped };
  }

  // Implementación para PostgreSQL usando un solo INSERT con múltiples valores
  const values = [];
  const valueStrings = [];
  let paramIndex = 1;

  for (const data of studentsData) {
    const p = paramIndex;
    valueStrings.push(`($${p}, $${p + 1}, $${p + 2}, $${p + 3}, $${p + 4}, $${p + 5}, $${p + 6}, $${p + 7}, $${p + 8})`);
    paramIndex += 9;
    values.push(
      data.name,
      data.grade,
      data.photo_url || null,
      data.transport_route_id || null,
      data.parent_email || null,
      data.parent_phone || null,
      data.unique_code,
      data.transport_type || 'parent',
      data.daily_transport || false
    );
  }

  const res = await query(
    `INSERT INTO students (name, grade, photo_url, transport_route_id, parent_email, parent_phone, unique_code, transport_type, daily_transport) 
     VALUES ${valueStrings.join(', ')} 
     RETURNING *`,
    values
  );
  return { created: res.rows, skipped: 0 };
}

/**
 * Upsert masivo de estudiantes
 */
export async function bulkUpsertStudents(studentsData) {
  if (!isDbAvailable) {
    const { inserted, updated } = await studentStorage.bulkUpsert(studentsData, 'id');
    return { inserted, updated };
  }
  return { inserted: [], updated: [] };
}

/**
 * Borra todos los estudiantes
 */
export async function deleteAllStudents() {
  if (!isDbAvailable) {
    await studentStorage.deleteAll();
    return true;
  }
  await query('DELETE FROM students');
  return true;
}

export default {
  getAllStudents,
  getTotalStudents,
  getStudentById,
  getStudentsByGrade,
  getStudentsByRoute,
  createStudent,
  searchStudents,
  bulkCreateStudents,
  bulkUpsertStudents,
  deleteAllStudents,
};
