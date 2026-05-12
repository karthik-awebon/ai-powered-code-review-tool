import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, handleApiError } from './errors';
import { logger } from './logger';

vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('AppError', () => {
  it('creates an error with default status code', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('creates an error with custom status code and operational flag', () => {
    const error = new AppError('Not found', 404, false);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(false);
  });
});

describe('handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles AppError correctly', () => {
    const error = new AppError('Custom error', 400);
    const result = handleApiError(error);

    expect(result).toEqual({
      success: false,
      message: 'Custom error',
      statusCode: 400,
    });
    expect(logger.error).toHaveBeenCalledWith({ err: error }, 'Custom error');
  });

  it('handles generic Error correctly', () => {
    const error = new Error('Something failed');
    const result = handleApiError(error);

    expect(result).toEqual({
      success: false,
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
    expect(logger.error).toHaveBeenCalledWith({ err: error }, 'Something failed');
  });

  it('handles unknown error correctly', () => {
    const error = 'Just a string';
    const result = handleApiError(error);

    expect(result).toEqual({
      success: false,
      message: 'An unknown error occurred',
      statusCode: 500,
    });
    expect(logger.error).toHaveBeenCalledWith({ err: error }, 'Unknown error');
  });
});
