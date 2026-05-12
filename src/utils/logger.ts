import pino from 'pino';

/**
 * Shared application logger instance using Pino.
 * Configured with pretty-printing and configurable log levels.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
