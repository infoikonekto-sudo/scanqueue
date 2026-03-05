import React from 'react'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-sm hover:shadow-md disabled:bg-gray-300 transition-all font-black uppercase tracking-widest',
    secondary: 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] shadow-sm hover:shadow-md disabled:bg-gray-200 transition-all font-black uppercase tracking-widest',
    success: 'bg-[#10b981] text-white hover:bg-[#059669] shadow-sm transition-all font-black uppercase tracking-widest',
    danger: 'bg-[#f43f5e] text-white hover:bg-[#e11d48] shadow-sm transition-all font-black uppercase tracking-widest',
    warning: 'bg-[#f59e0b] text-white hover:bg-[#d97706] transition-all font-black uppercase tracking-widest',
    ghost: 'bg-transparent text-[#1e3a8a] hover:bg-slate-100 border-2 border-[#1e3a8a]/20 font-black uppercase tracking-widest',
    link: 'bg-transparent text-[#1e3a8a] hover:underline font-black uppercase tracking-widest',
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded border border-transparent
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  )
}

export default Button
