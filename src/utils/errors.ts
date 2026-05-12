import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

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
