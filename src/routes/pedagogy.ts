import { Router } from 'express';
import { PedagogyService } from '../modules/pedagogy/pedagogy.service.js';
const router = Router();

router.get('/profile/seed', async (_req, res) => {
  const ped = new PedagogyService('tenant-mosad-01');
  await ped.createStudent({ id: 'stud-01', institutionId: 'inst-cheder-01', firstName: 'משה', lastName: 'שלום', idNumber: '555444332', classGrade: 'כיתה ה' });
  await ped.recordGrade({ studentId: 'stud-01', subject: 'גמרא ברכות', grade: 85 });
  const alertCheck = await ped.recordGrade({ studentId: 'stud-01', subject: 'הלכות שבת', grade: 52 });
  
  res.json({ success: true, message: 'Longitudinal Student 360 Profile seeded!', alertSimulation: alertCheck });
});

router.get('/profile/:studentId', async (req, res) => {
  const result = await new PedagogyService((req as any).tenantId).getStudentProfile360(req.params.studentId);
  res.json(result);
});
export default router;
