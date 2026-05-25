import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';
import { ApiResponse } from '../types/index.js';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, any>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (err: Error | ApiError, req: Request, res: Response, _next: NextFunction): void => {
  const requestId = (req.context?.requestId) || 'unknown';

  if (err instanceof ApiError) {
    logger.error('API Error', {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      requestId,
      url: req.originalUrl,
    });

    const response: ApiResponse = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Unexpected error
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    requestId,
    url: req.originalUrl,
  });

  const response: ApiResponse = {
    success: false,
    statusCode: 500,
    message: 'Internal server error',
  };

  res.status(500).json(response);
  return;
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`,
  };

  res.status(404).json(response);
  return;
};
