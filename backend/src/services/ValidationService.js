/**
 * SERVICIO DE VALIDACIÓN INTELIGENTE DE CÓDIGOS QR/BARRAS
 * Propósito: Validar 200+ escaneos simultáneos con corrección de errores
 * Rendimiento: <500ms por código
 */

import * as StudentModel from '../models/Student.js';
import * as QRCodeModel from '../models/QRCode.js';
import * as ScanModel from '../models/Scan.js';
import { DuplicateCache } from './DuplicateCache.js';
import { AuditLogger } from './AuditLogger.js';
import { calculateLevenshteinDistance } from '../utils/helpers.js';

// Instancias globales
const duplicateCache = new DuplicateCache(100, 60000); // 100 escaneos, 60s de retención
const auditLogger = new AuditLogger();

/**
 * PASO 1: Detectar tipo de código (QR o barras)
 */
export function detectCodeType(rawCode) {
  try {
    // QR Code (JSON o formato URL)
    if (rawCode.startsWith('{') || rawCode.includes('|') || rawCode.includes(':')) {
      return 'qr';
    }

    // Barcode: solo números, sin caracteres especiales
    if (/^\d+$/.test(rawCode) && rawCode.length >= 5) {
      return 'barcode';
    }

    // Intenta parsear como JSON (QR con formato especial)
    try {
      JSON.parse(rawCode);
      return 'qr';
    } catch { }

    // Si no encaja con nada, asumir barcode
    return 'auto';
  } catch (error) {
    console.error('Error en detección de tipo:', error);
    return null;
  }
}

/**
 * PASO 2: Validar formato y estructura
 */
function validateFormat(rawCode, type) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!rawCode || rawCode.trim().length === 0) {
    result.valid = false;
    result.errors.push('Código vacío o inválido');
    return result;
  }

  // Limpiar espacios
  rawCode = rawCode.trim();

  if (type === 'qr') {
    // Validar QR
    try {
      // Intentar parsear como JSON
      if (rawCode.startsWith('{')) {
        const qrData = JSON.parse(rawCode);

        // Verificar campos requeridos
        if (!qrData.studentId) {
          result.errors.push('QR sin studentId');
          result.valid = false;
        }
      } else if (/^STU\d+/.test(rawCode)) {
        // Formato de ID simple
        if (rawCode.length < 3) {
          result.errors.push('ID de estudiante muy corto');
          result.valid = false;
        }
      } else {
        result.warnings.push('Formato QR no estándar');
      }
    } catch (error) {
      result.errors.push(`JSON inválido: ${error.message}`);
      result.valid = false;
    }
  } else if (type === 'barcode') {
    // Validar barcode
    if (!/^[\d\w-]+$/.test(rawCode)) {
      result.errors.push('Formato de barcode inválido');
      result.valid = false;
    }

    if (rawCode.length > 128) {
      result.errors.push('Barcode demasiado largo');
      result.valid = false;
    }
  }

  return result;
}

/**
 * PASO 3: Descodificar datos del código
 */
