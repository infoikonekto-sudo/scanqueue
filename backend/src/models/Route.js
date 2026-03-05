import { query, isDbAvailable } from '../config/database.js';
import { routeStorage, studentStorage, scanStorage } from '../utils/jsonStorage.js';

/**
 * Obtiene todas las rutas
 */
export async function getAllRoutes() {
  if (!isDbAvailable) {
    const routes = await routeStorage.find(r => r.active !== false);
    const students = await studentStorage.getAll();

    return routes.map(r => ({
      ...r,
      student_count: students.filter(s => s && s.transport_route_id === r.id && s.active !== false).length
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const res = await query(
    `SELECT r.id, r.name, r.capacity, r.description, r.active, COUNT(s.id) as student_count 
     FROM transport_routes r 
     LEFT JOIN students s ON r.id = s.transport_route_id 
     WHERE r.active = true 
     GROUP BY r.id, r.name, r.capacity, r.description, r.active 
     ORDER BY r.name`
  );
  return res.rows;
}

/**
 * Obtiene una ruta por ID
 */
export async function getRouteById(id) {
  if (!isDbAvailable) {
    const routes = await routeStorage.find(r => r.id === id && r.active !== false);
    if (routes.length === 0) return null;

    const students = await studentStorage.find(s => s.transport_route_id === id && s.active !== false);
    return { ...routes[0], student_count: students.length };
  }

  const res = await query(
    `SELECT r.*, COUNT(s.id) as student_count 
     FROM transport_routes r 
     LEFT JOIN students s ON r.id = s.transport_route_id 
     WHERE r.id = $1 AND r.active = true 
     GROUP BY r.id`,
    [id]
  );
  return res.rows[0];
}

/**
 * Crea una nueva ruta
 */
export async function createRoute(name, capacity, description = null) {
  if (!isDbAvailable) {
    return await routeStorage.insert({ name, capacity, description, active: true });
  }

  const res = await query(
    `INSERT INTO transport_routes (name, capacity, description) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [name, capacity, description]
  );
  return res.rows[0];
}

/**
 * Actualiza una ruta
 */
export async function updateRoute(id, data) {
  if (!isDbAvailable) {
    return await routeStorage.update(id, data);
  }

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.capacity !== undefined) {
    fields.push(`capacity = $${paramIndex++}`);
    values.push(data.capacity);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.active !== undefined) {
    fields.push(`active = $${paramIndex++}`);
    values.push(data.active);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const res = await query(
    `UPDATE transport_routes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return res.rows[0];
}

/**
 * Desactiva una ruta
 */
export async function deleteRoute(id) {
  if (!isDbAvailable) {
    return await routeStorage.update(id, { active: false });
  }

  const res = await query(
    `UPDATE transport_routes SET active = false WHERE id = $1 RETURNING *`,
    [id]
  );
  return res.rows[0];
}

/**
 * Obtiene estudiantes por ruta con escaneos de hoy
 */
export async function getRouteWithScans(routeId) {
  if (!isDbAvailable) {
    const route = await getRouteById(routeId);
    if (!route) return [];

    const students = await studentStorage.find(s => s.transport_route_id === routeId && s.active !== false);
    const scans = await scanStorage.getAll();
    const today = new Date().toISOString().split('T')[0];

    return students.map(s => {
      if (!s) return null;
      const scan = scans.find(sc => sc && sc.student_id === s.id && (sc.created_at?.startsWith(today) || sc.timestamp?.startsWith(today)));
      return {
        id: route.id,
        name: route.name,
        capacity: route.capacity,
        student_id: s.id,
        student_name: s.name,
        grade: s.grade,
        scan_id: scan ? scan.id : null,
        status: scan ? scan.status : null,
        timestamp: scan ? scan.created_at : null
      };
    });
  }

  const res = await query(
    `SELECT 
      r.id, r.name, r.capacity, 
      s.id as student_id, s.name as student_name, s.grade,
      sc.id as scan_id, sc.status, sc.timestamp
     FROM transport_routes r
     LEFT JOIN students s ON r.id = s.transport_route_id
     LEFT JOIN scans sc ON s.id = sc.student_id AND DATE(sc.timestamp) = CURRENT_DATE
     WHERE r.id = $1
     ORDER BY s.name`,
    [routeId]
  );
  return res.rows;
}

export default {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteWithScans,
};
