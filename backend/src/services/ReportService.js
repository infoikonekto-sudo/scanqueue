import PDFDocument from 'pdfkit';
import * as ScanModel from '../models/Scan.js';

/**
 * Genera reporte PDF de escaneos
 */
export async function generateScanReport(startDate, endDate) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Configurar headers
      doc.fontSize(20).text('Reporte de Asistencia - ScanQueue', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Periodo: ${startDate} a ${endDate}`, { align: 'center' });
      doc.moveDown(2);

      // Tabla de datos
      doc.fontSize(10);
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 150;
      const col3 = 300;
      const col4 = 450;

      // Headers
      doc.text('Estudiante', col1, tableTop);
      doc.text('Grado', col2, tableTop);
      doc.text('Fecha', col3, tableTop);
      doc.text('Estado', col4, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      return {
        doc,
        resolve,
        reject,
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Genera reporte de asistencia por ruta
 */
export async function generateTransportReport(routeId, date) {
  try {
    const scans = await ScanModel.getScansByDateRange(
      `${date} 00:00:00`,
      `${date} 23:59:59`
    );

    const filteredScans = scans.filter((s) => s.status === 'transport');

    return {
      date,
      routeId,
      totalScans: filteredScans.length,
      scans: filteredScans,
    };
  } catch (error) {
    console.error('Error generando reporte de transporte:', error);
    throw error;
  }
}

/**
 * Exporta datos a JSON
 */
export async function exportToJSON(data, filename) {
  return {
    filename,
    data: JSON.stringify(data, null, 2),
    mimeType: 'application/json',
  };
}

export default {
  generateScanReport,
  generateTransportReport,
  exportToJSON,
};
