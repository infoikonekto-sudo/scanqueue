import { create } from 'zustand'

/**
 * Store de autenticación
 * Gestiona el estado de login, token, usuario actual
 */
export const useAuthStore = create((set) => {
  // Intentar restaurar sesión desde localStorage
  const savedAuth = localStorage.getItem('auth')
  const initialAuth = savedAuth ? JSON.parse(savedAuth) : null

  return {
    user: initialAuth?.user || null,
    token: initialAuth?.token || null,
    isAuthenticated: !!initialAuth?.token,

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token, isAuthenticated: !!token }),

    login: (user, token) => {
      set({ user, token, isAuthenticated: true })
      localStorage.setItem('auth', JSON.stringify({ user, token }))
    },

    logout: () => {
      set({ user: null, token: null, isAuthenticated: false })
      localStorage.removeItem('auth')
    },

    clearAuth: () => {
      set({ user: null, token: null, isAuthenticated: false })
    },
  }
})

/**
 * Store de escaneo
 * Gestiona QR escaneados, validación, feedback
 */
export const useScanStore = create((set, get) => ({
  scannedCodes: [],      // Códigos escaneados en sesión
  lastScanned: null,     // Último código escaneado
  isScanning: false,     // Estado de escaneo activo
  scanCount: 0,          // Contador de escaneos
  recentScans: [],       // Buffer de últimos 30s para detectar duplicados

  // Agregar código escaneado
  addScannedCode: (code, metadata = {}) => {
    const timestamp = Date.now()
    const scan = { code, metadata, timestamp, id: `${code}-${timestamp}` }

    set((state) => {
      // Limpiar scans más antiguos de 30 segundos
      const thirtySecondsAgo = timestamp - 30000
      const filtered = state.recentScans.filter((s) => s.timestamp > thirtySecondsAgo)

      return {
        scannedCodes: [...state.scannedCodes, scan],
        lastScanned: code,
        scanCount: state.scanCount + 1,
        recentScans: [...filtered, scan],
      }
    })
  },

  // Verificar si es duplicado reciente
  isDuplicate: (code) => {
    const { recentScans } = get()
    const thirtySecondsAgo = Date.now() - 30000
    return recentScans.some(
      (s) => s.code === code && s.timestamp > thirtySecondsAgo,
    )
  },

  // Limpiar estado
  reset: () =>
    set({
      scannedCodes: [],
      lastScanned: null,
      scanCount: 0,
      recentScans: [],
      isScanning: false,
    }),

  setIsScanning: (isScanning) => set({ isScanning }),
  clearRecentScans: () => set({ recentScans: [] }),
}))

/**
 * Store de cola
 * Gestiona estudiantes en cola, estado en tiempo real
 */
export const useQueueStore = create((set) => ({
  queue: [],             // Array de estudiantes en cola
  currentStudent: null,  // Estudiante actual siendo procesado
  totalScanned: 0,       // Total escaneado en sesión

  addToQueue: (student) =>
    set((state) => {
      // Filtrar el estudiante si ya existe (moverlo al final/más reciente)
      const filteredQueue = state.queue.filter(s => s.id !== student.id);

      return {
        queue: [...filteredQueue, student],
        totalScanned: state.totalScanned + 1,
      };
    }),

  removeFromQueue: (studentId) =>
    set((state) => ({
      queue: state.queue.filter((s) => s.id !== studentId),
    })),

  setCurrentStudent: (student) => set({ currentStudent: student }),

  updateStudent: (studentId, updates) =>
    set((state) => ({
      queue: state.queue.map((s) =>
        s.id === studentId ? { ...s, ...updates } : s,
      ),
    })),

  clearQueue: () => set({ queue: [], currentStudent: null }),

  setQueue: (queue) => set({ queue }),
}))

/**
 * Store de UI
 * Gestiona estado de interfaz, notificaciones, modales
 */
export const useUIStore = create((set) => ({
  activeTab: 'scan',     // Pestaña activa: scan, queue, admin
  isMobileMenuOpen: false,
  notification: null,    // { type, message, id }
  isLoading: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleMobileMenu: () =>
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    })),

  // Mostrar notificación (auto-destruye después de 3s)
  showNotification: (type, message) => {
    const id = Date.now()
    set({ notification: { type, message, id } })

    setTimeout(() => {
      set((state) =>
        state.notification?.id === id ? { notification: null } : state,
      )
    }, 3000)
  },

  clearNotification: () => set({ notification: null }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

/**
 * Store de configuración
 * Gestiona ajustes de la app (volumen, sonido, etc)
 */
export const useSettingsStore = create((set) => {
  // Restaurar desde localStorage
  const saved = localStorage.getItem('settings')
  const initialSettings = saved
    ? JSON.parse(saved)
    : {
      soundEnabled: true,
      vibrationEnabled: true,
      darkMode: false,
      schoolName: 'Colegio',
      autoSync: true,
    }

  return {
    ...initialSettings,

    updateSettings: (updates) =>
      set((state) => {
        const newSettings = { ...state, ...updates }
        localStorage.setItem('settings', JSON.stringify(newSettings))
        return newSettings
      }),

    resetSettings: () => {
      const defaults = {
        soundEnabled: true,
        vibrationEnabled: true,
        darkMode: false,
        schoolName: 'Colegio',
        autoSync: true,
      }
      localStorage.setItem('settings', JSON.stringify(defaults))
      set(defaults)
    },
  }
})
