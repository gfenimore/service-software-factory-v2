export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          account_number: string
          account_name: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          billing_address_1: string | null
          billing_address_2: string | null
          billing_city: string | null
          billing_state: string | null
          billing_zip: string | null
          billing_country: string | null
          service_address_1: string | null
          service_address_2: string | null
          service_city: string | null
          service_state: string | null
          service_zip: string | null
          service_country: string | null
          account_type: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_number: string
          account_name: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          billing_address_1?: string | null
          billing_address_2?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          billing_country?: string | null
          service_address_1?: string | null
          service_address_2?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          service_country?: string | null
          account_type?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_number?: string
          account_name?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          billing_address_1?: string | null
          billing_address_2?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          billing_country?: string | null
          service_address_1?: string | null
          service_address_2?: string | null
          service_city?: string | null
          service_state?: string | null
          service_zip?: string | null
          service_country?: string | null
          account_type?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          account_id: string
          first_name: string
          last_name: string
          title: string | null
          email_address: string | null
          phone_number: string | null
          is_primary_contact: boolean
          communication_preference: 'Voice' | 'Text' | 'Email' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          first_name: string
          last_name: string
          title?: string | null
          email_address?: string | null
          phone_number?: string | null
          is_primary_contact?: boolean
          communication_preference?: 'Voice' | 'Text' | 'Email' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          first_name?: string
          last_name?: string
          title?: string | null
          email_address?: string | null
          phone_number?: string | null
          is_primary_contact?: boolean
          communication_preference?: 'Voice' | 'Text' | 'Email' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_locations: {
        Row: {
          id: string
          account_id: string
          location_name: string
          street_address: string
          city: string
          state: string
          zip_code: string
          country: string
          latitude: number | null
          longitude: number | null
          is_primary: boolean
          is_billing_address: boolean
          site_contact_id: string | null
          access_instructions: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          location_name: string
          street_address: string
          city: string
          state: string
          zip_code: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          is_primary?: boolean
          is_billing_address?: boolean
          site_contact_id?: string | null
          access_instructions?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          location_name?: string
          street_address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          is_primary?: boolean
          is_billing_address?: boolean
          site_contact_id?: string | null
          access_instructions?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          work_order_number: string
          account_id: string
          service_location_id: string | null
          contact_id: string | null
          title: string
          description: string | null
          type: string
          priority: string
          status: string
          scheduled_date: string | null
          scheduled_time: string | null
          estimated_duration_hours: number | null
          actual_start_time: string | null
          actual_end_time: string | null
          assigned_to: string | null
          assigned_team: string | null
          completion_notes: string | null
          customer_signature: string | null
          technician_signature: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          work_order_number?: string
          account_id: string
          service_location_id?: string | null
          contact_id?: string | null
          title: string
          description?: string | null
          type: string
          priority?: string
          status?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          estimated_duration_hours?: number | null
          actual_start_time?: string | null
          actual_end_time?: string | null
          assigned_to?: string | null
          assigned_team?: string | null
          completion_notes?: string | null
          customer_signature?: string | null
          technician_signature?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          work_order_number?: string
          account_id?: string
          service_location_id?: string | null
          contact_id?: string | null
          title?: string
          description?: string | null
          type?: string
          priority?: string
          status?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          estimated_duration_hours?: number | null
          actual_start_time?: string | null
          actual_end_time?: string | null
          assigned_to?: string | null
          assigned_team?: string | null
          completion_notes?: string | null
          customer_signature?: string | null
          technician_signature?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