function decodeCodeData(rawCode, type) {
  try {
    let decoded = {
      studentId: null,
      name: null,
      grade: null,
      confidence: 100,
      raw: rawCode,
    };

    if (type === 'qr') {
      if (rawCode.startsWith('{')) {
        try {
          const qrData = JSON.parse(rawCode);
          decoded.studentId = qrData.studentId || qrData.id;
          decoded.name = qrData.name;
          decoded.grade = qrData.grade || qrData.grado;
          decoded.confidence = 100;
        } catch (error) {
          throw new Error(`No se pudo parsear JSON del QR: ${error.message}`);
        }
      } else {
        // Formato simple: STU001
        const match = rawCode.match(/^(STU\d+|U\d+|\d+)$/i);
        if (match) {
          decoded.studentId = match[1];
          decoded.confidence = 95;
        }
      }
    } else if (type === 'barcode') {
      // Barcode = solo ID numérico
      const studentId = rawCode.replace(/\D/g, '');
      if (studentId.length > 0) {
        decoded.studentId = studentId;
        decoded.confidence = 90;
      }
    }

    if (!decoded.studentId) {
      throw new Error('No se pudo extraer studentId del código');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Error descodificando: ${error.message}`);
  }
}

/**
 * PASO 4: Buscar estudiante en BD
 */
async function findStudent(studentId) {
  try {
    // Buscar por ID numérico
    let student = await StudentModel.getStudentById(parseInt(studentId));

    // Si no encuentra, buscar por unique_code
    if (!student) {
      const students = await StudentModel.searchStudents(studentId);
      if (students.length > 0) {
        student = students[0];
      }
    }

    // Si no encuentra, buscar por número similar (Levenshtein)
    if (!student) {
      const allStudents = await StudentModel.getAllStudents(1000);
      for (const s of allStudents) {
        const distance = calculateLevenshteinDistance(
          studentId.toString(),
          s.id.toString()
        );
        if (distance <= 1) {
          student = s;
          break;
        }
      }
    }

    if (!student) {
      throw new Error(`Estudiante con ID ${studentId} no encontrado`);
    }

    if (!student.active) {
      throw new Error(`Estudiante ${student.name} no está activo`);
    }

    return student;
  } catch (error) {
    throw new Error(`Error buscando estudiante: ${error.message}`);
  }
}

/**
 * PASO 5: Detectar duplicados en los últimos 30 segundos
 */
async function checkDuplicates(studentId) {
  try {
    const threshold = 30000; // 30 segundos en ms
    const cached = duplicateCache.check(studentId);

    if (cached) {
      const timeDiff = Date.now() - cached.timestamp;

      if (timeDiff < threshold) {
        return {
          isDuplicate: true,
          lastScan: cached.timestamp,
          secondsAgo: Math.floor(timeDiff / 1000),
        };
      } else if (timeDiff < 60000) {
        // Entre 30-60s: marcar como "manual review"
        return {
          isDuplicate: false,
          needsReview: true,
          lastScan: cached.timestamp,
          secondsAgo: Math.floor(timeDiff / 1000),
          message: 'Escaneo reciente - requiere revisión manual',
        };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Error en detección de duplicados:', error);
    return { isDuplicate: false, error: error.message };
  }
}

/**
 * PASO 6: Aplicar correcciones automáticas
 */
function applyErrorCorrection(decodedData, validationResult) {
  const corrected = { ...decodedData };
  let confidence = decodedData.confidence || 100;

  // Si hay warnings pero sin errores, intentar corrección
  if (validationResult.warnings.length > 0) {
    if (validationResult.warnings.some(w => w.includes('no estándar'))) {
      confidence -= 5;
    }
  }

  corrected.confidence = Math.max(0, Math.min(100, confidence));

  return corrected;
}

/**
 * FUNCIÓN PRINCIPAL: Validar código QR/Barcode
 * @param {string} rawCode - Código crudo del escaneo
 * @param {string} type - 'qr' | 'barcode' | 'auto'
 * @param {object} context - {operatorId, ipAddress, userAgent}
 * @returns {Promise<ValidationResult>}
 */
export async function validateCode(
  rawCode,
  type = 'auto',
  context = {}
) {
  const startTime = Date.now();
  let result = {
    status: 'error',
    studentId: null,
    name: null,
    grade: null,
    confidence: 0,
    duplicateFlag: false,
    timestamp: new Date(),
    message: '',
    suggestion: '',
    processingTime: 0,
    error: null,
  };

  try {
    // PASO 1: Detectar tipo
    const detectedType = type === 'auto' ? detectCodeType(rawCode) : type;
    if (!detectedType || detectedType === 'auto') {
      result.error = 'NO_TYPE_DETECTED';
      result.message = 'No se pudo determinar el tipo de código';
      result.suggestion = 'Intenta nuevamente o ingresa el ID manualmente';
      await auditLogger.logValidation(result, context);
      return result;
    }

    // PASO 2: Validar formato
    const formatValidation = validateFormat(rawCode, detectedType);
    if (!formatValidation.valid) {
      result.error = 'INVALID_FORMAT';
      result.message = formatValidation.errors.join('; ');
      result.suggestion = 'El código está corrupto. Intenta nuevamente.';
      await auditLogger.logValidation(result, context);
      return result;
    }

    // PASO 3: Descodificar
    let decodedData = decodeCodeData(rawCode, detectedType);

    // PASO 4: Aplicar correcciones
    decodedData = applyErrorCorrection(decodedData, formatValidation);

    // PASO 5: Buscar en BD
    const student = await findStudent(decodedData.studentId);
    decodedData.name = student.name;
    decodedData.grade = student.grade;
    decodedData.level = student.level;
    decodedData.studentId = student.id;

    // PASO 6: Detectar duplicados
    const duplicateCheck = await checkDuplicates(student.id);
    if (duplicateCheck.isDuplicate) {
      result.status = 'warning';
      result.error = 'DUPLICATE_SCAN';
      result.message = `Código escaneado hace ${duplicateCheck.secondsAgo} segundos`;
      result.suggestion = 'Confirmar si deseas proceder';
      result.duplicateFlag = true;
      result.studentId = student.id;
      result.name = student.name;
      result.grade = student.grade;
      result.confidence = decodedData.confidence;
      result.lastScan = duplicateCheck.lastScan;
      await auditLogger.logValidation(result, context);
      return result;
    }

    // PASO 7: Retornar éxito
    result.status = 'success';
    result.studentId = student.id;
    result.name = student.name;
    result.level = student.level;
    result.grade = student.grade;
    result.confidence = decodedData.confidence;
    result.message = `✅ ${student.name} del ${student.grade}`;

    // Agregar a caché
    duplicateCache.add(student.id);

    // Log
    await auditLogger.logValidation(result, context);

    return result;
  } catch (error) {
    result.status = 'error';
    result.error = 'VALIDATION_ERROR';
    result.message = error.message;
    result.suggestion = 'Intenta nuevamente o ingresa el ID manualmente';

    console.error('Error en validación:', error);
    await auditLogger.logValidation(result, context);

    return result;
  } finally {
    result.processingTime = Date.now() - startTime;
  }
}

/**
 * Validar código con timeout de 500ms
 */
export async function validateCodeWithTimeout(rawCode, type, context, timeoutMs = 500) {
  return Promise.race([
    validateCode(rawCode, type, context),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('TIMEOUT: Validación excedió 500ms')),
        timeoutMs
      )
    ),
  ]).catch((error) => {
    return {
      status: 'error',
      error: error.message.includes('TIMEOUT') ? 'TIMEOUT' : 'VALIDATION_ERROR',
      message: error.message,
      suggestion: 'Intenta nuevamente',
      timestamp: new Date(),
      processingTime: timeoutMs,
    };
  });
}

/**
 * Obtener estadísticas de validación
 */
export async function getValidationStats() {
  return {
    cachedScans: duplicateCache.size(),
    cacheMaxSize: 100,
    retentionMs: 60000,
    auditLogs: await auditLogger.getStats(),
  };
}

export default {
  validateCode,
  validateCodeWithTimeout,
  detectCodeType,
  getValidationStats,
};
