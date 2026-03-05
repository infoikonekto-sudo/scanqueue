/**
 * Utilidades para validación
 */

export const validators = {
  /**
   * Validar email
   */
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validar cédula/ID (formato básico)
   */
  isStudentID: (id) => {
    if (!id || typeof id !== 'string') return false
    // Aceptar números y letras (8-15 caracteres)
    return /^[A-Z0-9]{5,15}$/i.test(id.toUpperCase())
  },

  /**
   * Validar código (QR o barcode)
   */
  isValidCode: (code) => {
    if (!code || typeof code !== 'string') return false
    if (code.length < 3 || code.length > 500) return false
    const validPattern = /^[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=]+$/
    return validPattern.test(code)
  },

  /**
   * Validar nombre
   */
  isValidName: (name) => {
    if (!name || typeof name !== 'string') return false
    return name.trim().length >= 2
  },

  /**
   * Validar grado/curso
   */
  isValidGrade: (grade) => {
    const validGrades = ['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    return validGrades.includes(grade)
  }
}

/**
 * Utilidades de formato
 */
export const formatters = {
  /**
   * Formatear tiempo elapsed
   */
  formatTime: (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  },

  /**
   * Formatear número con separadores
   */
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  /**
   * Formatear porcentaje
   */
  formatPercentage: (value, total) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  },

  /**
   * Truncar texto
   */
  truncate: (text, length = 30) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }
}

/**
 * Utilidades de almacenamiento
 */
export const storage = {
  /**
   * Guardar en localStorage
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error('Error guardando en localStorage:', err)
      return false
    }
  },

  /**
   * Obtener de localStorage
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (err) {
      console.error('Error obteniendo de localStorage:', err)
      return defaultValue
    }
  },

  /**
   * Eliminar de localStorage
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (err) {
      console.error('Error eliminando de localStorage:', err)
      return false
    }
  },

  /**
   * Limpiar todo
   */
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (err) {
      console.error('Error limpiando localStorage:', err)
      return false
    }
  }
}

/**
 * Utilidades varias
 */
export const utils = {
  /**
   * Generar ID único
   */
  generateId: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Esperar (delay)
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Copiar al portapapeles
   */
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Error copiando:', err)
      return false
    }
  },

  /**
   * Detectar navegador
   */
  getBrowser: () => {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Edge')) return 'Edge'
    return 'Unknown'
  },

  /**
   * Detectar SO
   */
  getOS: () => {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
    return 'Unknown'
  },

  /**
   * Es dispositivo móvil
   */
  isMobileDevice: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  }
}
