import { sequelize } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class SecurityService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async writeAuditLog(data: any) {
    await sequelize.query(
      'INSERT INTO "AuditLogs" (id, "tenantId", action, "entityType", "entityId", changes, "userId", "createdAt") VALUES (:id, :tenantId, :action, :entityType, :entityId, :changes, :userId, NOW())',
      {
        replacements: {
          id: data.id || 'aud-' + uuidv4().slice(0, 8),
          tenantId: this.tenantId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId || null,
          changes: JSON.stringify(data.changes || {}),
          userId: data.userId
        }
      }
    );

    return { success: true, message: 'Audit log recorded' };
  }
}
