/**
 * GENERADOR DE CÓDIGOS QR Y BARRAS
 * Propósito: Generar códigos QR y barras con alta resolución
 */

import QRCode from 'qrcode';
import bwip from 'bwip-js';

/**
 * Generar código QR para un estudiante
 * @param {object} student - {id, name, grade, section}
 * @param {object} options - {size, errorCorrection, format}
 * @returns {Promise<{qrData, pngUrl, svgUrl}>}
 */
export async function generateQRCode(
  student,
  options = {}
) {
  try {
    const {
      size = 300, // píxeles
      errorCorrection = 'H', // High (30%)
      format = 'png', // 'png' o 'svg'
    } = options;

    // Crear datos JSON para el QR
    const qrData = {
      studentId: student.id,
      name: student.name,
      grade: student.grade,
      section: student.section || '',
      generated: new Date().toISOString(),
    };

    const qrDataString = JSON.stringify(qrData);

    // Opciones de QR
    const qrOptions = {
      errorCorrectionLevel: errorCorrection,
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: size,
      scale: 3, // Para mejorar resolución
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    // Generar PNG
    const pngDataUrl = await QRCode.toDataURL(qrDataString, qrOptions);

    // Generar SVG
    const svgOptions = { ...qrOptions, type: 'image/svg+xml' };
    const svgDataUrl = await QRCode.toString(qrDataString, svgOptions);

    return {
      qrData,
      pngUrl: pngDataUrl,
      svgUrl: svgDataUrl,
      studentId: student.id,
      name: student.name,
    };
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error(`No se pudo generar QR: ${error.message}`);
  }
}

/**
 * Generar barcode (Code128 o UPC)
 * @param {string|number} studentId - ID del estudiante
 * @param {object} options - {type, checksum}
 * @returns {Promise<{barcodeData, pngUrl}>}
 */
export async function generateBarcode(
  studentId,
  options = {}
) {
  try {
    const {
      type = 'code128', // 'code128', 'upc', 'ean13'
      width = 80,
      height = 60,
      includeText = true,
    } = options;

    const barcodeValue = calculateChecksum(studentId.toString(), type);

    // Opciones para bwip-js
    const bcOptions = {
      bcid: type,
      text: barcodeValue,
      scale: 3, // 3x para 300 DPI
      height: height * 3,
      includetext: includeText,
      textxalign: 'center',
      textsize: 10,
    };

    // Generar PNG
    const pngBuffer = await bwip.toBuffer(bcOptions);
    const pngDataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    return {
      barcodeValue,
      type,
      pngUrl: pngDataUrl,
      studentId,
      checksum: barcodeValue.slice(-1),
    };
  } catch (error) {
    console.error('Error generando barcode:', error);
    throw new Error(`No se pudo generar barcode: ${error.message}`);
  }
}

/**
 * Calcular checksum para barcode
 * Implementa checksum de Code128 y UPC
 */
function calculateChecksum(value, type = 'code128') {
  if (type === 'code128') {
    // Code128 checksum
    let sum = 104; // Código de inicio
    for (let i = 0; i < value.length; i++) {
      sum += (i + 1) * value.charCodeAt(i);
    }
    const checksum = (sum % 103).toString();
    return value + checksum;
  } else if (type === 'ean13' || type === 'upc') {
    // UPC/EAN checksum
    let sum = 0;
    const digits = value.padStart(12, '0').split('');
    for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return value + checksum;
  }

  return value;
}

/**
 * Generar batch de códigos QR/barras
 * @param {array} students - Array de estudiantes
 * @param {object} options - {includeQR, includeBarcode}
 * @returns {Promise<{students, directory}>}
 */
export async function generateCodeBatch(
  students,
  options = {}
) {
  try {
    const {
      includeQR = true,
      includeBarcode = true,
      groupByGrade = true,
    } = options;

    const results = [];
    const errors = [];

    console.log(`Generando ${students.length} códigos...`);

    for (const student of students) {
      try {
        const studentCodes = {
          id: student.id,
          name: student.name,
          grade: student.grade,
        };

        if (includeQR) {
          const qrResult = await generateQRCode(student);
          studentCodes.qr = qrResult;
        }

        if (includeBarcode) {
          const barcodeResult = await generateBarcode(student.id);
          studentCodes.barcode = barcodeResult;
        }

        results.push(studentCodes);
      } catch (error) {
        errors.push({
          studentId: student.id,
          name: student.name,
          error: error.message,
        });
      }
    }

    // Agrupar por grado si es necesario
    let grouped = results;
    if (groupByGrade) {
      grouped = {};
      for (const item of results) {
        if (!grouped[item.grade]) {
          grouped[item.grade] = [];
        }
        grouped[item.grade].push(item);
      }
    }

    console.log(`${results.length} códigos generados, ${errors.length} errores`);

    return {
      success: results.length,
      errors: errors.length,
      students: grouped,
      errorDetails: errors,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error en batch generation:', error);
    throw error;
  }
}

/**
 * Exportar códigos a PDF (requiere librería adicional)
 * Por ahora retornar datos en formato para descarga
 */
export async function exportToJSON(batchResult) {
  try {
    const json = JSON.stringify(batchResult, null, 2);
    return json;
  } catch (error) {
    console.error('Error exportando a JSON:', error);
    throw error;
  }
}

/**
 * Validar que un QR siga el formato esperado
 */
export function validateQRFormat(qrData) {
  try {
    if (typeof qrData === 'string') {
      qrData = JSON.parse(qrData);
    }

    // Campos requeridos
    const required = ['studentId', 'name', 'grade'];
    for (const field of required) {
      if (!qrData[field]) {
        return {
          valid: false,
          error: `Campo requerido faltante: ${field}`,
        };
      }
    }

    return {
      valid: true,
      data: qrData,
    };
  } catch (error) {
    return {
      valid: false,
      error: `QR inválido: ${error.message}`,
    };
  }
}

/**
 * Rotar QR y re-intentar decodificación
 * Útil para QR invertidos o rotados
 */
export async function rotateAndRetryQR(rawQRData, rotations = [0, 90, 180, 270]) {
  // Nota: Esta función es principalmente simbólica.
  // La decodificación real del QR requería parsearlo como imagen.
  // Por ahora, asumimos que el QR ya vino decodificado del dispositivo de lectura
  
  for (const rotation of rotations) {
    try {
      const validation = validateQRFormat(rawQRData);
      if (validation.valid) {
        return {
          valid: true,
          data: validation.data,
          rotation,
        };
      }
    } catch (error) {
      continue;
    }
  }

  return {
    valid: false,
    error: 'No se pudo decodificar el QR en ninguna rotación',
  };
}

export default {
  generateQRCode,
  generateBarcode,
  generateCodeBatch,
  validateQRFormat,
  rotateAndRetryQR,
  calculateChecksum,
};
