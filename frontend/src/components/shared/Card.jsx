import React from 'react'

export const Card = ({ children, className = '', title, subtitle, onClick, ...props }) => {
  return (
    <div
      className={`premium-card p-6 ${onClick ? 'cursor-pointer hover:border-primary transition-all duration-300' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6 border-b border-gray-100 pb-4">
          {title && <h3 className="text-xl font-bold text-slate-800 leading-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export const StatsCard = ({ label, value, change, icon: Icon, color = 'blue' }) => {
  const accentColor = {
    blue: 'text-indigo-600',
    green: 'text-emerald-600',
    red: 'text-rose-600',
    orange: 'text-amber-600',
  }

  const bgGradient = {
    blue: 'from-indigo-50 to-white',
    green: 'from-emerald-50 to-white',
    red: 'from-rose-50 to-white',
    orange: 'from-amber-50 to-white',
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-white transition-colors duration-300`}>
          {Icon && <Icon className={`w-6 h-6 ${accentColor[color]}`} />}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${change.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
            {change.positive ? '↑' : '↓'} {Math.abs(change.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default Card
