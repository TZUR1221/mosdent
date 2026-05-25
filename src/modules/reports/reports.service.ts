export class ReportsService {
  tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  async generateFinancialReport() {
    return { success: true, generatedAt: new Date(), template: 'PDF-FINANCE-SUMMARY-v4', data: 'מטריצת גבייה וסנכרון נדרים פלוס מאוזנת' };
  }
}
