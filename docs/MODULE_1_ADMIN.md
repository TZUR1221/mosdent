# Module 1: Admin & Platform Management

## Overview
Handles tenant management, user administration, multi-institution staffing, and system configuration.

## Key Features

### 1.1 Multi-Tenant Architecture
- Complete data isolation at database level
- TenantID on every record
- Tenant-scoped database queries
- Separate subscription tiers

### 1.2 Multi-Institution Staffing
Single employee assigned to multiple institutions:
- User has one profile in system
- UserInstitution junction table for assignments
- Role and permissions per institution
- Cross-institution visibility based on permissions

### 1.3 User Management
```
Hierarchy:
- Super Admin
  ├─ Network Manager
  │  ├─ Institution Manager
  │  └─ Institution Secretary
  ├─ System User
  └─ End User (Teacher, Parent, etc)
```

### 1.4 Permission Matrix
- Super Admin: Creates network managers, manages global settings
- Network Manager: Creates institution managers, institution-wide settings
- Institution Manager: Creates staff, institution settings
- Secretary: (Conditional) Data entry for employee cards

## API Endpoints

### Tenant Management
```
POST   /api/admin/tenants               # Create tenant (super admin only)
GET    /api/admin/tenants/:id           # Get tenant details
PUT    /api/admin/tenants/:id           # Update tenant settings
DELETE /api/admin/tenants/:id           # Deactivate tenant
```

### User Management
```
POST   /api/admin/users                 # Create user
GET    /api/admin/users                 # List users (scoped to tenant)
GET    /api/admin/users/:id             # Get user details
PUT    /api/admin/users/:id             # Update user
DELETE /api/admin/users/:id             # Deactivate user
POST   /api/admin/users/:id/assignments # Assign to institutions
```

### Institution Management
```
POST   /api/admin/institutions          # Create institution
GET    /api/admin/institutions          # List institutions
GET    /api/admin/institutions/:id      # Get details
PUT    /api/admin/institutions/:id      # Update institution
DELETE /api/admin/institutions/:id      # Deactivate
```

### Role & Permission Management
```
POST   /api/admin/roles                 # Create role
GET    /api/admin/roles                 # List roles
PUT    /api/admin/roles/:id             # Update role
POST   /api/admin/roles/:id/permissions # Assign permissions
DELETE /api/admin/roles/:id             # Delete role
```

### Impersonation
```
POST   /api/admin/impersonate/:userId   # Start impersonation session
```

## Data Models

### Tenant
```typescript
{
  id: UUID (PK)
  name: string
  legalName: string
  subscriptionTier: 'starter' | 'professional' | 'enterprise'
  isActive: boolean
  maxInstitutions: number
  maxUsers: number
  features: JSON
  createdAt: Date
  updatedAt: Date
}
```

### User
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  email: string (unique within tenant)
  firstName: string
  lastName: string
  passwordHash: string
  isActive: boolean
  lastLoginAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### UserInstitution
```typescript
{
  id: UUID (PK)
  userId: UUID (FK)
  institutionId: UUID (FK)
  roleId: UUID (FK)
  assignedAt: Date
  
  // Unique constraint on (userId, institutionId)
}
```

### Role
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  institutionId: UUID (FK, nullable) // null = global role
  name: string
  description: string
  isSystemRole: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Implementation Details

### Creating a User with Multi-Institution Assignment
```javascript
// Step 1: Create user
const user = await User.create({
  tenantId: 'tenant-123',
  email: 'teacher@school.com',
  firstName: 'John',
  lastName: 'Doe',
  passwordHash: hashedPassword
});

// Step 2: Assign to institutions
await UserInstitution.create({
  userId: user.id,
  institutionId: 'institution-1',
  roleId: 'role-teacher'
});

await UserInstitution.create({
  userId: user.id,
  institutionId: 'institution-2',
  roleId: 'role-teacher'
});

// Step 3: User JWT will include:
{
  userId: 'user-123',
  tenantId: 'tenant-123',
  institutions: ['institution-1', 'institution-2'],
  permissions: ['view_grades', 'add_notes', ...]
}
```

### Checking Permissions
```javascript
// In request context
if (req.context.user.permissions.includes('create_student')) {
  // Allow
}
```

### Impersonation Logging
```javascript
// Super admin impersonates user
POST /api/admin/impersonate/user-456

// System logs:
{
  action: 'IMPERSONATION_START',
  adminId: 'super-admin-123',
  impersonatedUserId: 'user-456',
  timestamp: Date,
  ipAddress: '192.168.1.1',
  // Cannot be deleted for 24+ months
}
```

## Subscription Tiers

### Starter
- Max 1 institution
- Max 10 users
- Basic modules (Admin, CRM)

### Professional
- Max 5 institutions
- Max 50 users
- Core modules (Admin, CRM, Forms, ERP, Finance, Pedagogy)

### Enterprise
- Unlimited institutions
- Unlimited users
- All modules

## Audit & Compliance

Every admin action logged:
- User creation/modification
- Permission changes
- Role assignments
- Tenant configuration changes
- Impersonation activities

See Security Module for audit trail details.
