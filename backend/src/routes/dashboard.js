import express from 'express';
import * as DashboardController from '../controllers/DashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas en vivo
 */
router.get('/stats', authenticateToken, DashboardController.getDashboardStats);

/**
 * GET /api/dashboard/today
 * Obtiene resumen del día
 */
router.get('/today', authenticateToken, DashboardController.getTodaySummary);

/**
 * GET /api/dashboard/attendance
 * Obtiene reporte de asistencia
 */
router.get('/attendance', authenticateToken, DashboardController.getAttendanceReport);

export default router;
