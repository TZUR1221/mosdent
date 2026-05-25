import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/config.js';
import logger from './config/logger.js';
import { sequelize } from './config/database.js';
import { authenticateToken, validateTenantContext, impersonationMiddleware } from './middlewares/auth.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

import adminRouter from './routes/admin.js';
import crmRouter from './routes/crm.js';
import financeRouter from './routes/finance.js';
import pedagogyRouter from './routes/pedagogy.js';
import formsRouter from './routes/forms.js';
import erpRouter from './routes/erp.js';
import communicationsRouter from './routes/communications.js';
import reportsRouter from './routes/reports.js';
import apiDocsRouter from './routes/api-docs.js';
import securityRouter from './routes/security.js';

class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet({ contentSecurityPolicy: false }));
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    this.app.use((req, res, next) => {
      const rawPath = req.path.toLowerCase();
      const normalizedPath = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;

      const publicPaths = [
        '/health', '/api/version', '/dashboard',
        '/api/admin/tenants', '/api/admin/tenants/seed', '/api/admin/users/seed', '/api/admin/institutions/seed', '/api/admin/login-dev',
        '/api/crm/register', '/api/crm/seed'
      ];
      const isPublic = publicPaths.some(path => normalizedPath === path || normalizedPath.startsWith(path + '/'));

      if (isPublic) return next();

      authenticateToken(req, res, () => {
        validateTenantContext(req, res, () => {
          impersonationMiddleware(req, res, next);
        });
      });
    });
  }

  private initializeRoutes(): void {
    this.app.get('/health', (_req, res) => { res.json({ status: 'ok', version: '4.0.0' }); });
    this.app.get('/api/version', (_req, res) => { res.json({ version: '4.0.0', name: 'Mosdent' }); });
    
    this.app.use('/api/admin', adminRouter);
    this.app.use('/api/crm', crmRouter);
    this.app.use('/api/finance', financeRouter);
    this.app.use('/api/pedagogy', pedagogyRouter);
    this.app.use('/api/forms', formsRouter);
    this.app.use('/api/erp', erpRouter);
    this.app.use('/api/communications', communicationsRouter);
    this.app.use('/api/reports', reportsRouter);
    this.app.use('/api/docs', apiDocsRouter);
    this.app.use('/api/security', securityRouter);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async connect(): Promise<void> {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established');

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Tenants" (
          "id" VARCHAR(255) PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "status" VARCHAR(50) DEFAULT 'active',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Users" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "name" VARCHAR(255) NOT NULL,
          "email" VARCHAR(255) NOT NULL,
          "role" VARCHAR(50),
          "status" VARCHAR(50) DEFAULT 'active',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Institutions" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "name" VARCHAR(255) NOT NULL,
          "type" VARCHAR(100),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "UserInstitutions" (
          "id" VARCHAR(255) PRIMARY KEY,
          "userId" VARCHAR(255) REFERENCES "Users"("id") ON DELETE CASCADE,
          "institutionId" VARCHAR(255) REFERENCES "Institutions"("id") ON DELETE CASCADE,
          "role" VARCHAR(50),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "Registrations" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "institutionId" VARCHAR(255) REFERENCES "Institutions"("id") ON DELETE CASCADE,
          "childFirstName" VARCHAR(255) NOT NULL,
          "childLastName" VARCHAR(255) NOT NULL,
          "childIdNumber" VARCHAR(255) NOT NULL,
          "dateOfBirth" DATE,
          "requestedGrade" VARCHAR(50),
          "parentName" VARCHAR(255) NOT NULL,
          "parentPhone" VARCHAR(255) NOT NULL,
          "parentEmail" VARCHAR(255),
          "status" VARCHAR(50) DEFAULT 'submitted',
          "internalNotes" TEXT,
          "customAnswers" JSONB DEFAULT '{}'::jsonb,
          "signatureImage" TEXT,
          "submittedAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          UNIQUE ("tenantId", "childIdNumber")
        );

        CREATE TABLE IF NOT EXISTS "Students" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "institutionId" VARCHAR(255) REFERENCES "Institutions"("id") ON DELETE CASCADE,
          "firstName" VARCHAR(255) NOT NULL,
          "lastName" VARCHAR(255) NOT NULL,
          "idNumber" VARCHAR(255) NOT NULL,
          "classGrade" VARCHAR(50),
          "attendanceRate" NUMERIC(5,2) DEFAULT 100.00,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Charges" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "studentId" VARCHAR(255) REFERENCES "Students"("id") ON DELETE CASCADE,
          "amount" NUMERIC(10,2) NOT NULL,
          "description" VARCHAR(255),
          "status" VARCHAR(50) DEFAULT 'pending',
          "ndarimToken" VARCHAR(255),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Grades" (
          "id" SERIAL PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "studentId" VARCHAR(255) REFERENCES "Students"("id") ON DELETE CASCADE,
          "subject" VARCHAR(255) NOT NULL,
          "grade" INT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Forms" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "title" VARCHAR(255) NOT NULL,
          "fields" JSONB NOT NULL DEFAULT '[]'::jsonb,
          "targetAudience" JSONB DEFAULT '{}'::jsonb,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Tasks" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "assignedTo" VARCHAR(255),
          "status" VARCHAR(50) DEFAULT 'open',
          "priority" VARCHAR(50) DEFAULT 'medium',
          "linkedEntityType" VARCHAR(50),
          "linkedEntityId" VARCHAR(255),
          "slaDueAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "Emails" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "recipient" VARCHAR(255) NOT NULL,
          "subject" VARCHAR(255) NOT NULL,
          "body" TEXT,
          "signature" VARCHAR(255) NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "ApiKeys" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "keySecret" VARCHAR(255) NOT NULL,
          "status" VARCHAR(50) DEFAULT 'active',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "AuditLogs" (
          "id" VARCHAR(255) PRIMARY KEY,
          "tenantId" VARCHAR(255) REFERENCES "Tenants"("id") ON DELETE CASCADE,
          "action" VARCHAR(255) NOT NULL,
          "entityType" VARCHAR(255) NOT NULL,
          "entityId" VARCHAR(255),
          "changes" JSONB DEFAULT '{}'::jsonb,
          "userId" VARCHAR(255),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
        ALTER TABLE "Registrations" ADD COLUMN IF NOT EXISTS "customAnswers" JSONB DEFAULT '{}'::jsonb;
        ALTER TABLE "Registrations" ADD COLUMN IF NOT EXISTS "signatureImage" TEXT;
        ALTER TABLE "Registrations" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS "idx_registrations_tenant_institution_status"
          ON "Registrations" ("tenantId", "institutionId", "status");
        CREATE INDEX IF NOT EXISTS "idx_tasks_tenant_status"
          ON "Tasks" ("tenantId", "status");
        CREATE INDEX IF NOT EXISTS "idx_auditlogs_tenant_created"
          ON "AuditLogs" ("tenantId", "createdAt");
      `);
      logger.info('Database tables ensured for Mosdent core MVP.');
    } catch (error) {
      logger.error('Database setup failed', { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> { await sequelize.close(); }
  public listen(): void { this.app.listen(config.server.port, () => { logger.info('Server active on port ' + config.server.port); }); }
  public getApp(): Express { return this.app; }
}
export default App;
