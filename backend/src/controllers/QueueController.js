import * as ScanModel from '../models/Scan.js';
import * as ScanService from '../services/ScanService.js';

/**
 * GET /api/queue
 * Obtiene la cola de estudiantes pendientes para hoy
 */
export async function getQueue(req, res, next) {
    try {
        const queue = await ScanModel.getScanQueue();
        res.json({
            success: true,
            data: queue,
            count: queue.length
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/queue/stats
 * Obtiene estadísticas rápidas de la cola
 */
export async function getQueueStats(req, res, next) {
    try {
        const stats = await ScanService.getScanStatistics();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/queue/clear
 * Limpia la cola de hoy (marca como completados)
 */
export async function clearQueue(req, res, next) {
    try {
        const cleared = await ScanModel.clearTodayQueue();
        res.json({
            success: true,
            message: 'Cola despejada correctamente',
            count: cleared.length
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/queue/:id/process
 * Procesa un estudiante individualmente
 */
export async function processStudent(req, res, next) {
    try {
        const { id } = req.params;
        const { status = 'completed', notes } = req.body;

        const updated = await ScanModel.updateScanStatus(id, status, notes);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Escaneo no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estudiante procesado',
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/queue/:id
 * Remueve de la cola
 */
export async function removeFromQueue(req, res, next) {
    try {
        const { id } = req.params;
        await ScanModel.deleteScan(id);
        res.json({
            success: true,
            message: 'Removido de la cola'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/queue/process-transport
 * Procesa todos los estudiantes de un nivel (despacho)
 */
export async function processTransport(req, res, next) {
    try {
        const { level } = req.body;
        if (!level) {
            return res.status(400).json({
                success: false,
                message: 'El nivel es requerido'
            });
        }

        const result = await ScanModel.processTransportScanQueue(level);

        res.json({
            success: true,
            message: `Nivel ${level} despachado`,
            count: result.count
        });
    } catch (error) {
        next(error);
    }
}

export default {
    getQueue,
    getQueueStats,
    clearQueue,
    processStudent,
    removeFromQueue,
    processTransport
};
