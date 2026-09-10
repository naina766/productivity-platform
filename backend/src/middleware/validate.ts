import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Errors } from '../utils/AppError.js';

type Source = 'body' | 'query' | 'params';

export function validate<T extends z.ZodTypeAny>(source: Source, schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(Errors.validation('Invalid request', result.error.flatten()));
      return;
    }
    // Overwrite with parsed (coerced/defaulted) value.
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidParam = (name = 'id') =>
  z.object({ [name]: z.string().uuid(`Invalid ${name}`) });
