import axios from 'axios'
import { useAuthStore } from '../stores/index.js'

// Instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a requests
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Login con usuario y contraseña
   */
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  /**
   * Logout
   */
  logout: () =>
    api.post('/auth/logout'),

  /**
   * Obtener usuario actual
   */
  getCurrentUser: () =>
    api.get('/auth/me'),

  /**
   * Registrar nuevo usuario
   */
  register: (data) =>
    api.post('/auth/register', data),

  /**
   * Refresh token
   */
  refreshToken: () =>
    api.post('/auth/refresh'),
}

/**
 * Servicio de escaneo
 */
export const scanService = {
  /**
   * Validar y registrar código escaneado
   */
  validateCode: (code, type = 'qr') =>
    api.post('/scan/validate', { code, type }),

  /**
   * Registrar estudiante en cola
   */
  registerStudent: (studentData) =>
    api.post('/scan/register', studentData),

  /**
   * Obtener historial de escaneos
   */
  getScanHistory: (params = {}) =>
    api.get('/scan/history', { params }),

  /**
   * Registrar un nuevo escaneo real (Persistente)
   */
  recordScan: (code, type = 'auto') =>
    api.post('/scan', { code, type }),

  /**
   * Verificar duplicado
   */
  checkDuplicate: (code) =>
    api.get(`/scan/check-duplicate/${code}`),
}

/**
 * Servicio de cola
 */
export const queueService = {
  /**
   * Obtener cola actual
   */
  getQueue: () =>
    api.get('/queue'),

  /**
   * Obtener cola con filtros
   */
  getQueueFiltered: (filters = {}) =>
    api.get('/queue', { params: filters }),

  /**
   * Procesar estudiante (marcar como completado)
   */
  processStudent: (studentId, data = {}) =>
    api.post(`/queue/${studentId}/process`, data),

  /**
   * Remover de cola
   */
  removeFromQueue: (studentId) =>
    api.delete(`/queue/${studentId}`),

  /**
   * Limpiar cola
   */
  clearQueue: () =>
    api.post('/queue/clear'),

  /**
   * Procesar transporte por nivel (marcar como despachado)
   */
  processTransport: (level) =>
    api.post('/queue/process-transport', { level }),

  /**
   * Obtener estadísticas
   */
  getStats: () =>
    api.get('/queue/stats'),
}

/**
 * Servicio de administración
 */
export const adminService = {
  /**
   * Obtener configuración
   */
  getConfig: () =>
    api.get('/admin/config'),

  /**
   * Actualizar configuración
   */
  updateConfig: (config) =>
    api.put('/admin/config', config),

  /**
   * Obtener usuarios
   */
  getUsers: () =>
    api.get('/admin/users'),

  /**
   * Crear usuario
   */
  createUser: (userData) =>
    api.post('/admin/users', userData),

  /**
   * Actualizar usuario
   */
  updateUser: (userId, userData) =>
    api.put(`/admin/users/${userId}`, userData),

  /**
   * Eliminar usuario
   */
  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`),

  /**
   * Obtener reportes
   */
  getReports: (filters = {}) =>
    api.get('/admin/reports', { params: filters }),

  /**
   * Exportar datos
   */
  exportData: (format = 'csv') =>
    api.get(`/admin/export?format=${format}`),
}

export default api
