/**
 * Servicio de datos locales
 * Buffer local para datos en caso de desconexión
 */

import { storage } from '../utils/index.js'

export const localDataService = {
  /**
   * Guardar escaneos en buffer local
   */
  addLocalScan: (scan) => {
    const scans = storage.get('local_scans', [])
    scans.push({
      ...scan,
      localTimestamp: Date.now(),
      synced: false,
    })
    // Mantener máximo 100 scans locales
    if (scans.length > 100) {
      scans.shift()
    }
    storage.set('local_scans', scans)
  },

  /**
   * Obtener escaneos no sincronizados
   */
  getUnsyncedScans: () => {
    const scans = storage.get('local_scans', [])
    return scans.filter((s) => !s.synced)
  },

  /**
   * Marcar como sincronizado
   */
  markAsSynced: (scanId) => {
    const scans = storage.get('local_scans', [])
    const scan = scans.find((s) => s.id === scanId)
    if (scan) {
      scan.synced = true
      storage.set('local_scans', scans)
    }
  },

  /**
   * Limpiar buffer local
   */
  clearLocalScans: () => {
    storage.remove('local_scans')
  },

  /**
   * Obtener cola local caché
   */
  getCachedQueue: () => {
    return storage.get('cached_queue', [])
  },

  /**
   * Guardar cola en caché
   */
  cacheQueue: (queue) => {
    storage.set('cached_queue', queue)
  },

  /**
   * Obtener estadísticas caché
   */
  getCachedStats: () => {
    return storage.get('cached_stats', {})
  },

  /**
   * Guardar estadísticas en caché
   */
  cacheStats: (stats) => {
    storage.set('cached_stats', stats)
  },
}

export default localDataService
