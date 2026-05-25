import { Router } from 'express';
import { FinanceService } from '../modules/finance/finance.service.js';
const router = Router();

router.get('/sync/seed', async (_req, res) => {
  const finance = new FinanceService('tenant-mosad-01');
  await finance.createChargeToken({ id: 'chg-01', studentId: 'stud-01', amount: 350.00, description: 'שכר לימוד חודש אייר' });
  await finance.createChargeToken({ id: 'chg-02', studentId: 'stud-01', amount: 120.00, description: 'תשלום עבור קייטנת קיץ' });
  res.json({ success: true, message: 'Financial system synced with Ndarim Plus simulation!' });
});

router.get('/status/:studentId', async (req, res) => {
  const result = await new FinanceService((req as any).tenantId).getPaymentStatus(req.params.studentId);
  res.json(result);
});
export default router;
