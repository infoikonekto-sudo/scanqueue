/**
 * SERVICIO DE AUDITORÍA Y LOGS
 * Propósito: Registrar todos los escaneos, validaciones, errores y sugerencias
 */

import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../../logs');

// Crear directorio de logs si no existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export class AuditLogger {
  constructor() {
    this.logsInMemory = []; // Buffer de últimos 1000 logs
    this.maxMemoryLogs = 1000;
  }

  /**
   * Registrar validación/escaneo
   */
  async logValidation(validationResult, context = {}) {
    try {
      const logEntry = {
        timestamp: new Date(),
        status: validationResult.status,
        studentId: validationResult.studentId,
        name: validationResult.name,
        grade: validationResult.grade,
        error: validationResult.error,
        message: validationResult.message,
        suggestion: validationResult.suggestion,
        confidence: validationResult.confidence,
        isDuplicate: validationResult.duplicateFlag,
        processingTime: validationResult.processingTime,
        operatorId: context.operatorId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      };

      // Guardar en memoria
      this.logsInMemory.push(logEntry);
      if (this.logsInMemory.length > this.maxMemoryLogs) {
        this.logsInMemory.shift();
      }

      // Guardar en archivo (async, sin bloquear)
      this.saveToFile(logEntry);

      // Si hay error o duplicado, guardar en BD también
      if (validationResult.status !== 'success') {
        this.saveToDatabase(logEntry).catch(err =>
          console.error('Error guardando en BD:', err)
        );
      }

      return logEntry;
    } catch (error) {
      console.error('Error en audit log:', error);
    }
  }

  /**
   * Guardar en archivo JSON
   */
  saveToFile(logEntry) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = path.join(LOGS_DIR, `validation-${today}.json`);

      // Leer archivo existente
      let logs = [];
      if (fs.existsSync(filename)) {
        const content = fs.readFileSync(filename, 'utf-8');
        logs = JSON.parse(content);
      }

      // Agregar nuevo log
      logs.push(logEntry);

      // Guardar
      fs.writeFileSync(filename, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error guardando archivo de log:', error);
    }
  }

  /**
   * Guardar en base de datos (tabla de errores/duplicados)
   */
  async saveToDatabase(logEntry) {
    try {
      // Tabla: validation_logs
      await query(
        `INSERT INTO validation_logs 
        (student_id, status, error, message, confidence, is_duplicate, processing_time, operator_id, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          logEntry.studentId,
          logEntry.status,
          logEntry.error,
          logEntry.message,
          logEntry.confidence,
          logEntry.isDuplicate,
          logEntry.processingTime,
          logEntry.operatorId || null,
          logEntry.ipAddress || null,
        ]
      );
    } catch (error) {
      // La tabla podría no existir en esquema actual
      console.log('Nota: Tabla validation_logs no disponible');
    }
  }

  /**
   * Obtener logs de validación recientes
   */
  async getRecentValidations(limit = 100) {
    try {
      const res = await query(
        `SELECT * FROM validation_logs 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return res.rows;
    } catch {
      // Si la tabla no existe, retornar desde memoria
      return this.logsInMemory.slice(-limit);
    }
  }

  /**
   * Obtener logs de duplicados
   */
  async getDuplicateLogs(startDate, endDate) {
    try {
      const res = await query(
        `SELECT * FROM validation_logs 
         WHERE is_duplicate = true 
         AND created_at BETWEEN $1 AND $2
         ORDER BY created_at DESC`,
        [startDate, endDate]
      );
      return res.rows;
    } catch {
      return this.logsInMemory.filter(
        log => log.isDuplicate && log.timestamp >= startDate && log.timestamp <= endDate
      );
    }
  }

  /**
   * Obtener logs de errores
   */
  async getErrorLogs(startDate, endDate) {
    try {
      const res = await query(
        `SELECT * FROM validation_logs 
         WHERE status = 'error' 
         AND created_at BETWEEN $1 AND $2
         ORDER BY created_at DESC`,
        [startDate, endDate]
      );
      return res.rows;
    } catch {
      return this.logsInMemory.filter(
        log => log.status === 'error' && log.timestamp >= startDate && log.timestamp <= endDate
      );
    }
  }

  /**
   * Obtener estadísticas de validación
   */
  async getStats(hoursBack = 24) {
    try {
      const since = new Date(Date.now() - hoursBack * 3600000);

      const res = await query(
        `SELECT 
          COUNT(*) as total_validations,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
          COUNT(CASE WHEN is_duplicate THEN 1 END) as duplicates,
          AVG(processing_time) as avg_processing_time,
          MAX(processing_time) as max_processing_time,
          MIN(processing_time) as min_processing_time
         FROM validation_logs 
         WHERE created_at >= $1`,
        [since]
      );

      return res.rows[0] || {};
    } catch {
      // Calcular desde memoria
      const logs = this.logsInMemory;
      return {
        total_validations: logs.length,
        successful: logs.filter(l => l.status === 'success').length,
        errors: logs.filter(l => l.status === 'error').length,
        duplicates: logs.filter(l => l.isDuplicate).length,
        avg_processing_time:
          logs.length > 0
            ? Math.round(
              logs.reduce((sum, l) => sum + l.processingTime, 0) / logs.length
            )
            : 0,
      };
    }
  }

  /**
   * Obtener logs por fecha
   */
  async getLogsByDate(dateStr) {
    try {
      const logs = this.logsInMemory.filter(
        log => log.timestamp.toISOString().split('T')[0] === dateStr
      );
      return logs;
    } catch {
      return [];
    }
  }

  /**
   * Obtener logs por operador
   */
  async getLogsByOperator(operatorId, startDate, endDate) {
    try {
      const res = await query(
        `SELECT * FROM validation_logs 
         WHERE operator_id = $1 
         AND created_at BETWEEN $2 AND $3
         ORDER BY created_at DESC`,
        [operatorId, startDate, endDate]
      );
      return res.rows;
    } catch {
      return this.logsInMemory.filter(
        log => log.operatorId === operatorId && log.timestamp >= startDate && log.timestamp <= endDate
      );
    }
  }

  /**
   * Exportar logs a CSV
   */
  async exportToCSV(startDate, endDate) {
    try {
      const logs = await this.getRecentValidations(10000);
      const filtered = logs.filter(
        log => new Date(log.timestamp) >= startDate && new Date(log.timestamp) <= endDate
      );

      // Convertir a CSV
      const headers = [
        'timestamp',
        'studentId',
        'status',
        'error',
        'isDuplicate',
        'processingTime',
      ];
      const rows = filtered.map(log =>
        [
          log.timestamp ?? log.created_at ?? '',
          log.studentId ?? log.student_id ?? '',
          log.status ?? '',
          log.error ?? '',
          (log.isDuplicate ?? log.is_duplicate) ? 'yes' : 'no',
          log.processingTime ?? log.processing_time ?? '',
        ].join(',')
      );

      const csv = [headers.join(','), ...rows].join('\n');
      return csv;
    } catch (error) {
      console.error('Error exportando CSV:', error);
      return null;
    }
  }

  /**
   * Obtener resumen rápido
   */
  getQuickSummary() {
    const now = Date.now();
    const lastMinute = this.logsInMemory.filter(l => now - l.timestamp.getTime() < 60000);
    const lastHour = this.logsInMemory.filter(l => now - l.timestamp.getTime() < 3600000);

    return {
      lastMinute: {
        total: lastMinute.length,
        successful: lastMinute.filter(l => l.status === 'success').length,
        errors: lastMinute.filter(l => l.status === 'error').length,
        duplicates: lastMinute.filter(l => l.isDuplicate).length,
      },
      lastHour: {
        total: lastHour.length,
        successful: lastHour.filter(l => l.status === 'success').length,
        errors: lastHour.filter(l => l.status === 'error').length,
        duplicates: lastHour.filter(l => l.isDuplicate).length,
      },
      memoryUsage: {
        logsStored: this.logsInMemory.length,
        maxCapacity: this.maxMemoryLogs,
      },
    };
  }
}

export default AuditLogger;
