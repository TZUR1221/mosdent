import { Router, Request, Response } from 'express';
import { AdminService } from '../modules/admin/admin.service.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const router = Router();

/**
 * קריאת API ליצירת ארגון/בית ספר חדש (Tenant)
 * כתובת הגישה הרשמית: POST http://localhost:3000/api/admin/tenants
 */
router.post('/tenants', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminService = new AdminService('system_init');
    const result = await adminService.manageTenants('CREATE', req.body);
    
    res.status(result.success ? 201 : 400).json(result);
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
});

/**
 * נתיב עזר זמני לדפדפן - הקמת הארגון הראשון ברשת בלחיצת כפתור
 * כתובת הגישה: GET http://localhost:3000/api/admin/tenants/seed
 */
router.get('/tenants/seed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const adminService = new AdminService('system_init');
    const mockTenant = {
      id: 'tenant-mosad-01',
      name: 'רשת מוסדות חינוך מוסדנט המרכזית',
      status: 'active'
    };
    
    const result = await adminService.manageTenants('CREATE', mockTenant);
    res.status(result.success ? 201 : 400).json({ message: 'Seed route triggered successfully!', databaseResponse: result });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
});

/**
 * קריאת API לשליפת כל הארגונים הקיימים במערכת
 * כתובת הגישה: GET http://localhost:3000/api/admin/tenants
 */
router.get('/tenants', async (_req: Request, res: Response): Promise<void> => {
  try {
    const adminService = new AdminService('system_init');
    const result = await adminService.manageTenants('GET_ALL', null);
    
    res.status(result.success ? 200 : 400).json(result);
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
});

/**
 * נתיב עזר זמני לדפדפן - הקמת משתמש מנהל המערכת הראשון (Super Admin) משויך לארגון
 * כתובת הגישה: GET http://localhost:3000/api/admin/users/seed
 */
router.get('/users/seed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const adminService = new AdminService('tenant-mosad-01');
    const mockUser = {
      id: 'user-admin-01',
      name: 'ישראל ישראלי מנהל על',
      email: 'admin@mosdent.com',
      role: 'super_admin'
    };
    
    const result = await adminService.manageUsers('CREATE_EMPLOYEE', mockUser);
    res.status(result.success ? 201 : 400).json({ message: 'Admin user seed triggered successfully!', databaseResponse: result });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
});

/**
 * נתיב עזר זמני לדפדפן - הקמת המוסד הפיזי הראשון בתוך הרשת (תלמוד תורה)
 * כתובת הגישה: GET http://localhost:3000/api/admin/institutions/seed
 */
router.get('/institutions/seed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const adminService = new AdminService('tenant-mosad-01');
    const mockInstitution = {
      id: 'inst-cheder-01',
      name: 'תלמוד תורה חכמת שלמה - בני ברק',
      type: 'talmud_torah'
    };

    const result = await adminService.manageInstitutions('CREATE', mockInstitution);
    res.status(result.success ? 201 : 400).json({ message: 'Institution seed completed!', databaseResponse: result });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
});

/**
 * סימולציית התחברות מהירה למפתחים - הפקת מפתח אבטחה חתום (JWT Token) למנהל העל
 * כתובת הגישה: GET http://localhost:3000/api/admin/login-dev
 */
router.get('/login-dev', async (_req: Request, res: Response): Promise<void> => {
  try {
    // יצירת מבנה ההרשאות והנתונים בדיוק כפי שמנגנון ה-auth.ts שלנו מצפה לקבל
    const userClaims = {
      userId: 'user-admin-01',
      tenantId: 'tenant-mosad-01',
      roles: ['super_admin'],
      permissions: ['admin:*', 'crm:*', 'finance:*', 'pedagogy:*']
    };

    // חתימה דיגיטלית על המפתח באמצעות הסוד המאובטח שלנו מה-.env
    const token = jwt.sign(userClaims, config.jwt.secret, { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      message: 'Authentication successful! Use this token for private routes.',
      token: `Bearer ${token}`
    });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
});

export default router;