import * as QRService from '../services/QRService.js';
import * as StudentModel from '../models/Student.js';

/**
 * POST /api/qr/generate
 * Genera QR para un estudiante
 */
export async function generateQR(req, res, next) {
  try {
    const { studentId } = req.body;

    const student = await StudentModel.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
      });
    }

    const qrCode = await QRService.generateQRForStudent(student);

    res.json({
      success: true,
      message: 'Código QR generado exitosamente',
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/qr/batch
 * Genera QR en lote para múltiples estudiantes
 */
export async function generateBatchQR(req, res, next) {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de estudiantes',
      });
    }

    const students = await Promise.all(
      studentIds.map((id) => StudentModel.getStudentById(id))
    );

    const validStudents = students.filter((s) => s !== null);

    const result = await QRService.generateBatchQRCodes(validStudents);

    res.json({
      success: true,
      message: 'Códigos QR generados en lote',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/qr/:studentId
 * Obtiene el QR de un estudiante
 */
export async function getQR(req, res, next) {
  try {
    const { studentId } = req.params;

    const qrCode = await QRService.getStudentQRCode(studentId);

    res.json({
      success: true,
      data: qrCode,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export default {
  generateQR,
  generateBatchQR,
  getQR,
};
