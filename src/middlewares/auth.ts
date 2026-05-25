import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { UserClaims, RequestContext, TenantContext } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as UserClaims;
    
    // Extract tenant context from JWT
    const tenantContext: TenantContext = {
      tenantId: decoded.tenantId,
      name: '', // Would be fetched from database
      subscriptionTier: 'professional',
    };

    req.context = {
      tenant: tenantContext,
      user: decoded,
      requestId: req.headers['x-request-id'] as string || `req-${Date.now()}`,
    };

    logger.info('Token authenticated', {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      requestId: req.context.requestId,
    });

    next();
    return;
  } catch (err) {
    logger.error('Token verification failed', { error: err });
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
};

export const validateTenantContext = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.context) {
    res.status(401).json({ success: false, message: 'Tenant context required' });
    return;
  }

  // Add tenant ID to all database queries
  (req as any).tenantId = req.context.tenant.tenantId;

  next();
  return;
};

export const checkPermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.context) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userPermissions = req.context.user.permissions;
    const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      logger.warn('Permission denied', {
        userId: req.context.user.userId,
        requiredPermissions,
        userPermissions,
      });
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
    return;
  };
};

export const impersonationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const impersonateUserId = req.headers['x-impersonate-user-id'] as string;

  if (impersonateUserId && req.context) {
    // Only super admins can impersonate
    if (!req.context.user.roles.includes('super_admin')) {
      res.status(403).json({ success: false, message: 'Impersonation not allowed' });
      return;
    }

    logger.warn('Impersonation started', {
      adminId: req.context.user.userId,
      impersonatedUserId: impersonateUserId,
      requestId: req.context.requestId,
    });

    (req as any).impersonatedUserId = impersonateUserId;
  }

  next();
  return;
};