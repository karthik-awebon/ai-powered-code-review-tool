import { logger } from './logger';

/**
 * Custom application error class that includes status code and operational status.
 */
export class AppError extends Error {
  /** The HTTP status code associated with the error. */
  public readonly statusCode: number;
  /** Indicates if the error is operational (expected) or a programmer/system error. */
  public readonly isOperational: boolean;

  /**
   * Creates an instance of AppError.
   * 
   * @param message - The error message.
   * @param statusCode - The HTTP status code (default: 500).
   * @param isOperational - Whether the error is operational (default: true).
   */
  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standardized API error handler that logs the error and returns a formatted response.
 * 
 * @param error - The error object to handle.
 * @returns An object containing success (false), message, and statusCode.
 */
export const handleApiError = (error: unknown) => {
  if (error instanceof AppError) {
    logger.error({ err: error }, error.message);
    return {
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    logger.error({ err: error }, error.message);
    return {
      success: false,
      message: 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  logger.error({ err: error }, 'Unknown error');
  return {
    success: false,
    message: 'An unknown error occurred',
    statusCode: 500,
  };
};
