import { query } from '../config/database.js';

/**
 * Crea un código QR
 */
export async function createQRCode(studentId, qrData, barcode, dataUrl) {
  const res = await query(
    `INSERT INTO qr_codes (student_id, qr_data, barcode, data_url) 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT (student_id) DO UPDATE SET qr_data = $2, barcode = $3, data_url = $4, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [studentId, JSON.stringify(qrData), barcode, dataUrl]
  );
  return res.rows[0];
}

/**
 * Obtiene código QR por ID de estudiante
 */
export async function getQRCodeByStudentId(studentId) {
  const res = await query(
    `SELECT * FROM qr_codes WHERE student_id = $1`,
    [studentId]
  );
  return res.rows[0];
}

/**
 * Obtiene código QR por barcode
 */
export async function getQRCodeByBarcode(barcode) {
  const res = await query(
    `SELECT qc.*, s.id, s.name, s.grade 
     FROM qr_codes qc
     JOIN students s ON qc.student_id = s.id
     WHERE qc.barcode = $1`,
    [barcode]
  );
  return res.rows[0];
}

/**
 * Obtiene todos los códigos QR
 */
export async function getAllQRCodes() {
  const res = await query(
    `SELECT qc.*, s.name as student_name, s.grade 
     FROM qr_codes qc 
     JOIN students s ON qc.student_id = s.id 
     ORDER BY s.name`
  );
  return res.rows;
}

/**
 * Elimina código QR
 */
export async function deleteQRCode(studentId) {
  const res = await query(
    `DELETE FROM qr_codes WHERE student_id = $1 RETURNING *`,
    [studentId]
  );
  return res.rows[0];
}

export default {
  createQRCode,
  getQRCodeByStudentId,
  getQRCodeByBarcode,
  getAllQRCodes,
  deleteQRCode,
};
