// utils/errorHandler.js
'use client';

/**
 * Centralized error handling utility for API calls and async operations
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  DATABASE: 'DATABASE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error, context = '') => {
  console.error(`API Error ${context ? `in ${context}` : ''}:`, error);

  let errorMessage = 'An unexpected error occurred';
  let errorType = ErrorTypes.UNKNOWN;
  let statusCode = 500;

  if (error.response) {
    // Server responded with error status
    statusCode = error.response.status;
    
    switch (statusCode) {
      case 400:
        errorMessage = error.response.data?.message || 'Invalid request';
        errorType = ErrorTypes.VALIDATION;
        break;
      case 401:
        errorMessage = 'You are not authenticated. Please log in.';
        errorType = ErrorTypes.AUTHENTICATION;
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        errorType = ErrorTypes.AUTHORIZATION;
        break;
      case 404:
        errorMessage = error.response.data?.message || 'Resource not found';
        errorType = ErrorTypes.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
        errorMessage = 'Server error. Please try again later.';
        errorType = ErrorTypes.SERVER;
        break;
      default:
        errorMessage = error.response.data?.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response received
    errorMessage = 'Network error. Please check your internet connection.';
    errorType = ErrorTypes.NETWORK;
    statusCode = 0;
  } else if (error.message) {
    // Something else happened
    errorMessage = error.message;
  }

  return {
    message: errorMessage,
    type: errorType,
    statusCode,
    originalError: error,
    context
  };
};

/**
 * Handle Supabase errors
 */
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase Error ${context ? `in ${context}` : ''}:`, error);

  let errorMessage = 'Database operation failed';
  let errorType = ErrorTypes.DATABASE;

  if (error.message) {
    // Common Supabase error patterns
    if (error.message.includes('JWT') || error.message.includes('auth')) {
      errorMessage = 'Authentication expired. Please log in again.';
      errorType = ErrorTypes.AUTHENTICATION;
    } else if (error.message.includes('unique constraint')) {
      errorMessage = 'This record already exists';
      errorType = ErrorTypes.VALIDATION;
    } else if (error.message.includes('foreign key')) {
      errorMessage = 'Cannot delete record with related data';
      errorType = ErrorTypes.VALIDATION;
    } else if (error.message.includes('permission') || error.message.includes('RLS')) {
      errorMessage = 'You do not have permission to access this data';
      errorType = ErrorTypes.AUTHORIZATION;
    } else {
      errorMessage = error.message;
    }
  }

  return {
    message: errorMessage,
    type: errorType,
    originalError: error,
    context
  };
};

/**
 * Retry failed async operations with exponential backoff
 */
export const retryOperation = async (
  operation,
  maxRetries = 3,
  delay = 1000,
  backoffMultiplier = 2
) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication/authorization errors
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

/**
 * Safe async wrapper that handles errors gracefully
 */
export const safeAsync = async (asyncFn, fallbackValue = null, context = '') => {
  try {
    return await asyncFn();
  } catch (error) {
    const handledError = handleApiError(error, context);
    console.error('Safe async error:', handledError);
    return fallbackValue;
  }
};

/**
 * Log errors to external service (placeholder for Sentry, LogRocket, etc.)
 */
export const logErrorToService = (error, additionalInfo = {}) => {
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: additionalInfo });
    console.log('Would log to error service:', { error, ...additionalInfo });
  }
  
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', error, additionalInfo);
  }
  
  // Store in localStorage for debugging
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message || error.toString(),
        stack: error.stack,
        ...additionalInfo
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      localStorage.setItem('error_logs', JSON.stringify(existingLogs.slice(-20)));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  }
};

/**
 * Display user-friendly error message
 */
export const showErrorToast = (error, customMessage = null) => {
  const message = customMessage || error.message || 'An error occurred';
  
  // You can integrate with a toast library here (e.g., react-hot-toast, sonner)
  // For now, using alert as fallback
  if (typeof window !== 'undefined') {
    // Check if a toast library is available
    if (window.toast) {
      window.toast.error(message);
    } else {
      // Fallback to alert or console
      console.error('Error:', message);
      // Uncomment if you want to show alerts
      // alert(message);
    }
  }
};

/**
 * Validate form data and return errors
 */
export const validateFormData = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    // Required check
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${fieldRules.label || field} is required`;
      continue;
    }
    
    // Min length
    if (fieldRules.minLength && value?.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
    }
    
    // Max length
    if (fieldRules.maxLength && value?.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must not exceed ${fieldRules.maxLength} characters`;
    }
    
    // Email validation
    if (fieldRules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (fieldRules.phone && value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      errors[field] = 'Please enter a valid 10-digit phone number';
    }
    
    // Custom validation
    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.customMessage || 'Invalid value';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  AppError,
  ErrorTypes,
  handleApiError,
  handleSupabaseError,
  retryOperation,
  safeAsync,
  logErrorToService,
  showErrorToast,
  validateFormData
};
