# Getting Started with Mosdent

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14.0 or higher
- Git

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd mosdent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb mosdent

# Run migrations (when available)
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 5. Build Project
```bash
npm run build
```

### 6. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Verification

Test the health endpoint:
```bash
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-05-24T10:30:00Z",
  "version": "4.0.0"
}
```

## Project Structure

```
mosdent/
├── src/                         # Source code
│   ├── modules/                 # 10 business modules
│   ├── config/                  # Configuration
│   ├── middlewares/             # Express middlewares
│   ├── types/                   # TypeScript interfaces
│   ├── utils/                   # Helper functions
│   ├── app.ts                   # Express app setup
│   └── index.ts                 # Entry point
├── tests/                       # Test files
├── docs/                        # Documentation
├── package.json
├── tsconfig.json
├── jest.config.json
├── .env.example
├── .gitignore
└── README.md
```

## Key Configuration Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mosdent
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE_IN=24h

# Email (optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password

# External APIs
NDARIM_PLUS_API_URL=https://api.ndarim-plus.com
NDARIM_PLUS_API_KEY=your_api_key
```

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Database Schema

The system uses 15+ core tables:

```sql
-- Core tenant structure
tenants
institutions
users
user_institutions
roles

-- Student management
students

-- Audit and security
audit_logs

-- Module-specific tables created per module
-- (registrations, charge_tokens, grades, etc.)
```

Sequelize manages migrations automatically in development mode.

## API Structure

All APIs return consistent response format:

```json
{
  "success": true|false,
  "statusCode": 200|400|401|403|404|500,
  "message": "Human readable message",
  "data": {...},
  "errors": {...}
}
```

### Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## First Steps

### 1. Create a Tenant
```bash
# First, you need a JWT token (usually from registration/login)
# For testing, you can create one manually

curl -X POST http://localhost:3000/api/admin/tenants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test School Network",
    "legalName": "Test School Network Ltd",
    "subscriptionTier": "professional"
  }'
```

### 2. Create an Institution
```bash
curl -X POST http://localhost:3000/api/admin/institutions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "<tenant_id>",
    "name": "Primary School A",
    "institutionType": "school",
    "principalName": "John Smith",
    "city": "Jerusalem",
    "email": "school@example.com"
  }'
```

### 3. Create a User
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "password": "SecurePassword123!",
    "roles": ["role_teacher"]
  }'
```

### 4. Create a Registration Form
```bash
curl -X POST http://localhost:3000/api/crm/forms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "institutionId": "<institution_id>",
    "title": "Student Registration 2024",
    "description": "Registration form for new students",
    "customFields": [
      {
        "name": "spiritualBackground",
        "label": "Spiritual Background",
        "type": "select",
        "options": ["Traditional", "Modern", "Progressive"]
      }
    ]
  }'
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Verify PostgreSQL is running
- Check DB_HOST and DB_PORT in .env
- Ensure database exists: `psql -l | grep mosdent`

### JWT Token Invalid
```
Error: Token verification failed
```
- Check JWT_SECRET matches in .env
- Verify token hasn't expired
- Token must be in format: `Bearer <token>`

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
- Change PORT in .env or
- Kill process: `lsof -ti:3000 | xargs kill -9`

### Module Import Errors
```
Error: Cannot find module '@/types'
```
- Ensure tsconfig.json paths are correct
- Run `npm run build` to check TypeScript compilation

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- src/modules/crm/crm.service.test.ts
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Logging

Logs are stored in `./logs` directory:
- `error.log` - Error messages only
- `combined.log` - All log levels

In development, logs also print to console with colors.

Log level controlled by `LOG_LEVEL` environment variable:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General information
- `debug` - Detailed debug info

## Next Steps

1. **Review Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Module Documentation**: Review individual module docs
3. **API Endpoints**: See API Reference in [docs/](./docs/)
4. **Security**: Review [MODULE_10_SECURITY.md](./docs/MODULE_10_SECURITY.md)

## Support & Resources

- **Documentation**: `/docs` folder
- **API Docs**: Available at `/api/docs` when enabled
- **Examples**: See `/tests` for example requests/responses
- **Issues**: Check existing issues or create new one

## Deployment

For production deployment:

1. Build the project: `npm run build`
2. Set `NODE_ENV=production`
3. Use process manager (PM2, forever, etc.)
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure backups for PostgreSQL
7. Set up monitoring and alerting

See deployment guides in `docs/DEPLOYMENT.md` (coming soon)

---

**Last Updated**: May 24, 2026
**Version**: 4.0.0
