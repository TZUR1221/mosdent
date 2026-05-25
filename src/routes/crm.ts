import { Router } from 'express';
import { CRMService } from '../modules/crm/crm.service.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || req.body.tenantId || 'tenant-mosad-01';
    const result = await new CRMService(tenantId).submitRegistration(req.body);
    res.status(result.success ? 201 : 409).json(result);
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/duplicates', async (req, res) => {
  try {
    const result = await new CRMService((req as any).tenantId).findDuplicate(
      req.query.childIdNumber as string | undefined,
      req.query.parentPhone as string | undefined
    );
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/seed', async (_req, res) => {
  try {
    const crm = new CRMService('tenant-mosad-01');
    await crm.submitRegistration({ institutionId: 'inst-cheder-01', childFirstName: 'ישראל', childLastName: 'מאיר', childIdNumber: '322111454', requestedGrade: 'כיתה א', parentName: 'יעקב מאיר', parentPhone: '0527111111' });
    await crm.submitRegistration({ institutionId: 'inst-cheder-01', childFirstName: 'שלמה', childLastName: 'זלמן', childIdNumber: '211334455', requestedGrade: 'כיתה א', parentName: 'חיים זלמן', parentPhone: '0548444444' });
    
    const all: any = await crm.getAdvancedKanban('inst-cheder-01');
    if(all.stages.submitted[0]) await crm.updateCandidateStatus(all.stages.submitted[0].id, 'interview');
    res.json({ success: true, message: 'CRM Engine Fully Synced!' });
  } catch(e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/kanban/:institutionId', async (req, res) => {
  const result = await new CRMService((req as any).tenantId).getAdvancedKanban(req.params.institutionId);
  res.json(result);
});

router.get('/registrations/:id', async (req, res) => {
  const result = await new CRMService((req as any).tenantId).getRegistration(req.params.id);
  res.status(result.success ? 200 : 404).json(result);
});

router.patch('/registrations/:id/status', async (req, res) => {
  const result = await new CRMService((req as any).tenantId).updateCandidateStatus(req.params.id, req.body.status);
  res.status(result.success ? 200 : 400).json(result);
});

router.post('/registrations/:id/internal-notes', async (req, res) => {
  const result = await new CRMService((req as any).tenantId).appendInternalNote(req.params.id, req.body.note);
  res.status(result.success ? 200 : 404).json(result);
});

export default router;
