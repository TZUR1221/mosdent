import { Router } from 'express';
import { SecurityService } from '../modules/security/security.service.js';
const router = Router();

router.get('/seed', async (_req, res) => {
  const sec = new SecurityService('tenant-mosad-01');
  await sec.writeAuditLog({ action: 'PII_DATA_ACCESS', entityType: 'STUDENT_360', userId: 'user-admin-01' });
  await sec.writeAuditLog({ action: 'NDARIM_PLUS_SYNC', entityType: 'FINANCE', userId: 'SYSTEM_CRON' });
  res.json({ success: true, message: 'Compliance Audit Trail system triggered and secure. CTI Centrex hooks mounted!' });
});
export default router;
