import { sequelize } from '../../config/database.js';
export class FinanceService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async createChargeToken(data: any) {
    await sequelize.query('INSERT INTO "Charges" (id, "tenantId", "studentId", amount, description, status, "ndarimToken", "createdAt", "updatedAt") VALUES (:id, :tenantId, :studentId, :amount, :description, \'pending\', :ndarimToken, NOW(), NOW())', { replacements: { id: data.id, tenantId: this.tenantId, studentId: data.studentId, amount: data.amount, description: data.description, ndarimToken: 'ndr-' + Math.random().toString(36).substr(2, 9) } });
    return { success: true, message: 'הוראת חיוב נוצרה וסונכרנה מול נדרים פלוס' };
  }

  async getPaymentStatus(studentId: string) {
    const [charges]: any[] = await sequelize.query('SELECT * FROM "Charges" WHERE "tenantId" = :tenantId AND "studentId" = :studentId', { replacements: { tenantId: this.tenantId, studentId } });
    return { success: true, studentId, charges };
  }
}
