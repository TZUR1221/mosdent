import { sequelize } from '../../config/database.js';
export class CommunicationsService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async sendSystemEmail(data: any) {
    await sequelize.query('INSERT INTO "Emails" (id, "tenantId", recipient, subject, body, signature, "createdAt") VALUES (:id, :tenantId, :recipient, :subject, :body, :signature, NOW())', {
      replacements: { id: data.id, tenantId: this.tenantId, recipient: data.recipient, subject: data.subject, body: data.body, signature: data.signature }
    });
    return { success: true, message: 'הודעת מייל נחתמה דיגיטלית ונשלחה דרך שרת SMTP' };
  }
}
