import express from 'express';
import * as RouteController from '../controllers/RouteController.js';
import { authenticateToken, authorizeOperator } from '../middleware/auth.js';
import { validateRequest, routeSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/routes
 * Obtiene todas las rutas
 */
router.get('/', authenticateToken, RouteController.getAllRoutes);

/**
 * POST /api/routes
 * Crea una nueva ruta
 */
router.post('/', authenticateToken, authorizeOperator, validateRequest(routeSchema), RouteController.createRoute);

/**
 * GET /api/routes/:id
 * Obtiene una ruta por ID
 */
router.get('/:id', authenticateToken, RouteController.getRouteById);

/**
 * PUT /api/routes/:id
 * Actualiza una ruta
 */
router.put('/:id', authenticateToken, authorizeOperator, RouteController.updateRoute);

/**
 * DELETE /api/routes/:id
 * Elimina una ruta
 */
router.delete('/:id', authenticateToken, authorizeOperator, RouteController.deleteRoute);

/**
 * GET /api/routes/:id/students
 * Obtiene estudiantes de una ruta
 */
router.get('/:id/students', authenticateToken, RouteController.getRouteStudents);

/**
 * GET /api/routes/:id/scans
 * Obtiene escaneos de una ruta
 */
router.get('/:id/scans', authenticateToken, RouteController.getRouteScans);

export default router;
