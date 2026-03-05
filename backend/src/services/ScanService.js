import { config } from '../config/index.js';
import * as ScanModel from '../models/Scan.js';
import * as StudentModel from '../models/Student.js';
import * as QRCodeModel from '../models/QRCode.js';

/**
 * Validar escaneo e insertar en la BD
 */
export async function validateAndProcessScan(barcode, operatorId) {
  try {
    // 1. Validar que el barcode tenga formato válido
    if (!barcode || barcode.trim().length === 0) {
      throw new Error('Código de barras inválido o vacío');
    }

    // 2. Buscar el QR code en la BD
    let student = null;
    let qrCode = null;

    // Intentar búsqueda por código único
    const studentByCode = await StudentModel.searchStudents(barcode);
    if (studentByCode.length > 0) {
      student = studentByCode[0];
    }

    // Si no encontramos por código único, buscar por barcode QR
    if (!student) {
      qrCode = await QRCodeModel.getQRCodeByBarcode(barcode);
      if (!qrCode) {
        throw new Error('Código QR no encontrado en la base de datos');
      }
      student = await StudentModel.getStudentById(qrCode.id);
    }

    if (!student) {
      throw new Error('Estudiante no encontrado');
    }

    // 3. Detectar escaneos duplicados
    const recentScans = await ScanModel.getRecentScans(
      student.id,
      config.rateLimiting.duplicateScanTimeout
    );

    if (recentScans.length > 0) {
      throw new Error(
        `Escaneo duplicado. El estudiante fue registrado hace ${config.rateLimiting.duplicateScanTimeout} segundos`
      );
    }

    // 4. Crear nuevo escaneo
    const scan = await ScanModel.createScan(student.id, operatorId, 'pending');

    return {
      success: true,
      scan,
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        photoUrl: student.photo_url,
      },
      message: `Estudiante ${student.name} registrado exitosamente`,
    };
  } catch (error) {
    console.error('Error en validación de escaneo:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de escaneos
 */
export async function getScanStatistics() {
  try {
    const scansToday = await ScanModel.getScansToday();
    const pendingScans = await ScanModel.getPendingScans();
    const totalStudents = await StudentModel.getTotalStudents();

    const stats = {
      totalScans: scansToday.length,
      pendingScans: pendingScans.length,
      completedScans: scansToday.filter((s) => s.status === 'completed').length,
      transportScans: scansToday.filter((s) => s.status === 'transport').length,
      attendanceRate: totalStudents > 0
        ? ((scansToday.length / totalStudents) * 100).toFixed(2)
        : "0.00",
      totalStudents,
    };

    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
}

/**
 * Valida formato de código QR
 */
export function validateQRFormat(qrData) {
  try {
    if (typeof qrData === 'string') {
      JSON.parse(qrData);
    }
    return true;
  } catch {
    return false;
  }
}

export default {
  validateAndProcessScan,
  getScanStatistics,
  validateQRFormat,
};
