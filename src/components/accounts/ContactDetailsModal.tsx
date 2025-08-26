'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Mail, Phone, Briefcase } from 'lucide-react'
import type { Account } from '@/types/accountDetails.types'
import { useContacts } from '@/hooks/useContacts'
import type { Database } from '@/lib/supabase/database.types'

type Contact = Database['public']['Tables']['contacts']['Row']

export interface ContactInfo {
  id: string
  name: string
  role?: string
  email?: string
  phone?: string
  isPrimary?: boolean
  lastContact?: string
  notes?: string
}

export interface ContactDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  account: Account | null
  contacts?: ContactInfo[]
}

export function ContactDetailsModal({
  isOpen,
  onClose,
  account,
  contacts = [],
}: ContactDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Fetch real contacts from Supabase using account ID
  const { contacts: dbContacts, loading, error } = useContacts(account?.id)

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !account) return null

  // Transform database contacts to display format
  const displayContacts: ContactInfo[] =
    dbContacts.length > 0
      ? dbContacts.map((contact: Contact) => ({
          id: contact.id,
          name: `${contact.first_name} ${contact.last_name}`,
          role: contact.title || undefined,
          email: contact.email_address || undefined,
          phone: contact.phone_number || undefined,
          isPrimary: false, // TODO: use contact.is_primary_contact when available
          notes: contact.notes || undefined,
        }))
      : contacts.length > 0
        ? contacts
        : [
            {
              id: '1',
              name: account.contact_name || 'No contacts available',
              role: 'Primary Contact',
              email: (account.contact_email as string) || undefined,
              phone: (account.contact_phone as string) || undefined,
              isPrimary: true,
              notes: 'Contact information from account record',
            },
          ].filter((c) => c.name !== 'No contacts available' || (!c.email && !c.phone))

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      data-testid="contact-details-modal-backdrop"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        data-testid="contact-details-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
            <p className="text-sm text-gray-500 mt-1">{account.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
            data-testid="modal-close-button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading contacts: {error}</p>
              <p className="text-sm text-gray-500 mt-2">Using cached data if available</p>
            </div>
          ) : displayContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contacts available for this account
            </div>
          ) : (
            <div className="space-y-4">
              {displayContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {contact.name}
                        {contact.isPrimary && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </h3>
                      {contact.role && <p className="text-sm text-gray-600">{contact.role}</p>}
                    </div>
                    {contact.lastContact && (
                      <span className="text-xs text-gray-500">
                        Last contact: {contact.lastContact}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Email:</span>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Phone:</span>
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-gray-600">
                        <span className="font-medium">Notes:</span> {contact.notes}
                      </div>
                    )}
                  </div>

                  {/* Communication Log (placeholder) */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Recent Communications
                    </h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Email sent: Quote follow-up</span>
                        <span>2 days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone call: Service inquiry</span>
                        <span>1 week ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
