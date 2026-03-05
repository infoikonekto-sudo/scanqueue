import * as StudentModel from '../models/Student.js';
import * as QRService from '../services/QRService.js';

/**
 * GET /api/students
 * Obtiene lista de estudiantes
 */
export async function getAllStudents(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 9999;
    const offset = parseInt(req.query.offset) || 0;

    const students = await StudentModel.getAllStudents(limit, offset);
    const total = await StudentModel.getTotalStudents();

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/:id
 * Obtiene un estudiante por ID
 */
export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const student = await StudentModel.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/students
 * Crea un nuevo estudiante
 */
export async function createStudent(req, res, next) {
  try {
    const { name, grade, section, level, transport_route_id, parent_email, parent_phone, photo_url } = req.validatedData;

    // Generar código único
    const uniqueCode = `STU${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const student = await StudentModel.createStudent({
      name,
      grade,
      section: section || null,
      level: level || 'primaria',
      transport_route_id: transport_route_id || null,
      parent_email: parent_email || null,
      parent_phone: parent_phone || null,
      photo_url: photo_url || null,
      unique_code: uniqueCode,
    });

    // Generar código QR de forma asincrónica
    setTimeout(() => {
      QRService.generateQRForStudent(student).catch((err) => {
        console.error('Error generando QR para estudiante:', err);
      });
    }, 100);

    res.status(201).json({
      success: true,
      message: 'Estudiante creado exitosamente',
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/students/:id
 * Actualiza un estudiante
 */
export async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await StudentModel.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
      });
    }

    const updated = await StudentModel.updateStudent(id, req.validatedData);

    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/students/:id
 * Elimina un estudiante
 */
export async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await StudentModel.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
      });
    }

    await StudentModel.deleteStudent(id);

    res.json({
      success: true,
      message: 'Estudiante eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/grade/:grade
 * Obtiene estudiantes por grado
 */
export async function getStudentsByGrade(req, res, next) {
  try {
    const { grade } = req.params;
    const students = await StudentModel.getStudentsByGrade(grade);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/search/:query
 * Busca estudiantes por nombre o código
 */
export async function searchStudents(req, res, next) {
  try {
    const { query: searchTerm } = req.params;
    const students = await StudentModel.searchStudents(searchTerm);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/students/bulk
 * Crea múltiples estudiantes masivamente (sin duplicados, 1 lectura + 1 escritura)
 */
export async function bulkCreateStudents(req, res, next) {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de estudiantes',
      });
    }

    // Preparar datos (unique_code generado aquí para no repetirlos)
    const studentsToCreate = students.map((data) => ({
      ...data,
      unique_code: data.unique_code || `STU${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      active: true,
    }));

    // bulkInsert: 1 lectura + 1 escritura para todos, con deduplicación interna
    const { created, skipped } = await StudentModel.bulkCreateStudents(studentsToCreate);

    res.status(201).json({
      success: true,
      message: `${created.length} estudiantes importados. ${skipped} omitidos por duplicados.`,
      data: created,
      inserted: created.length,
      skipped,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/students/bulk-upsert
 * Crea o actualiza múltiples estudiantes
 */
export async function bulkUpsertStudents(req, res, next) {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de estudiantes',
      });
    }

    const { inserted, updated } = await StudentModel.bulkUpsertStudents(students);

    res.status(200).json({
      success: true,
      message: `${inserted.length} importados, ${updated.length} actualizados.`,
      inserted: inserted.length,
      updated: updated.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/students/all
 * Borra todos los estudiantes
 */
export async function deleteAllStudents(req, res, next) {
  try {
    await StudentModel.deleteAllStudents();
    res.json({
      success: true,
      message: 'Todos los estudiantes han sido eliminados',
    });
  } catch (error) {
    next(error);
  }
}



export default {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByGrade,
  searchStudents,
  bulkCreateStudents,
  bulkUpsertStudents,
  deleteAllStudents,
};
