# 🎓 Mosdent Platform v4.0

Mosdent is a sophisticated SaaS platform for managing educational institutions, communities, and national education networks. Built with a modular Multi-Tenant architecture supporting complete data isolation and flexible feature packaging.

## 📋 Features Overview

### 10 Core Modules

1. **🏢 Platform Administration & Multi-Tenant Management** - SaaS admin, tenant isolation, Multi-Institution Staffing, RBAC
2. **📝 CRM & Candidate Journey** - Registration module with hybrid forms, anti-duplication, Kanban board
3. **📄 Form Builder** - Dynamic form creation and targeted distribution
4. **🛠️ Internal ERP & Logistics** - Task management, ticketing system, inventory management
5. **💳 Financial Management** - Ndarim Plus integration, automated charge tokens, two-way sync
6. **📈 Pedagogy & Student 360** - Comprehensive student profiles, automated alert system, longitudinal tracking
7. **📬 Email Sync & Communication** - In-system email with digital signatures, audit trails
8. **🗃️ Reports & Data Export** - Advanced reporting, PDF generation, Excel/CSV export
9. **⚙️ API Documentation Center** - Developer center with full API documentation
10. **🔒 Security & Privacy** - Audit trails, CTI integration, webhooks, compliance with Personal Information Protection Law

## 🏗️ Project Structure

```
mosdent/
├── src/
│   ├── modules/
│   │   ├── admin/              # Module 1: Platform Administration
│   │   ├── crm/                # Module 2: CRM & Registration
│   │   ├── forms/              # Module 3: Form Builder
│   │   ├── erp/                # Module 4: ERP & Logistics
│   │   ├── finance/            # Module 5: Financial Management
│   │   ├── pedagogy/           # Module 6: Pedagogy & Student 360
│   │   ├── communications/     # Module 7: Email & Communication
│   │   ├── reports/            # Module 8: Reports & Export
│   │   ├── api-docs/           # Module 9: API Documentation
│   │   └── security/           # Module 10: Security & Privacy
│   ├── config/                 # Database, logger, environment setup
│   ├── middlewares/            # Auth, RBAC, error handling
│   ├── types/                  # TypeScript interfaces and types
│   ├── utils/                  # Helper functions and validators
│   ├── routes/                 # API routes
│   └── index.ts                # Application entry point
├── tests/                      # Unit and integration tests
├── docs/                       # Documentation
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mosdent
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

4. Build the project
```bash
npm run build
```

5. Run the development server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 Key Concepts

### Multi-Tenant Architecture
- Complete data isolation at the database level using `TenantID`
- Every record includes tenant isolation
- Secure tenant context from JWT claims

### Multi-Institution Staffing
- Single employee assigned to multiple institutions
- Unified permission matrix
- Cross-institution visibility based on roles

### RBAC (Role-Based Access Control)
- Dynamic permission stacking (composable "cubes")
- Support for multiple roles per user (teacher + parent)
- Institution-specific role scoping

### Anti-Duplication System
- Real-time ID/phone duplicate detection
- Smart pop-up suggestions linking to existing family records
- Prevents duplicate registrations

## 🗄️ Database Schema

The platform uses PostgreSQL with the following core entities:

- **Tenants** - Organization accounts
- **Users** - System users with multi-institution assignments
- **Students** - Student records with 360 profiles
- **Families** - Family/guardian records
- **Institutions** - Educational facilities
- **Forms** - Dynamic form definitions
- **Submissions** - Form submission records
- **Communications** - Email and messaging logs
- **Financials** - Charge tokens, payments, balances
- **AuditLogs** - Complete audit trail

## 🔐 Security Features

- JWT-based authentication
- RBAC with granular permissions
- Audit trail logging (24-month retention)
- Data encryption at rest and in transit
- PII protection compliance
- Impersonation logging with strict documentation
- CTI integration for call handling

## 📡 API Integration

### Ndarim Plus Integration
- Automatic customer record creation when student accepted
- Bi-directional sync of payments and charges
- Real-time balance updates

### Webhooks & Automation
- Event-based triggers to Make/n8n
- Automatic task creation based on defined rules
- Longitudinal tracking with auto-alerts

## 🛠️ Development

### Available Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm test             # Run tests
npm test:watch      # Run tests in watch mode
npm run lint        # Lint TypeScript files
npm run format      # Format code with Prettier
```

### Environment Variables

See `.env.example` for all configuration options.

## 📖 Module Documentation

Detailed documentation for each module is available in the `docs/` directory.

## 🤝 Contributing

Please follow the existing code style and ensure all tests pass before submitting a pull request.

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions, please contact the development team.

---

**Last Updated:** May 24, 2026
**Version:** 4.0.0
