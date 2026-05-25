import { sequelize } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class CRMService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }

  async submitRegistration(data: any) {
    const duplicateCheck = await this.findDuplicate(data.childIdNumber, data.parentPhone);
    if (duplicateCheck.duplicate) {
      return duplicateCheck;
    }

    const requiredFields = ['institutionId', 'childFirstName', 'childLastName', 'childIdNumber', 'requestedGrade', 'parentName', 'parentPhone'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return { success: false, message: 'חסרים שדות חובה בטופס הרישום', missingFields };
    }

    const regId = data.id || 'reg-' + uuidv4().slice(0, 8);
    await sequelize.query(
      `INSERT INTO "Registrations"
      (id, "tenantId", "institutionId", "childFirstName", "childLastName", "childIdNumber", "dateOfBirth", "requestedGrade", "parentName", "parentPhone", "parentEmail", status, "customAnswers", "signatureImage", "submittedAt", "createdAt", "updatedAt")
      VALUES (:id, :tenantId, :institutionId, :childFirstName, :childLastName, :childIdNumber, :dateOfBirth, :requestedGrade, :parentName, :parentPhone, :parentEmail, 'submitted', :customAnswers, :signatureImage, NOW(), NOW(), NOW())`,
      {
        replacements: {
          id: regId,
          tenantId: this.tenantId,
          institutionId: data.institutionId,
          childFirstName: data.childFirstName,
          childLastName: data.childLastName,
          childIdNumber: data.childIdNumber,
          dateOfBirth: data.dateOfBirth || null,
          requestedGrade: data.requestedGrade,
          parentName: data.parentName,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail || null,
          customAnswers: JSON.stringify(data.customAnswers || {}),
          signatureImage: data.signatureImage || null
        }
      }
    );

    return { success: true, message: 'הרישום בוצע בהצלחה, כרטיס מועמד הופק', registrationId: regId, status: 'submitted' };
  }

  async findDuplicate(childIdNumber?: string, parentPhone?: string) {
    if (!childIdNumber && !parentPhone) {
      return { success: true, duplicate: false };
    }

    const [records]: any[] = await sequelize.query(
      `SELECT id, "childFirstName", "childLastName", "childIdNumber", "parentPhone", status
       FROM "Registrations"
       WHERE "tenantId" = :tenantId
       AND (("childIdNumber" = :childIdNumber AND :childIdNumber IS NOT NULL)
         OR ("parentPhone" = :parentPhone AND :parentPhone IS NOT NULL))
       ORDER BY "createdAt" DESC
       LIMIT 5`,
      { replacements: { tenantId: this.tenantId, childIdNumber: childIdNumber || null, parentPhone: parentPhone || null } }
    );

    if (records.length === 0) {
      return { success: true, duplicate: false };
    }

    return {
      success: false,
      duplicate: true,
      message: 'יכול להיות שאנחנו כבר מכירים? תעודת הזהות או הטלפון קיימים במערכת.',
      matches: records
    };
  }

  async getAdvancedKanban(institutionId: string) {
    const [records]: any[] = await sequelize.query(
      'SELECT * FROM "Registrations" WHERE "tenantId" = :tenantId AND "institutionId" = :institutionId',
      { replacements: { tenantId: this.tenantId, institutionId } }
    );

    return {
      success: true,
      institutionId,
      stages: {
        submitted: records.filter((r: any) => r.status === 'submitted'),
        under_review: records.filter((r: any) => r.status === 'under_review'),
        interview: records.filter((r: any) => r.status === 'interview'),
        waiting_list: records.filter((r: any) => r.status === 'waiting_list'),
        accepted: records.filter((r: any) => r.status === 'accepted'),
        rejected: records.filter((r: any) => r.status === 'rejected')
      }
    };
  }

  async updateCandidateStatus(id: string, status: string) {
    const allowedStatuses = ['submitted', 'under_review', 'interview', 'waiting_list', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return { success: false, message: 'סטטוס מועמד אינו תקין', allowedStatuses };
    }

    const [result]: any[] = await sequelize.query(
      'UPDATE "Registrations" SET status = :status, "updatedAt" = NOW() WHERE id = :id AND "tenantId" = :tenantId RETURNING *',
      { replacements: { status, id, tenantId: this.tenantId } }
    );
    if (result.length === 0) return { success: false, message: 'מועמד לא נמצא' };
    return { success: true, message: 'סטטוס המועמד עודכן', candidate: result[0] };
  }

  async appendInternalNote(id: string, note: string) {
    const [result]: any[] = await sequelize.query(
      `UPDATE "Registrations"
       SET "internalNotes" = CONCAT(COALESCE("internalNotes", ''), :entry),
           "updatedAt" = NOW()
       WHERE id = :id AND "tenantId" = :tenantId
       RETURNING *`,
      { replacements: { entry: `\n[${new Date().toISOString()}] ${note}`, id, tenantId: this.tenantId } }
    );
    if (result.length === 0) return { success: false, message: 'מועמד לא נמצא' };
    return { success: true, message: 'הערה פנימית נשמרה', candidate: result[0] };
  }

  async getRegistration(id: string) {
    const [records]: any[] = await sequelize.query(
      'SELECT * FROM "Registrations" WHERE id = :id AND "tenantId" = :tenantId',
      { replacements: { id, tenantId: this.tenantId } }
    );

    if (records.length === 0) return { success: false, message: 'מועמד לא נמצא' };
    return { success: true, registration: records[0] };
  }
}
