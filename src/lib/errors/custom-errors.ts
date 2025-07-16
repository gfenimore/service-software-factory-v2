/**
 * Base error class for all application errors
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
  
    constructor(
      message: string,
      statusCode: number = 500,
      isOperational: boolean = true
    ) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.timestamp = new Date();
  
      Object.setPrototypeOf(this, AppError.prototype);
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Validation errors (400)
   */
  export class ValidationError extends AppError {
    public readonly field?: string;
  
    constructor(message: string, field?: string) {
      super(message, 400);
      this.field = field;
    }
  }
  
  /**
   * Authentication errors (401)
   */
  export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
      super(message, 401);
    }
  }
  
  /**
   * Authorization errors (403)
   */
  export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
      super(message, 403);
    }
  }
  
  /**
   * Not found errors (404)
   */
  export class NotFoundError extends AppError {
    public readonly resource?: string;
  
    constructor(resource?: string) {
      const message = resource 
        ? `${resource} not found` 
        : 'Resource not found';
      super(message, 404);
      this.resource = resource;
    }
  }
  
  /**
   * Database errors
   */
  export class DatabaseError extends AppError {
    public readonly code?: string;
  
    constructor(message: string, code?: string) {
      super(message, 500);
      this.code = code;
    }
  }
  
  /**
   * External service errors
   */
  export class ExternalServiceError extends AppError {
    public readonly service: string;
  
    constructor(service: string, message: string) {
      super(`${service}: ${message}`, 503);
      this.service = service;
    }
  }