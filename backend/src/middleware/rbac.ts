import type { NextFunction, Request, Response } from 'express';
import type { WorkspaceRole } from '@prisma/client';
import { prisma } from '../config/db.js';
import { Errors } from '../utils/AppError.js';

const RANK: Record<WorkspaceRole, number> = { MEMBER: 1, ADMIN: 2, OWNER: 3 };

/**
 * Workspace-level RBAC. Verifies the authenticated user belongs to the
 * workspace (id from params/body/query) and meets the minimum role.
 * All workspace-scoped authorization in Phase 2 must go through this —
 * never trust frontend route guards alone.
 */
export function requireWorkspaceRole(minRole: WorkspaceRole, workspaceIdSource: 'params' | 'body' = 'params') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        next(Errors.unauthorized());
        return;
      }
      const raw =
        workspaceIdSource === 'params'
          ? (req.params.workspaceId ?? req.params.id)
          : (req.body as { workspaceId?: unknown }).workspaceId;
      if (typeof raw !== 'string') {
        next(Errors.validation('workspaceId is required'));
        return;
      }
      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: raw, userId } },
      });
      if (!membership || RANK[membership.role] < RANK[minRole]) {
        next(Errors.forbidden());
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
