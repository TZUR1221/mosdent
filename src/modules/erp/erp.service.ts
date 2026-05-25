import { sequelize } from '../../config/database.js';

export class ERPService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async createTask(data: any): Promise<any> {
    await sequelize.query(
      'INSERT INTO "Tasks" (id, "tenantId", title, description, "assignedTo", status, priority, "createdAt", "updatedAt") VALUES (:id, :tenantId, :title, :description, :assignedTo, \'open\', :priority, NOW(), NOW())',
      { replacements: { id: data.id, tenantId: this.tenantId, title: data.title, description: data.description, assignedTo: data.assignedTo, priority: data.priority } }
    );
    return { success: true, message: 'כרטיס משימה וטיפול SLA נפתח בהצלחה במערכת' };
  }

  async getTasks(): Promise<any> {
    const [tasks] = await sequelize.query('SELECT * FROM "Tasks" WHERE "tenantId" = :tenantId', { replacements: { tenantId: this.tenantId } });
    return { success: true, taskBoard: tasks };
  }
}
