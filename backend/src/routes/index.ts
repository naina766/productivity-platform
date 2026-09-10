import { Router } from 'express';
import { healthRouter } from './health.js';

// Phase 1: only health. Phase 2 mounts: auth, workspaces, projects,
// tasks, comments, notifications, activity — all behind `authenticate`.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
