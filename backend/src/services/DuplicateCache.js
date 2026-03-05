/**
 * SERVICIO DE CACHÉ PARA DETECCIÓN DE DUPLICADOS
 * Propósito: Mantener en RAM los últimos 100 escaneos con limpieza automática
 */

export class DuplicateCache {
  constructor(maxSize = 100, retentionMs = 60000) {
    this.maxSize = maxSize;
    this.retentionMs = retentionMs; // 60 segundos
    this.cache = new Map();
    this.cleanupInterval = null;

    // Iniciar limpieza automática cada 10 segundos
    this.startAutocleanup();
  }

  /**
   * Agregar un escaneo al caché
   */
  add(studentId) {
    this.cache.set(studentId, {
      studentId,
      timestamp: Date.now(),
    });

    // Si excede tamaño, eliminar el más antiguo
    if (this.cache.size > this.maxSize) {
      const oldest = Array.from(this.cache.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      )[0];
      this.cache.delete(oldest.studentId);
    }
  }

  /**
   * Verificar si un escaneo está duplicado
   */
  check(studentId) {
    return this.cache.get(studentId) || null;
  }

  /**
   * Obtener tamaño del caché
   */
  size() {
    return this.cache.size;
  }

  /**
   * Limpiar escaneos expirados
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [studentId, scan] of this.cache.entries()) {
      if (now - scan.timestamp > this.retentionMs) {
        this.cache.delete(studentId);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[DuplicateCache] Eliminados ${removed} escaneos expirados`);
    }
  }

  /**
   * Iniciar limpieza automática
   */
  startAutocleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10000); // Cada 10 segundos
  }

  /**
   * Detener limpieza automática
   */
  stopAutocleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const now = Date.now();
    const scans = Array.from(this.cache.values());

    return {
      totalScans: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: ((this.cache.size / this.maxSize) * 100).toFixed(2),
      averageAgeMs: scans.length > 0
        ? Math.floor(
            scans.reduce((sum, s) => sum + (now - s.timestamp), 0) / scans.length
          )
        : 0,
      oldestScanMs: scans.length > 0
        ? Math.min(...scans.map(s => now - s.timestamp))
        : 0,
      newestScanMs: scans.length > 0
        ? Math.max(...scans.map(s => now - s.timestamp))
        : 0,
    };
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    this.cache.clear();
  }
}

export default DuplicateCache;
