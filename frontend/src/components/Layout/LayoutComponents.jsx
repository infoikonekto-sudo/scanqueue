import React from 'react'
import { useUIStore } from '../../stores/index.js'
import { Tabs, Toast } from '../common/index.jsx'

/**
 * Layout principal con navegación superior
 */
export const MainLayout = ({ children, activeTab, onTabChange }) => {
  const { notification } = useUIStore()

  const tabs = [
    { id: 'scanner', label: '📷 Escanear' },
    { id: 'queue', label: '📋 Cola' },
    { id: 'stats', label: '📊 Estadísticas' },
    { id: 'admin', label: '⚙️ Admin' },
  ]

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-subtle sticky top-0 z-40 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">ScanQueue</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sistema de Llamado Escolar</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

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

/**
 * Layout mobile con nav inferior
 */
export const MobileLayout = ({ children, activeTab, onTabChange }) => {
  const { notification } = useUIStore()

  const navigationItems = [
    { id: 'scanner', icon: '📷', label: 'Escanear' },
    { id: 'queue', icon: '📋', label: 'Cola' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'admin', icon: '⚙️', label: 'Admin' },
  ]

  return (
    <div className="flex flex-col h-screen bg-white pb-safe-bottom">
      {/* Header */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-40 safe-top">
        <div className="px-4 py-2">
          <h1 className="text-lg font-bold">ScanQueue</h1>
          <p className="text-xs opacity-90">Llamado Escolar</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-bottom shadow-premium">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              flex-1 py-4 flex flex-col items-center gap-1
              transition-all duration-200
              ${activeTab === item.id
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
              }
            `}
          >
            <span className={`text-2xl ${activeTab === item.id ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Toast */}
      {notification && (
        <Toast
          notification={notification}
          onClose={() => { }}
        />
      )}
    </div>
  )
}

/**
 * Loading Layout
 */
export const LoadingLayout = ({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

/**
 * Error Layout
 */
export const ErrorLayout = ({ title, message, onRetry }) => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center px-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
)

export default MainLayout
