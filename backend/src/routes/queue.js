import express from 'express';
import * as QueueController from '../controllers/QueueController.js';
import { authenticateToken, authorizeOperator } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas para la gestión de la cola
router.get('/', authenticateToken, QueueController.getQueue);
router.get('/stats', authenticateToken, QueueController.getQueueStats);
router.post('/clear', authenticateToken, authorizeOperator, QueueController.clearQueue);
router.post('/:id/process', authenticateToken, authorizeOperator, QueueController.processStudent);
router.delete('/:id', authenticateToken, authorizeOperator, QueueController.removeFromQueue);
router.post('/process-transport', authenticateToken, authorizeOperator, QueueController.processTransport);

export default router;
