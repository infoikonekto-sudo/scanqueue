import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Componente principal de Scanner
 * UI minimalista para escaneo QR/barras
 */
export const ScannerComponent = ({
  onScan,
  isScanning,
  lastScanned,
  scanCount,
  error,
  cameraPermission,
  onCameraClick,
  videoRef, //  Nuevo prop
}) => {
  const [feedback, setFeedback] = React.useState(null)

  React.useEffect(() => {
    if (lastScanned) {
      setFeedback({ type: 'success', code: lastScanned })
      const timer = setTimeout(() => setFeedback(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastScanned])

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-50 relative pt-4 md:pt-8 pb-20">
      {/* Área de escaneo */}
      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-2xl px-4 md:px-8">

        {/* Título y Header Compacto (Desaparece un poco al escanear para dar espacio) */}
        {!isScanning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mt-2"
          >
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Monitor de Escaneo</h2>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-slate-800 leading-none tracking-tighter">
                  {scanCount}
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Escaneados
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Botón principal de escaneo o Viewport de Cámara */}
        <div className={`relative w-full ${isScanning ? 'flex-1 flex flex-col items-center justify-center mt-4' : 'mb-8'}`}>
          {/* Botón de Cámara (Oculto cuando escanea) */}
          <div className={`flex justify-center transition-all duration-300 ${isScanning ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
            <motion.button
              onClick={onCameraClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="
                w-full max-w-md aspect-[4/3] rounded-[40px] shadow-[0_20px_50px_rgba(37,99,235,0.15)]
                flex flex-col items-center justify-center gap-4
                transition-all duration-300 relative border border-blue-100
                bg-gradient-to-br from-blue-600 to-blue-800 text-white cursor-pointer overflow-hidden group
              "
            >
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
              <span className="text-7xl md:text-8xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                📸
              </span>
              <span className="text-sm font-black uppercase tracking-[0.2em] bg-white/10 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20">
                Activar Cámara
              </span>
            </motion.button>
          </div>

          {/* Viewport de Cámara (Siempre renderizado para el Ref, pero oculto si no escanea) */}
          <div className={`w-full flex-1 flex flex-col items-center justify-center max-w-md mx-auto relative transition-all duration-300 ${!isScanning ? 'opacity-0 h-0 hidden pointer-events-none' : 'opacity-100'}`}>

            {/* Contador Miniatura durante el escaneo */}
            <div className={`absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10 transition-opacity ${!isScanning && 'hidden'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest leading-none">Escaneados</p>
                <p className="text-xl font-black text-white leading-none mt-0.5">{scanCount}</p>
              </div>
            </div>

            <CameraViewport isActive={isScanning} videoRef={videoRef} />

            <p className={`text-slate-500 font-bold text-sm text-center mt-6 uppercase tracking-widest animate-pulse ${!isScanning && 'hidden'}`}>
              Apunta al código QR
            </p>
          </div>
        </div>

        {/* Feedback visual inmediato tipo Toast (Flotante) */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`
                fixed bottom-32 left-1/2 -translate-x-1/2 z-50
                px-8 py-4 rounded-full text-white font-black text-xl shadow-2xl tracking-wide
                flex items-center gap-4 whitespace-nowrap min-w-[280px] justify-center
                ${feedback.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'}
              `}
            >
              <span className="text-2xl bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">✓</span>
              <span>{feedback.code}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entrada manual refinada (Fija al fondo en móviles si escaneando, o normal si no) */}
        <div className={`w-full max-w-md bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 ${isScanning ? 'mt-auto' : ''}`}>
          <label className="block text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] text-center mb-4">
            O ingresar manualmente
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Escribe el código..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  onScan(e.target.value)
                  e.target.value = ''
                }
              }}
              className={`
                w-full px-6 py-4 border-2 rounded-2xl text-center font-black text-xl text-slate-800 bg-slate-50/50
                focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                transition-all duration-300 placeholder:text-slate-300 placeholder:font-bold
                ${error ? 'border-red-400 text-red-600 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-100'}
              `}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-bold mt-3 text-center bg-red-50 py-2 rounded-lg border border-red-100"
              >
                {error}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Viewport de cámara (Premium Redesign)
 */
export const CameraViewport = ({ isActive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4, type: "spring" }}
      className={`
        relative w-full aspect-[3/4] md:aspect-square bg-slate-900 
        rounded-[40px] md:rounded-[48px] overflow-hidden shadow-2xl
        border-4 border-slate-900 group
        ${!isActive && 'hidden'}
      `}
    >
      {/* Contenedor para html5-qrcode */}
      <div
        id="qr-reader"
        className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
      />

      {/* Overlay Oscuro General */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-[36px] md:rounded-[44px]" />

      {/* Máscara de Enfoque (Viewfinder Central) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-3/4 aspect-square max-w-[280px]">

          {/* Esquinas del escáner */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-3xl opacity-80" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-3xl opacity-80" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-3xl opacity-80" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-3xl opacity-80" />

          {/* Área central más brillante */}
          <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] rounded-3xl" />

          {/* Línea láser animada */}
          <motion.div
            animate={{
              top: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(52,211,153,0.7)] z-10 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}


/**
 * Indicador de estado
 */
export const StatusIndicator = ({ status = 'idle', message }) => {
  const colors = {
    idle: 'text-gray-500',
    scanning: 'text-secondary animate-pulse',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-warning',
  }

  return (
    <div className={`flex items-center gap-2 font-medium ${colors[status]}`}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      {message}
    </div>
  )
}

export default ScannerComponent
