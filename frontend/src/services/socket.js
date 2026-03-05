import { io } from 'socket.io-client'
import { useQueueStore, useScanStore, useUIStore, useSettingsStore } from '../stores/index.js'

let socket = null

/**
 * Servicio de WebSocket con Socket.io
 * Maneja comunicación en tiempo real con el servidor
 */
export const socketService = {
  /**
   * Conectar al servidor WebSocket
   * NOTA: El servidor backend corre en el mismo origen que la API.
   * Se alinea el puerto con VITE_API_URL o fallback a :3001 (mismo que el backend)
   */
  connect: () => {
    if (socket) {
      if (!socket.connected) {
        socket.connect()
      }
      return socket
    }

    // Alineado con el puerto 5000 que usa el backend realmente
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace('/api', '')

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
    })

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('✓ Conectado a servidor')
      useUIStore.getState().showNotification('success', 'Conectado')
    })

    socket.on('disconnect', () => {
      console.log('✗ Desconectado del servidor')
      useUIStore.getState().showNotification('warning', 'Desconectado')
    })

    socket.on('error', (error) => {
      console.error('Error WebSocket:', error)
      useUIStore.getState().showNotification('error', 'Error de conexión')
    })

    // ─── Error 7 corregido: nombres de eventos alineados con el servidor ──────
    // El servidor emite: 'queue:init', 'queue:update', 'stats:update', 'scan:new'

    // Limpiar listeners previos para evitar duplicados al reconectar
    socket.off('queue:init');
    socket.off('queue:update');
    socket.off('scan:new');
    socket.off('student:completed');
    socket.off('student:transport');
    socket.off('stats:update');
    socket.off('queue:refresh');

    // Inicialización de cola completa desde servidor
    socket.on('queue:init', ({ queue, completed, transport }) => {
      useQueueStore.getState().setQueue(queue)
    })

    // Actualización de la cola (nuevo escaneo o cambio de estado)
    socket.on('queue:update', (queue) => {
      if (Array.isArray(queue)) {
        useQueueStore.getState().setQueue(queue)
      }
    })

    // Nuevo escaneo recibido
    socket.on('scan:new', (student) => {
      useQueueStore.getState().addToQueue(student)
      useUIStore.getState().showNotification('success', `${student.name} agregado`)
      useScanStore.getState().addScannedCode(student.id, student)
      playSound('success')
      vibrate()
      announceStudent(student.name) // ¡Nuevo! TTS del nombre
    })

    // Estudiante completado
    socket.on('student:completed', ({ studentId }) => {
      useQueueStore.getState().removeFromQueue(studentId)
    })

    // Estudiante asignado a transporte
    socket.on('student:transport', ({ studentId }) => {
      useQueueStore.getState().removeFromQueue(studentId)
    })

    // Actualización de estadísticas
    socket.on('stats:update', (stats) => {
      console.log('stats:update:', stats)
    })

    // También se mantiene compatibilidad con queue:refresh
    socket.on('queue:refresh', ({ queue }) => {
      if (queue) useQueueStore.getState().setQueue(queue)
    })

    return socket
  },

  /**
   * Desconectar del servidor
   */
  disconnect: () => {
    if (socket?.connected) {
      socket.disconnect()
    }
  },

  /**
   * Enviar código escaneado al servidor
   */
  emitScan: (code, type = 'qr') => {
    if (!socket?.connected) {
      console.warn('Socket no conectado')
      return
    }
    socket.emit('scan:new', { code, type, timestamp: Date.now() })
  },

  /**
   * Solicitar actualización de cola
   */
  requestQueueUpdate: () => {
    if (socket?.connected) {
      socket.emit('queue:refresh')
    }
  },

  /**
   * Notificar al servidor que usuario está en página de escaneo
   */
  setUserActive: (status = true) => {
    if (socket?.connected) {
      socket.emit('user:active', { active: status, page: 'scanner' })
    }
  },

  /**
   * Obtener estado de conexión
   */
  isConnected: () => socket?.connected || false,

  /**
   * Obtener instancia de socket
   */
  getSocket: () => socket,
}

// Referencia global para el AudioContext
let globalAudioContext = null

/**
 * Reproducir sonido de feedback
 * Error 8 corregido: soundEnabled está en useSettingsStore, no en useUIStore
 */
export const playSound = async (type = 'success') => {
  const { soundEnabled } = useSettingsStore.getState()
  if (!soundEnabled) return

  try {
    // Inicializar o reanudar el AudioContext global
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    // Si el context está suspendido (por autoplay policy), intentar reanudarlo
    if (globalAudioContext.state === 'suspended') {
      try {
        await globalAudioContext.resume()
      } catch (e) {
        // Silently return si el usuario aún no ha hecho el gesto (clic) para evitar spam en consola
        return;
      }
    }

    const now = globalAudioContext.currentTime

    let frequency, duration
    switch (type) {
      case 'success':
        frequency = 800
        duration = 0.1
        break
      case 'error':
        frequency = 400
        duration = 0.2
        break
      case 'warning':
        frequency = 600
        duration = 0.15
        break
      default:
        frequency = 600
        duration = 0.1
    }

    const osc = globalAudioContext.createOscillator()
    const gain = globalAudioContext.createGain()

    osc.connect(gain)
    gain.connect(globalAudioContext.destination)

    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.start(now)
    osc.stop(now + duration)
  } catch (err) {
    console.warn('No se pudo reproducir sonido:', err)
  }
}

// Escuchador de primer gesto para reanudar audio proactivamente
if (typeof window !== 'undefined') {
  const resumeAudio = () => {
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
      globalAudioContext.resume()
    }
    window.removeEventListener('click', resumeAudio)
    window.removeEventListener('keydown', resumeAudio)
    window.removeEventListener('touchstart', resumeAudio)
  }
  window.addEventListener('click', resumeAudio)
  window.addEventListener('keydown', resumeAudio)
  window.addEventListener('touchstart', resumeAudio)
}

/**
 * Vibrar dispositivo
 * Error 8 corregido: vibrationEnabled está en useSettingsStore, no en useUIStore
 */
export const vibrate = (pattern = 50) => {
  const { vibrationEnabled } = useSettingsStore.getState()
  if (!vibrationEnabled || !navigator.vibrate) return

  try {
    navigator.vibrate(pattern)
  } catch (err) {
    console.warn('Vibración no disponible:', err)
  }
}

/**
 * Anuncio por Voz (Text-to-Speech)
 * Lee el nombre del estudiante en voz alta cuando llega.
 */
export const announceStudent = (name) => {
  if (!('speechSynthesis' in window)) return;
  // Solo anunciar si el sonido está habilitado
  const { soundEnabled } = useSettingsStore.getState()
  if (!soundEnabled) return;

  try {
    // Acomodar formato si viene como "Apellidos, Nombres" -> "Nombres Apellidos"
    let spokenName = name;
    if (name.includes(',')) {
      const parts = name.split(',');
      spokenName = `${parts[1].trim()} ${parts[0].trim()}`;
    }

    // Cancelar cualquier anuncio previo para estar siempre al día sin largas colas
    window.speechSynthesis.cancel();

    // Crear un mensaje natural
    const utterance = new SpeechSynthesisUtterance(`Llamando a ${spokenName}`);
    utterance.lang = 'es-ES'; // Idioma español
    utterance.rate = 0.85;     // Velocidad más calmada
    utterance.pitch = 1.1;    // Tono ligeramente más agudo/claro

    // Seleccionar una voz en español si está disponible para sonar más natural
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS no disponible o bloqueado:', err);
  }
}
