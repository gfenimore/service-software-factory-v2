import React from 'react'

export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'selected' | 'hover'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: () => void
  className?: string
}

export function Card({
  children,
  variant = 'default',
  size = 'md',
  interactive = false,
  onClick,
  className = '',
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg border transition-all duration-200'

  const variantClasses = {
    default: 'border-gray-200 shadow-sm',
    selected: 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-md',
    hover: 'border-gray-300 shadow-md',
  }

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-md hover:border-gray-300'
    : ''

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
