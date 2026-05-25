import { sequelize } from '../../config/database.js';

export class FormsService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async createFormTemplate(data: any): Promise<any> {
    await sequelize.query(
      'INSERT INTO "Forms" (id, "tenantId", title, fields, "createdAt", "updatedAt") VALUES (:id, :tenantId, :title, :fields, NOW(), NOW())',
      { replacements: { id: data.id, tenantId: this.tenantId, title: data.title, fields: JSON.stringify(data.fields) } }
    );
    return { success: true, message: 'טופס מקוון חדש הוגדר במערכת בהצלחה' };
  }

  async getFormTemplates(): Promise<any> {
    const [forms] = await sequelize.query('SELECT * FROM "Forms" WHERE "tenantId" = :tenantId', { replacements: { tenantId: this.tenantId } });
    return { success: true, templates: forms };
  }
}
