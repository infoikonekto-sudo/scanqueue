import * as ScanService from '../services/ScanService.js';
import * as ScanModel from '../models/Scan.js';
import * as StudentModel from '../models/Student.js';
import * as RouteModel from '../models/Route.js';

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas en vivo
 */
export async function getDashboardStats(req, res, next) {
  try {
    const stats = await ScanService.getScanStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('ERROR en getDashboardStats:', error);
    next(error);
  }
}

/**
 * GET /api/dashboard/today
 * Obtiene resumen del día
 */
export async function getTodaySummary(req, res, next) {
  try {
    const scansToday = await ScanModel.getScansToday();
    const routes = await RouteModel.getAllRoutes();

    const summary = {
      date: new Date().toISOString().split('T')[0],
      totalScans: scansToday.length,
      pendingCount: scansToday.filter((s) => s.status === 'pending').length,
      completedCount: scansToday.filter((s) => s.status === 'completed').length,
      transportCount: scansToday.filter((s) => s.status === 'transport').length,
      routes: routes.map((r) => ({
        id: r.id,
        name: r.name,
        capacity: r.capacity,
        studentCount: parseInt(r.student_count || 0),
      })),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('ERROR en getTodaySummary:', error);
    next(error);
  }
}

/**
 * GET /api/dashboard/attendance
 * Obtiene porcentaje de asistencia
 */
export async function getAttendanceReport(req, res, next) {
  try {
    const totalStudents = await StudentModel.getTotalStudents();
    const scansToday = await ScanModel.getScansToday();

    const uniqueStudents = new Set(scansToday.map((s) => s.student_id)).size;

    const report = {
      totalStudents,
      attendanceCount: uniqueStudents,
      attendanceRate: totalStudents > 0
        ? ((uniqueStudents / totalStudents) * 100).toFixed(2)
        : "0.00",
      absentCount: totalStudents - uniqueStudents,
    };

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getDashboardStats,
  getTodaySummary,
  getAttendanceReport,
};
