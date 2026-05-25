import { Router } from 'express';
import { ERPService } from '../modules/erp/erp.service.js';
const router = Router();

router.get('/tasks/seed', async (_req, res) => {
  const erp = new ERPService('tenant-mosad-01');
  await erp.createTask({
    id: 'tsk-101',
    title: 'חזרה להורה של המועמד יוסי כהן',
    description: 'ההורה ביקש לברר מתי נערכים המבחנים בכתב לתלמוד תורה',
    assignedTo: 'user-admin-01',
    priority: 'high'
  });
  res.json({ success: true, message: 'ERP Operational Logistics Setup Complete!' });
});

router.get('/tasks', async (req, res) => {
  const result = await new ERPService((req as any).tenantId).getTasks();
  res.json(result);
});

export default router;
