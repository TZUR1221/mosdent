import { Router } from 'express';
import { APIDocService } from '../modules/api-docs/api-docs.service.js';
const router = Router();

router.get('/seed', async (_req, res) => {
  const docs = new APIDocService('tenant-mosad-01');
  const result = await docs.generateDeveloperKey('key-dev-01');
  res.json({ message: 'Developer Hub Operational', result });
});
export default router;
