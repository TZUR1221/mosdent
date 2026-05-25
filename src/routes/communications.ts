import { Router } from 'express';
import { CommunicationsService } from '../modules/communications/communications.service.js';
const router = Router();

router.get('/seed', async (_req, res) => {
  const comms = new CommunicationsService('tenant-mosad-01');
  await comms.sendSystemEmail({ id: 'msg-01', recipient: 'parent@mosdent.com', subject: 'עדכון דוח תקופתי חכמת שלמה', body: 'שלום וברכה, מצורף עדכון פדגוגי', signature: 'ישראל ישראלי - מנהל על' });
  res.json({ success: true, message: 'Communications Module Operational & Seeded!' });
});
export default router;
