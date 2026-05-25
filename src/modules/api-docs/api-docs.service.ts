import { sequelize } from '../../config/database.js';
export class APIDocService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async generateDeveloperKey(id: string) {
    await sequelize.query('INSERT INTO "ApiKeys" (id, "tenantId", "keySecret", status, "createdAt") VALUES (:id, :tenantId, :secret, \'active\', NOW())', {
      replacements: { id, tenantId: this.tenantId, secret: 'msk_live_' + Math.random().toString(36).substr(2, 16) }
    });
    return { success: true, message: 'מפתח API חיצוני חדש הונפק עבור מרכז המפתחים של הרשת' };
  }
}
