import React from 'react'
import { motion } from 'framer-motion'

/**
 * Componente Button reutilizable
 */
export const Button = ({
  children,
  variant = 'primary', // primary, secondary, success, error, ghost
  size = 'md', // sm, md, lg, xl
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-sm hover:shadow-md focus:ring-blue-600',
    secondary: 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] shadow-sm hover:shadow-md focus:ring-sky-500',
    success: 'bg-[#10b981] text-white hover:bg-[#059669] shadow-sm focus:ring-emerald-500',
    error: 'bg-[#f43f5e] text-white hover:bg-[#e11d48] shadow-sm focus:ring-rose-500',
    ghost: 'bg-transparent text-[#1e3a8a] hover:bg-blue-50 border border-blue-200 focus:ring-blue-400',
    outline: 'border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-bold',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Componente Card
 */
export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`
      bg-white rounded-card shadow-card border border-gray-100 overflow-hidden
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
)

/**
 * Componente Input
 */
export const Input = ({
  label,
  error,
  fullWidth = true,
  type = 'text',
  className = '',
  ...props
}) => (
  <div className={fullWidth ? 'w-full' : ''}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <input
      type={type}
      className={`
        w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white
        placeholder:text-gray-500
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
        transition-all duration-200
        ${error ? 'border-error ring-1 ring-error' : 'hover:border-gray-400'}
        ${className}
      `}
      {...props}
    />
    {error && <p className="text-error text-sm mt-1">{error}</p>}
  </div>
)

/**
 * Componente Badge
 */
export const Badge = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-primary-light text-primary border border-primary border-opacity-20',
    success: 'bg-green-100 text-green-700 border border-green-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  }

  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full text-sm font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

/**
 * Componente Modal
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}) => {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className={`${sizes[size]} w-full mx-4`}>
        {title && (
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        )}

        <div className="px-6 py-4">{children}</div>

        {actions && (
          <div className="border-t border-gray-200 px-6 py-4 flex gap-2 justify-end">
            {actions}
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * Componente Alert
 */
export const Alert = ({ type = 'info', title, message, onClose }) => {
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-warning bg-opacity-10 border-warning border-opacity-20 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div
      className={`
        border rounded-lg p-4 flex items-start justify-between
        ${colors[type]}
      `}
    >
      <div>
        {title && <h3 className="font-semibold">{title}</h3>}
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/**
 * Componente Spinner
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={`
        ${sizes[size]} border-4 border-gray-200 border-t-primary
        rounded-full animate-spin ${className}
      `}
    />
  )
}

/**
 * Componente LoadingOverlay
 */
export const LoadingOverlay = ({ isVisible, message }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  )
}

/**
 * Componente Notification Toast
 */
export const Toast = ({ notification, onClose }) => {
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, onClose])

  if (!notification) return null

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-warning',
    info: 'bg-blue-500',
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg
        text-white font-medium shadow-lg
        animate-slide-up
        ${typeStyles[notification.type]}
      `}
    >
      {notification.message}
    </div>
  )
}

/**
 * Componente Tabs
 */
export const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className="bg-white border-b border-gray-100">
    <div className="flex gap-4 px-6 max-w-7xl mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-1 py-4 font-bold text-sm uppercase tracking-wider transition-all duration-200 relative
            ${activeTab === tab.id
              ? 'text-primary'
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
            />
          )}
        </button>
      ))}
    </div>
  </div>
)
