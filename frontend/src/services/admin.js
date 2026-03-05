import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Headers por defecto
const getHeaders = () => {
  const auth = localStorage.getItem('auth')
  const token = auth ? JSON.parse(auth).token : null
  return {
    Authorization: `Bearer ${token}`,
  }
}

// === ESTUDIANTES ===
export const studentService = {
  list: (params) =>
    axios.get(`${API_BASE_URL}/students`, {
      headers: getHeaders(),
      params
    }),

  get: (id) =>
    axios.get(`${API_BASE_URL}/students/${id}`, {
      headers: getHeaders()
    }),

  create: (data) =>
    axios.post(`${API_BASE_URL}/students`, data, {
      headers: getHeaders()
    }),

  update: (id, data) =>
    axios.put(`${API_BASE_URL}/students/${id}`, data, {
      headers: getHeaders()
    }),

  delete: (id) =>
    axios.delete(`${API_BASE_URL}/students/${id}`, {
      headers: getHeaders()
    }),

  search: (query) =>
    axios.get(`${API_BASE_URL}/students/search/${query}`, {
      headers: getHeaders()
    }),

  getByGrade: (grade) =>
    axios.get(`${API_BASE_URL}/students/grade/${grade}`, {
      headers: getHeaders()
    }),

  uploadPhoto: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return axios.post(`${API_BASE_URL}/students/${id}/photo`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    })
  },

  bulkCreate: (students) =>
    axios.post(`${API_BASE_URL}/students/bulk`, { students }, {
      headers: getHeaders(),
      timeout: 120000, // 120s para importaciones grandes
    }),

  bulkUpsert: (students) =>
    axios.post(`${API_BASE_URL}/students/bulk-upsert`, { students }, {
      headers: getHeaders(),
      timeout: 120000, // 120s para importaciones grandes
    }),

  deleteAll: () =>
    axios.delete(`${API_BASE_URL}/students/all`, {
      headers: getHeaders()
    }),
}

// === RUTAS ===
export const routeService = {
  list: () =>
    axios.get(`${API_BASE_URL}/routes`, {
      headers: getHeaders()
    }),

  get: (id) =>
    axios.get(`${API_BASE_URL}/routes/${id}`, {
      headers: getHeaders()
    }),

  create: (data) =>
    axios.post(`${API_BASE_URL}/routes`, data, {
      headers: getHeaders()
    }),

  update: (id, data) =>
    axios.put(`${API_BASE_URL}/routes/${id}`, data, {
      headers: getHeaders()
    }),

  delete: (id) =>
    axios.delete(`${API_BASE_URL}/routes/${id}`, {
      headers: getHeaders()
    }),

  getStudents: (id) =>
    axios.get(`${API_BASE_URL}/routes/${id}/students`, {
      headers: getHeaders()
    }),

  getScans: (id) =>
    axios.get(`${API_BASE_URL}/routes/${id}/scans`, {
      headers: getHeaders()
    }),
}

// === QR ===
export const qrService = {
  generate: (studentId) =>
    axios.post(`${API_BASE_URL}/qr/generate`, { studentId }, {
      headers: getHeaders()
    }),

  batch: (studentIds) =>
    axios.post(`${API_BASE_URL}/qr/batch`, { studentIds }, {
      headers: getHeaders()
    }),

  get: (studentId) =>
    axios.get(`${API_BASE_URL}/qr/${studentId}`, {
      headers: getHeaders()
    }),
}

// === ESCANEOS ===
export const scanService = {
  get: (id) =>
    axios.get(`${API_BASE_URL}/scans/${id}`, {
      headers: getHeaders()
    }),

  list: (params) =>
    axios.get(`${API_BASE_URL}/scans`, {
      headers: getHeaders(),
      params
    }),

  create: (data) =>
    axios.post(`${API_BASE_URL}/scan`, data, {
      headers: getHeaders()
    }),

  updateStatus: (id, status) =>
    axios.put(`${API_BASE_URL}/scan/${id}/status`, { status }, {
      headers: getHeaders()
    }),

  markTransport: (id) =>
    axios.put(`${API_BASE_URL}/scan/${id}/mark-transport`, {}, {
      headers: getHeaders()
    }),

  delete: (id) =>
    axios.delete(`${API_BASE_URL}/scan/${id}`, {
      headers: getHeaders()
    }),

  queue: () =>
    axios.get(`${API_BASE_URL}/scan/queue`, {
      headers: getHeaders()
    }),

  history: (params) =>
    axios.get(`${API_BASE_URL}/scan/history`, {
      headers: getHeaders(),
      params
    }),
}

// === DASHBOARD ===
export const dashboardService = {
  stats: () =>
    axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders()
    }),

  today: () =>
    axios.get(`${API_BASE_URL}/dashboard/today`, {
      headers: getHeaders()
    }),

  attendance: (params) =>
    axios.get(`${API_BASE_URL}/dashboard/attendance`, {
      headers: getHeaders(),
      params
    }),
}

// === REPORTES ===
export const reportService = {
  exportPDF: (params) =>
    axios.post(`${API_BASE_URL}/reports/pdf`, params, {
      headers: getHeaders(),
      responseType: 'blob'
    }),

  exportExcel: (params) =>
    axios.post(`${API_BASE_URL}/reports/excel`, params, {
      headers: getHeaders(),
      responseType: 'blob'
    }),

  exportCSV: (params) =>
    axios.post(`${API_BASE_URL}/reports/csv`, params, {
      headers: getHeaders(),
      responseType: 'blob'
    }),
}

// === USUARIOS/CONFIGURACIÓN ===
export const adminService = {
  listUsers: () =>
    axios.get(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders()
    }),

  createUser: (data) =>
    axios.post(`${API_BASE_URL}/admin/users`, data, {
      headers: getHeaders()
    }),

  updateUser: (id, data) =>
    axios.put(`${API_BASE_URL}/admin/users/${id}`, data, {
      headers: getHeaders()
    }),

  deleteUser: (id) =>
    axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getHeaders()
    }),

  resetPassword: (userId, newPassword) =>
    axios.post(`${API_BASE_URL}/admin/users/${userId}/reset-password`,
      { newPassword },
      { headers: getHeaders() }
    ),

  getSettings: () =>
    axios.get(`${API_BASE_URL}/admin/settings`, {
      headers: getHeaders()
    }),

  updateSettings: (data) =>
    axios.put(`${API_BASE_URL}/admin/settings`, data, {
      headers: getHeaders()
    }),
}

export default {
  studentService,
  routeService,
  qrService,
  scanService,
  dashboardService,
  reportService,
  adminService,
}
