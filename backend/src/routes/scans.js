import express from 'express';
import * as ScanController from '../controllers/ScanController.js';
import { authenticateToken, authorizeOperator } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/scan
 * Registra un nuevo escaneo (CRÍTICO)
 */
router.post('/', authenticateToken, authorizeOperator, ScanController.recordScan);

/**
 * POST /api/scan/validate
 * Valida un código QR/barcode sin crear escaneo
 */
router.post('/validate', authenticateToken, authorizeOperator, ScanController.validateCode);

/**
 * GET /api/scan/queue
 * Obtiene la cola de escaneos pendientes
 */
router.get('/queue', authenticateToken, ScanController.getScanQueue);

/**
 * GET /api/scan/history
 * Obtiene historial de escaneos
 */
router.get('/history', authenticateToken, ScanController.getScanHistory);

/**
 * GET /api/scan/stats/validation
 * Obtiene estadísticas de validación
 */
router.get('/stats/validation', authenticateToken, ScanController.getValidationStats);

/**
 * GET /api/scan/logs/audit
 * Obtiene logs de auditoría (filtrable por fecha, operador, tipo)
 */
router.get('/logs/audit', authenticateToken, ScanController.getAuditLogs);

/**
 * GET /api/scan/logs/summary
 * Obtiene resumen rápido de la sesión
 */
router.get('/logs/summary', authenticateToken, ScanController.getQuickSummary);

/**
 * GET /api/scan/logs/export
 * Exporta logs a CSV
 */
router.get('/logs/export', authenticateToken, ScanController.exportLogsCSV);

/**
 * PUT /api/scan/:id/status
 * Actualiza el estado de un escaneo
 */
router.put('/:id/status', authenticateToken, authorizeOperator, ScanController.updateScanStatus);

/**
 * PUT /api/scan/:id/mark-transport
 * Marca un escaneo como transporte
 */
router.put('/:id/mark-transport', authenticateToken, authorizeOperator, ScanController.markAsTransport);

/**
 * DELETE /api/scan/:id
 * Elimina un escaneo
 */
router.delete('/:id', authenticateToken, authorizeOperator, ScanController.deleteScan);

export default router;
