import { sequelize } from '../../config/database.js';

export class PedagogyService {
  tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async createStudent(data: any): Promise<void> {
    await sequelize.query(
      'INSERT INTO "Students" (id, "tenantId", "institutionId", "firstName", "lastName", "idNumber", "classGrade", "createdAt", "updatedAt") VALUES (:id, :tenantId, :institutionId, :firstName, :lastName, :idNumber, :classGrade, NOW(), NOW())',
      { replacements: { id: data.id, tenantId: this.tenantId, institutionId: data.institutionId, firstName: data.firstName, lastName: data.lastName, idNumber: data.idNumber, classGrade: data.classGrade } }
    );
  }

  async recordGrade(data: any): Promise<any> {
    await sequelize.query(
      'INSERT INTO "Grades" ("tenantId", "studentId", subject, grade, "createdAt") VALUES (:tenantId, :studentId, :subject, :grade, NOW())',
      { replacements: { tenantId: this.tenantId, studentId: data.studentId, subject: data.subject, grade: data.grade } }
    );
    
    // מנגנון התראות אוטומטי מובנה
    if (data.grade < 60) {
      return { 
        alertTriggered: true, 
        alertMessage: "התראה פדגוגית חמה: הציון נמוך מסף הרשת! נפתח כרטיס טיפול SLA ליועץ." 
      };
    }
    return { alertTriggered: false };
  }

  async getStudentProfile360(studentId: string): Promise<any> {
    const [info]: any[] = await sequelize.query(
      'SELECT * FROM "Students" WHERE "tenantId" = :tenantId AND id = :studentId',
      { replacements: { tenantId: this.tenantId, studentId } }
    );
    
    const [grades]: any[] = await sequelize.query(
      'SELECT subject, grade, "createdAt" FROM "Grades" WHERE "tenantId" = :tenantId AND "studentId" = :studentId ORDER BY "createdAt" DESC',
      { replacements: { tenantId: this.tenantId, studentId } }
    );
    
    if (info.length === 0) return { success: false, message: 'Student not found' };
    return { success: true, profile360: { basicInfo: info[0], gradesSummary: grades } };
  }
}