import { query } from '../config/database.js';

/**
 * Obtiene todos los usuarios
 */
export async function getAllUsers() {
  const res = await query('SELECT id, email, name, role, active, created_at FROM users');
  return res.rows;
}

/**
 * Obtiene un usuario por email
 */
export async function getUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id) {
  const res = await query('SELECT id, email, name, role, active, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(email, password, name, role = 'operator') {
  const res = await query(
    'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
    [email, password, name, role]
  );
  return res.rows[0];
}

/**
 * Actualiza un usuario
 */
export async function updateUser(id, data) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.password !== undefined) {
    fields.push(`password = $${paramIndex++}`);
    values.push(data.password);
  }
  if (data.role !== undefined) {
    fields.push(`role = $${paramIndex++}`);
    values.push(data.role);
  }
  if (data.active !== undefined) {
    fields.push(`active = $${paramIndex++}`);
    values.push(data.active);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const res = await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
  return res.rows[0];
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id) {
  const res = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return res.rows[0];
}

export default {
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
