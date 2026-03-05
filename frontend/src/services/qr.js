import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useSettingsStore } from '../stores/index.js'

// Expresión regular para UUID V4 (el formato de los IDs en el backend)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Reproducir sonido de feedback
 */
export const playSound = async (type = 'success') => {
  const { soundEnabled } = useSettingsStore.getState()
  if (!soundEnabled) return

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    let frequency, duration
    switch (type) {
      case 'success':
        frequency = 800
        duration = 0.1
        break
      case 'error':
        frequency = 400
        duration = 0.3
        break
      case 'warning':
        frequency = 600
        duration = 0.2
        break
      default:
        frequency = 600
        duration = 0.1
    }

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (e) {
    console.warn('Error al reproducir sonido:', e)
  }
}

/**
 * Vibrar dispositivo
 */
export const vibrate = (pattern = 50) => {
  const { vibrationEnabled } = useSettingsStore.getState()
  if (vibrationEnabled && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/**
 * Servicio de QR usando html5-qrcode
 */
export const qrService = {
  /**
   * Validar código recibido
   * @param {string} rawCode 
   * @returns {Object} { id, type }
   */
  validateCode: (rawCode) => {
    if (!rawCode || typeof rawCode !== 'string') {
      return { valid: false, error: 'Código inválido o vacío' }
    }

    const code = rawCode.trim()

    // 1. Si es un UUID (estudiante de Base de Datos)
    if (UUID_REGEX.test(code)) {
      return { valid: true, id: code, type: 'qr' }
    }

    // 2. Si es un número (Carnet Legacy, DPI, Codigo Barras)
    if (/^\d+$/.test(code)) {
      return { valid: true, id: code, type: 'barcode' }
    }

    // 3. Fallback
    if (code.length > 3) {
      return { valid: true, id: code, type: 'unknown' }
    }

    return { valid: false, error: 'Formato no reconocido' }
  },

  /**
   * Generar texto para el ticket
   */
  generateTicketData: (student) => {
    return `ESTUDIANTE: ${student.name}\nGRADO: ${student.grade} ${student.section}\nFECHA: ${new Date().toLocaleDateString()}`
  },

  /**
   * Iniciar escaneo de QR
   */
  startScan: async (elementId, onDetected, onError, continuous = false) => {
    try {
      // Configuramos para leer solo QR y barras comunes reduciendo distracciones del motor
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13
      ];

      const html5QrCode = new Html5Qrcode(elementId, { formatsToSupport });

      let lastScannedCode = null
      let lastScannedTime = 0

      const onScanSuccess = (decodedText, decodedResult) => {
        const now = Date.now()
        // Evitar escaneo duplicado del mismo código en menos de 2 segundos en modo continuo
        if (continuous && decodedText === lastScannedCode && (now - lastScannedTime) < 2000) {
          return
        }

        lastScannedCode = decodedText
        lastScannedTime = now
        console.log("🔍 QR Detectado:", decodedText)
        onDetected(decodedText)

        if (!continuous) {
          html5QrCode.stop().catch(console.error)
        }
      }

      const onScanFailure = (error) => {
        // Ignorar errores de "no se detectó código" por frame
      }

      // Configuración de escaneo (FPS, Área y Resolución)
      const scanSettings = {
        fps: 25,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.9);
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
        disableFlip: false,
        // Forzamos resolución alta de forma segura vía videoConstraints
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }

      // Iniciamos con un solo objeto en el primer parámetro (facingMode)
      // El motor negociará la mejor resolución definida en scanSettings.videoConstraints
      await html5QrCode.start(
        { facingMode: "environment" },
        scanSettings,
        onScanSuccess,
        onScanFailure
      )

      return {
        stop: () => {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(console.error)
          }
        },
      }
    } catch (err) {
      console.error("Error al iniciar escáner html5-qrcode:", err)
      onError(err.message || 'Error al iniciar la cámara')
      throw err
    }
  },
}
