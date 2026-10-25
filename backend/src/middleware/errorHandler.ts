import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || (err instanceof ZodError ? 400 : 500);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.flatten(),
    });
    return;
  }

  // Preserve standard FastAPI error response shapes ({ "detail": "..." } or { "error": "..." })
  const message = err.message || 'Internal Server Error';
  console.error(`[Express Error] ${req.method} ${req.url} [${statusCode}]:`, message);

  res.status(statusCode).json({
    detail: message,
    error: message,
    status: statusCode,
  });
}
