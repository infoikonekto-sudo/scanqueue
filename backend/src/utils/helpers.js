/**
 * Utilities y helpers para ScanQueue
 */

/**
 * Formatea fecha en formato legible
 */
export function formatDate(date) {
  return new Date(date).toLocaleString('es-ES');
}

/**
 * Genera código único
 */
export function generateUniqueCode(prefix = 'CODE') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Valida formato de email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calcula porcentaje
 */
export function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(2);
}

/**
 * Agrupa array de objetos por propiedad
 */
export function groupBy(array, property) {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Logger simple
 */
export function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logString = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console.log(logString, data);
  } else {
    console.log(logString);
  }
}

/**
 * Calcula distancia de Levenshtein entre dos strings
 * Utilizado para detección de códigos similares (corrección de errores)
 * Retorna el número mínimo de ediciones requeridas
 */
export function calculateLevenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return track[str2.length][str1.length];
}

export default {
  formatDate,
  generateUniqueCode,
  isValidEmail,
  calculatePercentage,
  groupBy,
  log,
  calculateLevenshteinDistance,
};
