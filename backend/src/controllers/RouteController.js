import * as RouteModel from '../models/Route.js';
import * as StudentModel from '../models/Student.js';

/**
 * GET /api/routes
 * Obtiene todas las rutas
 */
export async function getAllRoutes(req, res, next) {
  try {
    const routes = await RouteModel.getAllRoutes();

    res.json({
      success: true,
      data: routes,
      count: routes.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/routes/:id
 * Obtiene una ruta por ID
 */
export async function getRouteById(req, res, next) {
  try {
    const { id } = req.params;
    const route = await RouteModel.getRouteById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/routes
 * Crea una nueva ruta
 */
export async function createRoute(req, res, next) {
  try {
    const { name, capacity, description } = req.validatedData;

    const route = await RouteModel.createRoute(name, capacity, description);

    res.status(201).json({
      success: true,
      message: 'Ruta creada exitosamente',
      data: route,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/routes/:id
 * Actualiza una ruta
 */
export async function updateRoute(req, res, next) {
  try {
    const { id } = req.params;
    const route = await RouteModel.getRouteById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    const updated = await RouteModel.updateRoute(id, req.body);

    res.json({
      success: true,
      message: 'Ruta actualizada exitosamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/routes/:id
 * Elimina una ruta
 */
export async function deleteRoute(req, res, next) {
  try {
    const { id } = req.params;
    const route = await RouteModel.getRouteById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
    }

    await RouteModel.deleteRoute(id);

    res.json({
      success: true,
      message: 'Ruta eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/routes/:id/students
 * Obtiene estudiantes de una ruta
 */
export async function getRouteStudents(req, res, next) {
  try {
    const { id } = req.params;

    const students = await StudentModel.getStudentsByRoute(id);

    res.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/routes/:id/scans
 * Obtiene escaneos de una ruta
 */
export async function getRouteScans(req, res, next) {
  try {
    const { id } = req.params;

    const data = await RouteModel.getRouteWithScans(id);

    // Agrupar datos por estudiante
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.student_id]) {
        grouped[row.student_id] = {
          studentId: row.student_id,
          studentName: row.student_name,
          grade: row.grade,
          scans: [],
        };
      }
      if (row.scan_id) {
        grouped[row.student_id].scans.push({
          scanId: row.scan_id,
          status: row.status,
          timestamp: row.timestamp,
        });
      }
    });

    res.json({
      success: true,
      routeId: id,
      data: Object.values(grouped),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/routes/daily-transport/:studentId
 * Alterna el estado de transporte diario de un estudiante
 */
export async function toggleDailyTransport(req, res, next) {
  try {
    const { studentId } = req.params;
    const { active } = req.body;

    const student = await StudentModel.getStudentById(parseInt(studentId));
    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    const updated = await StudentModel.updateStudent(studentId, { daily_transport: active });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/routes/daily-transport/active
 * Obtiene estudiantes con transporte diario activo hoy
 */
export async function getDailyTransportActive(req, res, next) {
  try {
    const students = await StudentModel.searchStudents(''); // Obtener todos
    const active = students.filter(s => s.daily_transport === true);

    res.json({
      success: true,
      data: active,
      count: active.length,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteStudents,
  getRouteScans,
  toggleDailyTransport,
  getDailyTransportActive,
};
