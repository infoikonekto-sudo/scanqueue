import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as QRCodeModel from '../models/QRCode.js';

/**
 * Genera un código QR para un estudiante
 */
export async function generateQRForStudent(student) {
  try {
    const qrData = {
      id: student.id,
      name: student.name,
      grade: student.grade,
      unique_code: student.unique_code,
      timestamp: new Date().toISOString(),
    };

    const barcode = `${student.unique_code}-${uuidv4().substring(0, 8)}`;
    const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 200,
      margin: 1,
    });

    const qrCode = await QRCodeModel.createQRCode(student.id, qrData, barcode, dataUrl);
    return qrCode;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error('No se pudo generar el código QR');
  }
}

/**
 * Genera códigos QR en lote para múltiples estudiantes
 */
export async function generateBatchQRCodes(students) {
  const results = [];
  const errors = [];

  for (const student of students) {
    try {
      const qrCode = await generateQRForStudent(student);
      results.push({
        studentId: student.id,
        studentName: student.name,
        success: true,
        qrCode,
      });
    } catch (error) {
      errors.push({
        studentId: student.id,
        studentName: student.name,
        error: error.message,
      });
    }
  }

  return {
    generated: results.length,
    failed: errors.length,
    results,
    errors,
  };
}

/**
 * Obtiene código QR de un estudiante
 */
export async function getStudentQRCode(studentId) {
  const qrCode = await QRCodeModel.getQRCodeByStudentId(studentId);
  if (!qrCode) {
    throw new Error('Código QR no encontrado');
  }
  return qrCode;
}

export default {
  generateQRForStudent,
  generateBatchQRCodes,
  getStudentQRCode,
};
