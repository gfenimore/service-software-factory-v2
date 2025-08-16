import React from 'react'
import {
  WorkOrderStatus,
  PriorityType,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
} from '@/utils/status-colors'

export interface StatusBadgeProps {
  status: WorkOrderStatus
  variant?: 'subtle' | 'solid' | 'outline'
  size?: 'xs' | 'sm' | 'md'
}

export interface PriorityBadgeProps {
  priority: PriorityType
  variant?: 'subtle' | 'solid' | 'outline'
  size?: 'xs' | 'sm' | 'md'
}

const sizeClasses = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

export function StatusBadge({ status, variant = 'subtle', size = 'sm' }: StatusBadgeProps) {
  const baseClasses = getStatusBadgeClasses(status, variant)
  const sizeClass = sizeClasses[size]

  return <span className={`${baseClasses} ${sizeClass}`}>{status}</span>
}

export function PriorityBadge({ priority, variant = 'subtle', size = 'sm' }: PriorityBadgeProps) {
  const baseClasses = getPriorityBadgeClasses(priority, variant)
  const sizeClass = sizeClasses[size]

  return <span className={`${baseClasses} ${sizeClass}`}>{priority}</span>
}
