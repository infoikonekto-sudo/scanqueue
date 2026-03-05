import * as ScanModel from '../models/Scan.js';
import * as ScanService from '../services/ScanService.js';
import * as ValidationService from '../services/ValidationService.js';
import { AuditLogger } from '../services/AuditLogger.js';

const auditLogger = new AuditLogger();

/**
 * POST /api/scan
 * Registra un nuevo escaneo (CRÍTICO)
 * Endpoint mejorado con validación inteligente y corrección de errores
 */
export async function recordScan(req, res, next) {
  try {
    const { code, student_id, type = 'auto' } = req.body;
    const operatorId = req.user.id;
    const ipAddress = req.ip;

    let result;
    const context = { operatorId, ipAddress, userAgent: req.get('user-agent') };

    // Opción 1: Validar código con corrección de errores
    if (code) {
      // Usar el nuevo validador con timeout de 500ms
      const validationResult = await ValidationService.validateCodeWithTimeout(
        code,
        type,
        context,
        500
      );

      // Mapear resultado de validación a respuesta HTTP
      if (validationResult.status === 'success') {
        // Crear escaneo en BD
        const scan = await ScanModel.createScan(
          validationResult.studentId,
          operatorId,
          'completed'
        );

        result = {
          success: true,
          studentId: validationResult.studentId,
          name: validationResult.name,
          grade: validationResult.grade,
          section: validationResult.section,
          level: validationResult.level,
          scanned: scan.created_at,
          isDuplicate: false,
          confidence: validationResult.confidence,
          message: validationResult.message,
        };

        // EMISIÓN EN TIEMPO REAL: Notificar a todos los clientes (Displays, Admin, etc)
        if (req.io) {
          req.io.emit('scan:new', {
            id: result.studentId,
            name: result.name,
            grade: result.grade,
            section: result.section,
            level: result.level,
            scanned_at: result.scanned,
            status: 'pending'
          });

          req.io.emit('queue:update', {
            event: 'new_scan',
            student: result,
            timestamp: new Date().toISOString()
          });
        }

        res.status(201).json(result);
      } else if (validationResult.status === 'warning') {
        // Duplicado detectado
        result = {
          success: false,
          error: validationResult.error,
          message: validationResult.message,
          lastScan: validationResult.lastScan,
          suggestion: validationResult.suggestion,
          studentId: validationResult.studentId,
          name: validationResult.name,
          needsConfirmation: true,
        };
        res.status(400).json(result);
      } else {
        // Error en validación
        result = {
          success: false,
          error: validationResult.error || 'VALIDATION_ERROR',
          message: validationResult.message,
          suggestion: validationResult.suggestion,
        };
        res.status(400).json(result);
      }
    } else if (student_id) {
      // Opción 2: Si se proporciona student_id directo, crear escaneo
      const scan = await ScanModel.createScan(student_id, operatorId, 'pending');
      result = {
        success: true,
        scan,
        message: 'Escaneo registrado',
      };
      res.status(201).json(result);
    } else {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETER',
        message: 'Se requiere "code" o "student_id"',
        suggestion: 'Incluir código escaneado o ID de estudiante',
      });
    }
  } catch (error) {
    console.error('Error en recordScan:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
    });
  }
}

/**
 * GET /api/scan/queue
 * Obtiene la cola de escaneos pendientes
 */
export async function getScanQueue(req, res, next) {
  try {
    const queue = await ScanModel.getScanQueue();

    res.json({
      success: true,
      data: queue,
      count: queue.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/scan/history
 * Obtiene historial de escaneos
 */
export async function getScanHistory(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    let scans;
    if (startDate && endDate) {
      scans = await ScanModel.getScansByDateRange(startDate, endDate);
    } else {
      scans = await ScanModel.getScansToday();
    }

    res.json({
      success: true,
      data: scans,
      count: scans.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/scan/:id/status
 * Actualiza el estado de un escaneo
 */
export async function updateScanStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'completed', 'transport'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido',
      });
    }

    const scan = await ScanModel.updateScanStatus(id, status, notes);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Escaneo no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado',
      data: scan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/scan/:id/mark-transport
 * Marca un escaneo como transporte
 */
export async function markAsTransport(req, res, next) {
  try {
    const { id } = req.params;

    const scan = await ScanModel.markScanAsTransport(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Escaneo no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Escaneo marcado como transporte',
      data: scan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/scan/validate
 * Valida un código QR/barcode SIN crear escaneo
 * Útil para previstas previa a la confirmación
 */
export async function validateCode(req, res, next) {
  try {
    const { code, type = 'auto' } = req.body;
    const operatorId = req.user.id;
    const ipAddress = req.ip;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CODE',
        message: 'Se requiere proporcionar "code"',
      });
    }

    const context = { operatorId, ipAddress, userAgent: req.get('user-agent') };

    // Validar con timeout
    const result = await ValidationService.validateCodeWithTimeout(
      code,
      type,
      context,
      500
    );

    // Retornar el resultado tal como viene del validador
    if (result.status === 'success' || result.status === 'warning') {
      res.json({
        success: result.status === 'success',
        ...result,
      });
    } else {
      res.status(400).json({
        success: false,
        ...result,
      });
    }
  } catch (error) {
    console.error('Error en validateCode:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
    });
  }
}

/**
 * DELETE /api/scan/:id
 * Elimina un escaneo
 */
export async function deleteScan(req, res, next) {
  try {
    const { id } = req.params;

    await ScanModel.deleteScan(id);

    res.json({
      success: true,
      message: 'Escaneo eliminado',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/scan/stats/validation
 * Obtiene estadísticas de validación
 */
export async function getValidationStats(req, res, next) {
  try {
    const stats = await ValidationService.getValidationStats();
    const auditStats = await auditLogger.getStats(24); // Últimas 24 horas

    res.json({
      success: true,
      data: {
        validation: stats,
        audit: auditStats,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/scan/logs/audit
 * Obtiene logs de auditoría (filtrable)
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { startDate, endDate, operatorId, type } = req.query;

    let logs;

    if (type === 'duplicates' && startDate && endDate) {
      logs = await auditLogger.getDuplicateLogs(
        new Date(startDate),
        new Date(endDate)
      );
    } else if (type === 'errors' && startDate && endDate) {
      logs = await auditLogger.getErrorLogs(
        new Date(startDate),
        new Date(endDate)
      );
    } else if (operatorId && startDate && endDate) {
      logs = await auditLogger.getLogsByOperator(
        operatorId,
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      logs = await auditLogger.getRecentValidations(100);
    }

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/scan/logs/summary
 * Obtiene resumen rápido de la sesión
 */
export async function getQuickSummary(req, res, next) {
  try {
    const summary = auditLogger.getQuickSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/scan/logs/export
 * Exporta logs a CSV
 */
export async function exportLogsCSV(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren startDate y endDate',
      });
    }

    const csv = await auditLogger.exportToCSV(
      new Date(startDate),
      new Date(endDate)
    );

    if (!csv) {
      return res.status(500).json({
        success: false,
        message: 'Error generando CSV',
      });
    }

    // Retornar como descarga
    res.attachment('audit-logs.csv');
    res.type('text/csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

export default {
  recordScan,
  getScanQueue,
  getScanHistory,
  updateScanStatus,
  markAsTransport,
  validateCode,
  deleteScan,
  getValidationStats,
  getAuditLogs,
  getQuickSummary,
  exportLogsCSV,
};
