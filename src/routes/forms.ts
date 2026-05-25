import { Router } from 'express';
import { FormsService } from '../modules/forms/forms.service.js';
const router = Router();

router.get('/templates/seed', async (_req, res) => {
  const forms = new FormsService('tenant-mosad-01');
  await forms.createFormTemplate({
    id: 'form-reg-2026',
    title: 'טופס רישום דיגיטלי - שנת לימודים הצע"ו',
    fields: [
      { name: 'fullName', type: 'text', label: 'שם מלא של המועמד' },
      { name: 'hasBackground', type: 'boolean', label: 'האם למד במסגרת תורנית קודמת' }
    ]
  });
  res.json({ success: true, message: 'Dynamic Form Engine Initialized!' });
});

router.get('/templates', async (req, res) => {
  const result = await new FormsService((req as any).tenantId).getFormTemplates();
  res.json(result);
});

export default router;
