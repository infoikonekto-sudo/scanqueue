import express from 'express';
import * as AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, loginSchema, registerSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Autentica un usuario
 */
router.post('/login', validateRequest(loginSchema), AuthController.login);

/**
 * POST /api/auth/register
 * Registra un nuevo usuario admin/operador
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * GET /api/auth/me
 * Obtiene información del usuario actual
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;
