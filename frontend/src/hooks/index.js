import React, { useEffect, useState } from 'react'
import { socketService } from '../services/socket.js'
import { useQueueStore, useUIStore } from '../stores/index.js'

export { useQueue } from './useQueue.js'

/**
 * Hook para conectar y gestionar WebSocket (Unificado)
 */
export const useSocket = () => {
  useEffect(() => {
    const socket = socketService.connect()

    return () => {
      // Mantenemos conexión viva
    }
  }, [])

  return socketService
}

/**
 * Hook para cargar cola inicial (Sync con API)
 */
export const useQueueInit = () => {
  const { setQueue } = useQueueStore()
  const { setIsLoading } = useUIStore()

  useEffect(() => {
    const initQueue = async () => {
      setIsLoading(true)
      try {
        const { queueService } = await import('../services/api.js')
        const { data } = await queueService.getQueue()
        if (data.success && Array.isArray(data.data)) {
          setQueue(data.data)
        }
      } catch (err) {
        console.error('Error cargando cola:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initQueue()
  }, [setQueue, setIsLoading])
}

/**
 * Hook para sincronizar con servidor periódicamente
 */
export const useSyncData = (interval = 30000) => {
  useEffect(() => {
    const sync = async () => {
      try {
        if (socketService.isConnected()) {
          socketService.requestQueueUpdate()
        }
      } catch (err) {
        console.warn('Error sincronizando:', err)
      }
    }

    const syncInterval = setInterval(sync, interval)
    return () => clearInterval(syncInterval)
  }, [interval])
}

/**
 * Hook para detectar dispositivo móvil
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Hook para manejar orientación de pantalla
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    typeof window !== 'undefined'
      ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
      : 'portrait',
  )

  useEffect(() => {
    const handleChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    window.addEventListener('orientationchange', handleChange)
    window.addEventListener('resize', handleChange)

    return () => {
      window.removeEventListener('orientationchange', handleChange)
      window.removeEventListener('resize', handleChange)
    }
  }, [])

  return orientation
}

/**
 * Hook para manejar focus del documento
 */
export const useDocumentFocus = (onFocus, onBlur) => {
  useEffect(() => {
    const handleFocus = () => {
      onFocus?.()
      socketService.setUserActive(true)
    }

    const handleBlur = () => {
      onBlur?.()
      socketService.setUserActive(false)
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onFocus, onBlur])
}

/**
 * Hook para manejar teclado numérico
 */
export const useNumericKeyboard = (onSubmit) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.key) return

      // Solo números y Enter
      if (/^\d$/.test(e.key)) {
        setValue((prev) => prev + e.key)
      } else if (e.key === 'Enter') {
        onSubmit?.(value)
        setValue('')
      } else if (e.key === 'Backspace') {
        setValue((prev) => prev.slice(0, -1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSubmit, value])

  return { value, setValue, clear: () => setValue('') }
}

/**
 * Hook para manejar permiso de cámara
 */
export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const requestPermission = async () => {
    setIsChecking(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      return true
    } catch (err) {
      console.warn('Permiso de cámara denegado:', err.name)
      setHasPermission(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  return { hasPermission, isChecking, requestPermission }
}

/**
 * Hook para detectar red offline/online
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
