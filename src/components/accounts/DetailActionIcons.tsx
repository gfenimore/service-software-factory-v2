'use client'

import { Phone, FileText, DollarSign, StickyNote } from 'lucide-react'

export interface DetailActionIconsProps {
  onContactClick?: () => void
  onServiceAgreementClick?: () => void
  onFinancialClick?: () => void
  onNotesClick?: () => void
  className?: string
}

export function DetailActionIcons({
  onContactClick,
  onServiceAgreementClick,
  onFinancialClick,
  onNotesClick,
  className = ''
}: DetailActionIconsProps) {
  const handleIconClick = (e: React.MouseEvent, handler?: () => void) => {
    e.stopPropagation() // Prevent card selection when clicking icons
    handler?.()
  }

  return (
    <div 
      className={`flex gap-2 mt-3 pt-3 border-t border-gray-200 ${className}`}
      data-testid="detail-action-icons"
    >
      <button
        onClick={(e) => handleIconClick(e, onContactClick)}
        className="p-1.5 rounded hover:bg-blue-100 transition-colors"
        title="View Contacts"
        data-testid="contact-icon-button"
      >
        <Phone className="w-4 h-4 text-gray-600 hover:text-blue-600" />
      </button>
      
      <button
        onClick={(e) => handleIconClick(e, onServiceAgreementClick)}
        className="p-1.5 rounded hover:bg-blue-100 transition-colors"
        title="View Service Agreements"
        data-testid="service-agreement-icon-button"
      >
        <FileText className="w-4 h-4 text-gray-600 hover:text-blue-600" />
      </button>
      
      <button
        onClick={(e) => handleIconClick(e, onFinancialClick)}
        className="p-1.5 rounded hover:bg-blue-100 transition-colors"
        title="View Financial Data"
        data-testid="financial-icon-button"
      >
        <DollarSign className="w-4 h-4 text-gray-600 hover:text-blue-600" />
      </button>
      
      <button
        onClick={(e) => handleIconClick(e, onNotesClick)}
        className="p-1.5 rounded hover:bg-blue-100 transition-colors"
        title="View Notes"
        data-testid="notes-icon-button"
      >
        <StickyNote className="w-4 h-4 text-gray-600 hover:text-blue-600" />
      </button>
    </div>
  )
}