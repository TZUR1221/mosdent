# Mosdent Platform Architecture

## Overview

Mosdent v4.0 is built on a modular, Multi-Tenant architecture using Node.js with Express.js backend and PostgreSQL database.

### Key Architectural Principles

1. **Multi-Tenant Isolation**: Complete data isolation at database level using `TenantID`
2. **Modular Design**: 10 independent modules that can be packaged á-la-carte
3. **API-First**: All functionality accessible via REST APIs
4. **Security-First**: RBAC, audit trails, and PII protection built-in
5. **Scalability**: Connection pooling, caching layer ready for Redis

## Project Structure

```
src/
├── modules/                 # 10 Core modules
│   ├── admin/              # Platform administration
│   ├── crm/                # Customer relationship management
│   ├── forms/              # Form builder
│   ├── erp/                # Enterprise resource planning
│   ├── finance/            # Financial management
│   ├── pedagogy/           # Educational tracking
│   ├── communications/     # Email and messaging
│   ├── reports/            # Reporting and export
│   ├── api-docs/           # Developer documentation
│   └── security/           # Security and compliance
├── config/                 # Configuration files
│   ├── config.ts           # Environment config
│   ├── logger.ts           # Winston logger setup
│   └── database.ts         # Sequelize models
├── middlewares/            # Express middlewares
│   ├── auth.ts             # JWT authentication
│   └── errorHandler.ts     # Error handling
├── types/                  # TypeScript interfaces
├── utils/                  # Helper functions
├── routes/                 # API routes
├── app.ts                  # Express app setup
└── index.ts                # Entry point
```

## Technology Stack

- **Backend Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: OpenAPI/Swagger (ready to integrate)
- **Logging**: Winston
- **Validation**: Joi
- **Security**: bcryptjs, helmet, CORS

## Database Schema

### Core Entities

- **Tenants**: Organization accounts with subscription tiers
- **Institutions**: Physical locations/schools within tenant
- **Users**: System users with multi-institution assignments
- **UserInstitutions**: Junction table for many-to-many staff assignments
- **Roles**: RBAC role definitions
- **Students**: Student records with profiles
- **AuditLogs**: Immutable audit trail

### Extension Entities (Module-Specific)

- Module-specific entities created per module needs
- All inherit TenantID for isolation

## Authentication Flow

1. User logs in with email/password
2. System validates credentials
3. JWT token issued containing:
   - `userId`
   - `tenantId`
   - `email`
   - `roles`
   - `institutions` (array of institution IDs)
   - `permissions` (derived from roles)
4. All subsequent requests include Bearer token
5. Middleware validates token and extracts context
6. Tenant context automatically scoped to requests

## RBAC (Role-Based Access Control)

### Dynamic Permission System

Roles are composed of permission "cubes":
- Each cube represents an action on a resource
- Users can have multiple roles
- Roles can be scoped to specific institutions
- Permissions inherited from all user roles

### Standard Roles

- **Super Admin**: Full system access
- **Network Manager**: Network-wide access
- **Institution Manager**: Institution-specific access
- **Teacher**: Educational staff access
- **Parent**: Limited parent-only access
- **Secretary**: Administrative staff access

## Multi-Institution Staffing

A single user can be assigned to multiple institutions:

```
User → UserInstitution (many) → Institution
         ├── role
         └── permissions
```

When user switches institutions:
1. Context updated with new institution ID
2. Permissions revalidated based on role in that institution
3. Database queries filtered by both tenantId AND institutionId

## API Response Format

All API responses follow consistent format:

```json
{
  "success": true|false,
  "statusCode": 200|400|401|403|404|500,
  "message": "Human readable message",
  "data": {...},
  "errors": {...}
}
```

## Error Handling

- All errors caught and logged
- User-friendly error messages returned
- Stack traces logged but not exposed
- 24-month audit trail of all errors and issues

## Integration Points

### Ndarim Plus (Finance Module)
- REST API for charge token sync
- Bi-directional payment status sync
- Automatic customer record creation

### Webhooks & Make/n8n (Security Module)
- Event-based triggers to external systems
- Task creation automation
- User notifications

### CTI Integration (Security Module)
- Incoming call pop-ups with family info
- Automatic attendance marking from phone

## Deployment Considerations

- Connection pooling configured (10 max, 2 min)
- Winston logging to files and console
- Graceful shutdown on SIGTERM/SIGINT
- Health check endpoint at `/health`
- API versioning ready

## Security Measures

1. **Data Isolation**: TenantID on every query
2. **Authentication**: JWT with configurable expiry
3. **Authorization**: RBAC with granular permissions
4. **Audit Trail**: Immutable 24-month logs
5. **Encryption**: Passwords hashed with bcryptjs
6. **API Security**: CORS, Helmet headers
7. **Input Validation**: Joi schema validation
8. **Impersonation**: Logged admin impersonation only

## Performance Optimizations

- Database indexes on common querction pooling
- Response pagination built-in
- Async/await pattern throughout
- Ready for Redis caching layer

## Future Enhancements

- WebSocket support for real-time notifications
- GraphQL API layer
- File upload/storage integration
- PDF generation for documents
- SMS and push notification channels
