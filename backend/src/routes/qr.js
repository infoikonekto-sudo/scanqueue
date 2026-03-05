import express from 'express';
import * as QRController from '../controllers/QRController.js';
import { authenticateToken, authorizeOperator } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/qr/generate
 * Genera QR para un estudiante
 */
router.post('/generate', authenticateToken, authorizeOperator, QRController.generateQR);

/**
 * POST /api/qr/batch
 * Genera QR en lote
 */
router.post('/batch', authenticateToken, authorizeOperator, QRController.generateBatchQR);

/**
 * GET /api/qr/:studentId
 * Obtiene el QR de un estudiante
 */
router.get('/:studentId', authenticateToken, QRController.getQR);

export default router;
