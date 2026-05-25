# Mosdent Platform Development Instructions

## Project Overview

Mosdent is a comprehensive SaaS platform for managing educational institutions using Node.js, Express, TypeScript, and PostgreSQL. The platform implements a Multi-Tenant architecture with 10 modular business features.

## Code Style & Standards

- **Language**: TypeScript (strict mode enabled)
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: Joi schema validation
- **Logging**: Winston logger
- **Code Format**: Prettier (100 char line width)
- **Linting**: ESLint with TypeScript support

## File Organization

```
src/
├── modules/         # 10 business modules with their services
├── config/          # Configuration, database, logger
├── middlewares/     # Auth, error handling
├── types/           # TypeScript interfaces
├── utils/           # Helpers and validators
├── routes/          # API route definitions
├── app.ts           # Express app setup
└── index.ts         # Entry point
```

## Development Workflow

1. Create feature branch from `develop`
2. Implement changes following project structure
3. Write tests for new functionality
4. Run linting and formatting
5. Create pull request with clear description

## Key Architecture Patterns

### Multi-Tenant Isolation
- Every database query filters by `tenantId`
- TenantID derived from JWT token
- Request context includes tenant information

### Module Structure
Each module (admin, crm, finance, etc.) follows:
- `module.service.ts` - Business logic
- `module.controller.ts` - Request handlers
- `module.routes.ts` - API endpoints
- `module.types.ts` - TypeScript interfaces

### Error Handling
- Use `ApiError` class for API errors
- Include HTTP status code and error details
- All errors logged with request context
- Consistent error response format

### Database Access
- Use Sequelize models
- Always include `tenantId` in queries
- Use parameterized queries (Sequelize handles this)
- Index frequently queried fields

## API Response Format

All endpoints return:
```json
{
  "success": true|false,
  "statusCode": 200|400|401|403|404|500,
  "message": "Description",
  "data": {...},
  "errors": {...}
}
```

## Environment Variables

See `.env.example` for all required variables. Critical ones:
- `DB_*` - Database connection
- `JWT_SECRET` - Min 32 characters
- `NDARIM_PLUS_API_KEY` - Finance integration
- `NODE_ENV` - development|production

## Testing

- Jest for unit and integration tests
- Test files: `*.test.ts` or `*.spec.ts`
- Mock database calls in tests
- Aim for 80%+ code coverage

## Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

## Performance Guidelines

- Use connection pooling (configured)
- Implement pagination (limit 20 default)
- Index common query fields
- Cache when appropriate
- Async/await throughout

## Security Requirements

- Validate all inputs with Joi
- Sanitize before database queries
- Hash passwords with bcryptjs
- Log all sensitive operations
- Check permissions before operations
- No secrets in code or logs

## Documentation

- Update docs/ for API changes
- Document new modules in docs/
- Include JSDoc comments for complex functions
- Keep README.md current

## Common Tasks

### Adding New Module
1. Create folder in `src/modules/`
2. Add service, controller, routes files
3. Define TypeScript interfaces in types/
4. Add database models in config/database.ts
5. Create API routes
6. Document in docs/

### Creating Database Migration
- Models auto-sync in development
- For production, create migration files
- Run migrations before deployment

### Adding API Endpoint
1. Create controller method
2. Add validation schema
3. Define route
4. Add to routes file
5. Document endpoint

## Useful Commands

```bash
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run lint         # Check code style
npm run format       # Auto-format code
npm test             # Run tests
npm run test:watch  # Tests in watch mode
```

## Module Dependencies

Modules can depend on:
- Other modules (via event emitters or service calls)
- Database models
- Utilities and helpers
- External APIs (finance, communications, etc.)

Avoid circular dependencies.

## Debugging

Enable debug logs:
```bash
DEBUG=mosdent:* npm run dev
```

Use VS Code debugger - configuration in `.vscode/launch.json`

## Database Queries Best Practices

```typescript
// ✓ Good - includes tenantId
await Student.findAll({
  where: { tenantId, institutionId },
  limit: 20,
  offset: 0
});

// ✗ Bad - missing tenant filter
await Student.findAll({
  where: { institutionId }
});
```

## Integration Testing

Test module interactions:
- CRM → Finance (registration acceptance)
- Finance → Ndarim Plus (sync)
- Pedagogy → Communications (alerts)
- Any → Security (audit logging)

## Performance Monitoring

Log slow queries:
```typescript
if (duration > 1000) {
  logger.warn('Slow query', { duration, query });
}
```

## When to Create New Tables

Tables needed for:
- New module-specific data
- Many-to-many relationships
- Historical/audit data
- Configuration data

Reuse existing JSONB fields for flexible data.

## Code Review Checklist

- [ ] TypeScript compiles without errors
- [ ] Follows code style (ESLint/Prettier)
- [ ] Tests written and passing
- [ ] TenantID included in queries
- [ ] Input validation present
- [ ] Error handling appropriate
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Secrets not in code
- [ ] Performance acceptable

---

**Version**: 4.0.0
**Last Updated**: May 24, 2026
