import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useScanStore, useUIStore, useAuthStore } from '../stores/index.js'
import { qrService, playSound, vibrate } from '../services/qr.js'
import { socketService } from '../services/socket.js'
import { scanService } from '../services/api.js'
import { useCameraPermission, useNumericKeyboard } from '../hooks/index.js'
import { ScannerComponent, CameraViewport, StatusIndicator } from '../components/Scanner/ScannerComponent.jsx'
import { Button, Toast, Input } from '../components/common/index.jsx'

/**
 * Página de Escaneo
 * Componente principal para escaneo de QR/barras
 */
export const ScannerPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addScannedCode, isDuplicate, isScanning, setIsScanning, scanCount } = useScanStore()
  const { showNotification, notification } = useUIStore()

  const [manualInput, setManualInput] = React.useState('')
  const [error, setError] = React.useState(null)
  const [lastScanned, setLastScanned] = React.useState(null)
  const [isValidating, setIsValidating] = React.useState(false)

  const { hasPermission, isChecking, requestPermission } = useCameraPermission()
  const videoRef = React.useRef(null)
  const scannerRef = React.useRef(null)

  // Verificar autenticación
  React.useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  /**
   * Manejar código escaneado
   */
  const handleScan = async (code) => {
    if (!code || code.trim().length === 0) return

    setError(null)
    setIsValidating(true)

    try {
      // Validar formato
      const { valid, error: formatError, type } = qrService.validateCode(code)
      if (!valid) {
        setError(formatError)
        playSound('error')
        vibrate([100, 50, 100])
        showNotification('error', formatError)
        setIsValidating(false)
        return
      }

      // Verificar duplicado reciente
      if (isDuplicate(code)) {
        playSound('warning')
        vibrate([100])
        showNotification('warning', '⚠ Código duplicado (últimos 30s)')
        setIsValidating(false)
        return
      }

      // Validar y REGISTRAR con servidor (Ahora es una sola llamada persistente)
      const response = await scanService.recordScan(code, type)

      if (response.data.success) {
        // Éxito: recordScan ya devuelve los datos del estudiante
        const studentData = response.data;
        addScannedCode(code, studentData)
        setLastScanned(code)

        // NOTA: Ya no emitimos socket manualmente aquí porque el Backend 
        // emite automáticamente en recordScan para todas las pantallas.

        // Feedback positivo
        playSound('success')
        vibrate(50)
        showNotification('success', `✓ ${studentData.name || code}`)

        setManualInput('')
        setError(null)
      } else {
        // Código no válido
        setError(response.data.message || 'Código no válido')
        playSound('error')
        vibrate([100, 50, 100])
        showNotification('error', response.data.message || 'Código no válido')
      }
    } catch (err) {
      console.error('Error validando código:', err)
      const message = err.response?.data?.message || 'Error de conexión'
      setError(message)
      playSound('error')
      vibrate([100, 50, 100])
      showNotification('error', message)
    } finally {
      setIsValidating(false)
      // No desactivamos el escaneo automáticamente para permitir modo continuo
    }
  }

  /**
   * Iniciar escaneo por cámara
   */
  const handleCameraClick = async () => {
    setError(null)

    // Si ya tenemos permiso, iniciar directamente
    if (hasPermission === true) {
      startCamera()
      return
    }

    // Solicitar permiso explícitamente
    const granted = await requestPermission()
    if (!granted) {
      showNotification('error', '⚠️ Permiso de cámara denegado. Ve a Configuración > Privacidad > Cámara para activarlo.')
      return
    }

    startCamera()
  }
  const startCamera = async () => {
    setIsScanning(true)
    try {
      // Usamos el ID del div en su lugar
      const scanner = await qrService.startScan(
        "qr-reader",
        (code) => { handleScan(code) },
        (err) => {
          setIsScanning(false)
          setError(err)
          showNotification('error', err)
        },
        true // Continuo
      )
      scannerRef.current = scanner
    } catch (err) {
      setIsScanning(false)
      setError(err.message)
      showNotification('error', 'Error al iniciar la cámara')
    }
  }

  // Desmontar cámara al salir del componente
  React.useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
      }
      setIsScanning(false)
    }
  }, [setIsScanning])


  /**
   * Manejar teclas
   */
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && manualInput.trim()) {
        handleScan(manualInput)
      } else if (/^\d$/.test(e.key) || /^[a-zA-Z]$/.test(e.key)) {
        // Agregar carácter automáticamente
        if (document.activeElement.tagName !== 'INPUT') {
          setManualInput((prev) => prev + e.key)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [manualInput])

  // Ya no bloqueamos la pantalla verificando permisos al inicio
  // Los permisos se piden cuando el usuario hace click en la cámara

  return (
    <div className="w-full min-h-screen bg-white">
      <ScannerComponent
        onScan={handleScan}
        isScanning={isScanning}
        lastScanned={lastScanned}
        scanCount={scanCount}
        error={error}
        cameraPermission={hasPermission}
        onCameraClick={handleCameraClick}
        videoRef={videoRef}
      />

      {/* Toast Notification */}
      {notification && (
        <Toast
          notification={notification}
          onClose={() => { }}
        />
      )}
    </div>
  )
}

export default ScannerPage
