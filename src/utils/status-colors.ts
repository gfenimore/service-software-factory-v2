import { designTokens } from '@/styles/design-tokens'

export type WorkOrderStatus =
  | 'Scheduled'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Invoiced'
  | 'Cancelled'
  | 'On Hold'
  | 'Pending'

export type PriorityType = 'Emergency' | 'High' | 'Medium' | 'Low'

export function getStatusColor(status: WorkOrderStatus): string {
  const statusMap: Record<WorkOrderStatus, string> = {
    Scheduled: 'bg-gray-100 text-gray-700',
    Assigned: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Completed: 'bg-green-100 text-green-700',
    Invoiced: 'bg-purple-100 text-purple-700',
    Cancelled: 'bg-red-100 text-red-700',
    'On Hold': 'bg-gray-100 text-gray-700',
    Pending: 'bg-amber-100 text-amber-700',
  }
  return statusMap[status] || 'bg-gray-100 text-gray-700'
}

export function getStatusColorHex(status: WorkOrderStatus): string {
  const statusMap: Record<WorkOrderStatus, string> = {
    Scheduled: designTokens.colors.status.scheduled,
    Assigned: designTokens.colors.status.assigned,
    'In Progress': designTokens.colors.status.inProgress,
    Completed: designTokens.colors.status.completed,
    Invoiced: designTokens.colors.status.invoiced,
    Cancelled: designTokens.colors.status.cancelled,
    'On Hold': designTokens.colors.status.onHold,
    Pending: designTokens.colors.status.pending,
  }
  return statusMap[status] || designTokens.colors.gray[500]
}

export function getPriorityColor(priority: PriorityType): string {
  const priorityMap: Record<PriorityType, string> = {
    Emergency: 'bg-red-100 text-red-700',
    High: 'bg-amber-100 text-amber-700',
    Medium: 'bg-blue-100 text-blue-700',
    Low: 'bg-gray-100 text-gray-700',
  }
  return priorityMap[priority] || 'bg-gray-100 text-gray-700'
}

export function getPriorityColorHex(priority: PriorityType): string {
  const priorityMap: Record<PriorityType, string> = {
    Emergency: designTokens.colors.priority.emergency,
    High: designTokens.colors.priority.high,
    Medium: designTokens.colors.priority.medium,
    Low: designTokens.colors.priority.low,
  }
  return priorityMap[priority] || designTokens.colors.gray[400]
}

export function getStatusBadgeClasses(
  status: WorkOrderStatus,
  variant: 'subtle' | 'solid' | 'outline' = 'subtle'
): string {
  const baseClasses = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'

  if (variant === 'subtle') {
    return `${baseClasses} ${getStatusColor(status)}`
  }

  if (variant === 'solid') {
    const solidMap: Record<WorkOrderStatus, string> = {
      Scheduled: 'bg-gray-500 text-white',
      Assigned: 'bg-blue-500 text-white',
      'In Progress': 'bg-amber-500 text-white',
      Completed: 'bg-green-500 text-white',
      Invoiced: 'bg-purple-500 text-white',
      Cancelled: 'bg-red-500 text-white',
      'On Hold': 'bg-gray-500 text-white',
      Pending: 'bg-amber-500 text-white',
    }
    return `${baseClasses} ${solidMap[status] || 'bg-gray-500 text-white'}`
  }

  const outlineMap: Record<WorkOrderStatus, string> = {
    Scheduled: 'border border-gray-300 text-gray-700',
    Assigned: 'border border-blue-300 text-blue-700',
    'In Progress': 'border border-amber-300 text-amber-700',
    Completed: 'border border-green-300 text-green-700',
    Invoiced: 'border border-purple-300 text-purple-700',
    Cancelled: 'border border-red-300 text-red-700',
    'On Hold': 'border border-gray-300 text-gray-700',
    Pending: 'border border-amber-300 text-amber-700',
  }
  return `${baseClasses} ${outlineMap[status] || 'border border-gray-300 text-gray-700'}`
}

export function getPriorityBadgeClasses(
  priority: PriorityType,
  variant: 'subtle' | 'solid' | 'outline' = 'subtle'
): string {
  const baseClasses = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'

  if (variant === 'subtle') {
    return `${baseClasses} ${getPriorityColor(priority)}`
  }

  if (variant === 'solid') {
    const solidMap: Record<PriorityType, string> = {
      Emergency: 'bg-red-500 text-white',
      High: 'bg-amber-500 text-white',
      Medium: 'bg-blue-500 text-white',
      Low: 'bg-gray-500 text-white',
    }
    return `${baseClasses} ${solidMap[priority] || 'bg-gray-500 text-white'}`
  }

  const outlineMap: Record<PriorityType, string> = {
    Emergency: 'border border-red-300 text-red-700',
    High: 'border border-amber-300 text-amber-700',
    Medium: 'border border-blue-300 text-blue-700',
    Low: 'border border-gray-300 text-gray-700',
  }
  return `${baseClasses} ${outlineMap[priority] || 'border border-gray-300 text-gray-700'}`
}
