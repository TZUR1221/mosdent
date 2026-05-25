import { Router } from 'express';
import { ReportsService } from '../modules/reports/reports.service.js';
const router = Router();

router.get('/seed', async (_req, res) => {
  const result = await new ReportsService('tenant-mosad-01').generateFinancialReport();
  res.json({ message: 'Reports Engine ready for PDF/Excel exports', payload: result });
});
export default router;
