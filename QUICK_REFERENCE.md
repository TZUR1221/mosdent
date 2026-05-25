# Mosdent Quick Reference

## Quick Start

```bash
# Install and setup
npm install
cp .env.example .env
npm run dev

# Visit
http://localhost:3000/health
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm test` | Run all tests |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |

## Project Structure

```
src/modules/
├── admin/              # Platform & User Management
├── crm/                # Registration & Candidates
├── forms/              # Form Builder
├── erp/                # Tasks & Inventory
├── finance/            # Charges & Payments
├── pedagogy/           # Grades & Alerts
├── communications/     # Email & Messaging
├── reports/            # Reporting & Export
├── api-docs/           # Developer Center
└── security/           # Audit & Compliance
```

## API Response Format

```json
{
  "success": true|false,
  "statusCode": 200|400|401|403|404|500,
  "message": "Description",
  "data": {...},
  "errors": {...}
}
```

## Authentication

```bash
# Get JWT token (via login endpoint)
Authorization: Bearer <token>

# All requests must include Bearer token
```

## Key Concepts

### Multi-Tenant
- Every database query filtered by `tenantId`
- Complete data isolation
- Subscription tiers: starter, professional, enterprise

### Multi-Institution Staffing
- Single user → Many institutions
- Different role per institution
- Permissions scoped to institution

### RBAC (Role-Based Access Control)
- Composable permission "cubes"
- Roles + Institutions = Permissions
- Checked on every request

### Modules
- 10 independent modules
- Can be packaged à-la-carte
- Communicate via events/APIs
- Each with own service, controller, routes

## Database Models

### Core
- `Tenants` - Organizations
- `Institutions` - Schools/Facilities
- `Users` - System users
- `UserInstitutions` - Staff assignments
- `Roles` - RBAC definitions
- `AuditLogs` - Immutable audit trail
- `Students` - Student records

### Module-Specific
- `RegistrationSubmissions` (CRM)
- `ChargeTokens` (Finance)
- `Grades` (Pedagogy)
- `Attendance` (Pedagogy)
- `AlertRules` (Pedagogy)
- `EmailRecords` (Communications)
- `Tasks` (ERP)

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mosdent
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=min_32_characters_long
JWT_EXPIRE_IN=24h

# External APIs
NDARIM_PLUS_API_KEY=key
```

## Module: Admin

**Features**
- Tenant management
- User management
- Institution hierarchy
- RBAC configuration
- Impersonation

**Key Endpoints**
```
POST   /api/admin/tenants
GET    /api/admin/users
POST   /api/admin/institutions
PUT    /api/admin/roles/:id
```

## Module: CRM

**Features**
- Registration forms (hybrid)
- Anti-duplication system
- Kanban board
- Internal notes (hidden)
- Physical signatures

**Key Endpoints**
```
POST   /api/crm/registrations
GET    /api/crm/kanban
POST   /api/crm/check-duplicates
```

## Module: Finance

**Features**
- Charge tokens
- Ndarim Plus sync (bi-directional)
- Payment tracking
- Financial reports

**Key Endpoints**
```
POST   /api/finance/charge-tokens
GET    /api/finance/families/:id/payments
POST   /api/finance/sync/ndarim
```

## Module: Pedagogy

**Features**
- Student 360 profiles
- Longitudinal tracking
- Automated alerts
- Grade management
- Attendance tracking

**Key Features**
- Point-based alerts (single anomaly)
- Cumulative alerts (trend-based)
- Auto-create tasks for interventions

**Key Endpoints**
```
POST   /api/pedagogy/grades
GET    /api/pedagogy/students/:id
POST   /api/pedagogy/alert-rules
```

## Module: Communications

**Features**
- In-system email
- Digital signatures
- Audit trail
- Family conversations

**Key Endpoints**
```
POST   /api/communications/send-email
GET    /api/communications/mailbox/:userId
```

## Module: ERP

**Features**
- Task management
- Ticketing system
- Inventory management
- SLA tracking

**Key Endpoints**
```
POST   /api/erp/tasks
POST   /api/erp/tickets
```

## Module: Reports

**Features**
- Advanced reporting
- PDF generation
- Excel/CSV export
- Trend analysis

**Key Endpoints**
```
GET    /api/reports/student/:id
GET    /api/reports/export
```

## Module: Security

**Features**
- Audit logging
- CTI integration
- Webhooks
- Compliance reporting

**Key Endpoints**
```
GET    /api/security/audit-trail/:entityId
POST   /api/security/webhooks
```

## Testing

```bash
# All tests
npm test

# Watch mode
npm test:watch

# Specific file
npm test -- admin.service.test.ts

# Coverage
npm test -- --coverage
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

## Debugging

```bash
# Verbose logging
DEBUG=mosdent:* npm run dev

# VS Code Debugger
# Set breakpoints and run with F5
```

## Database Access

```typescript
// Always filter by tenant
await Student.findAll({
  where: { tenantId, institutionId }
});

// Never:
await Student.findAll({
  where: { institutionId }  // Missing tenantId!
});
```

## Code Style

- **Language**: TypeScript (strict)
- **Format**: Prettier (100 char line)
- **Lint**: ESLint
- **Naming**: camelCase (vars), PascalCase (classes)
- **Comments**: JSDoc for public APIs

## Performance Tips

- Use pagination (default 20)
- Index common columns
- Connection pooling (configured)
- Async/await throughout
- Monitor queries > 1000ms

## Useful Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment template |
| `tsconfig.json` | TypeScript config |
| `jest.config.json` | Test config |
| `.eslintrc.json` | Linting rules |
| `.prettierrc.json` | Code format |

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [GETTING_STARTED.md](./docs/GETTING_STARTED.md) | Setup guide |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Database design |
| [MODULE_1_ADMIN.md](./docs/MODULE_1_ADMIN.md) | Admin module |
| [MODULE_2_CRM.md](./docs/MODULE_2_CRM.md) | CRM module |
| [MODULE_5_FINANCE.md](./docs/MODULE_5_FINANCE.md) | Finance module |
| [MODULE_6_PEDAGOGY.md](./docs/MODULE_6_PEDAGOGY.md) | Pedagogy module |

## Troubleshooting

**Database Connection Error**
- Check PostgreSQL running
- Verify .env variables
- Test with: `psql -U postgres`

**JWT Invalid**
- Token expired?
- JWT_SECRET matches?
- Bearer token format?

**Port in Use**
- Change PORT in .env
- Or: `lsof -ti:3000 | xargs kill -9`

**TypeScript Errors**
- Run: `npm run build`
- Check types in src/types/index.ts
- Review tsconfig.json

---

**Print and keep handy!**
**Last Updated**: May 24, 2026
