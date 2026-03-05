/**
 * Servicio de exportación de datos
 */

export const exportService = {
  /**
   * Exportar como CSV
   */
  exportAsCSV: (data, filename = 'export.csv') => {
    const headers = Object.keys(data[0] || {})
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escapar comillas
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value
          })
          .join(','),
      ),
    ].join('\n')

    downloadFile(csv, filename, 'text/csv')
  },

  /**
   * Exportar como JSON
   */
  exportAsJSON: (data, filename = 'export.json') => {
    const json = JSON.stringify(data, null, 2)
    downloadFile(json, filename, 'application/json')
  },

  /**
   * Exportar como Excel (básico)
   */
  exportAsExcel: (data, filename = 'export.xlsx') => {
    // Para una versión real, usaría una librería como xlsx
    exportService.exportAsCSV(data, filename)
  },

  /**
   * Exportar como PDF
   */
  exportAsPDF: (data, filename = 'export.pdf') => {
    // Para una versión real, usaría una librería como jsPDF
    console.log('PDF export no implementado. Usar librería jsPDF')
  },
}

/**
 * Función auxiliar para descargar archivo
 */
const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default exportService
