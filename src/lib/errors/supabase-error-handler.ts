import { PostgrestError } from '@supabase/supabase-js';
import { DatabaseError, ValidationError, NotFoundError } from './custom-errors';

/**
 * Converts Supabase errors to our custom errors
 */
export function handleSupabaseError(error: PostgrestError): never {
  // Handle common Postgres error codes
  switch (error.code) {
    case '23505': // unique_violation
      throw new ValidationError(
        'This record already exists',
        error.details
      );
    
    case '23503': // foreign_key_violation
      throw new ValidationError(
        'Related record not found',
        error.details
      );
    
    case '23502': // not_null_violation
      throw new ValidationError(
        'Required field is missing',
        error.details
      );
    
    case '22P02': // invalid_text_representation
    throw new ValidationError('Invalid data format', 'data');
    
    case 'PGRST116': // not found
      throw new NotFoundError();
    
    default:
      throw new DatabaseError(
        error.message || 'Database operation failed',
        error.code
      );
  }
}