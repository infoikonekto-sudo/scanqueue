import React from 'react'

export const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-blue-900 rounded-full animate-spin`} />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  )
}

export const SkeletonLoader = ({ count = 5, className = '' }) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-4 bg-gray-200 rounded mb-3 animate-pulse"
          style={{
            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite ${idx * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

export default LoadingSpinner
