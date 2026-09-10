import { Router } from 'express';
import { checkDatabase } from '../config/db.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const db = await checkDatabase();
    res.status(200).json(
      ok(
        { status: 'ok', service: 'nova-api', uptimeSeconds: Math.floor(process.uptime()), db },
        { version: '0.1.0', phase: 1 },
      ),
    );
  }),
);
