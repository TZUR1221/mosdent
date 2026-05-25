# Mosdent Database Schema

## Overview

Mosdent uses PostgreSQL with Sequelize ORM. This document describes all database tables, relationships, and constraints.

## Core Entities

### 1. Tenants Table
Represents organization accounts on the platform.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  subscription_tier ENUM('starter', 'professional', 'enterprise') DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  max_institutions INTEGER,
  max_users INTEGER,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_name ON tenants(name);
CREATE INDEX idx_tenants_active ON tenants(is_active);
```

### 2. Institutions Table
Represents schools, kindergartens, or educational facilities.

```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  institution_type ENUM('school', 'kindergarten', 'network', 'community') NOT NULL,
  principal_name VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  parent_institution UUID REFERENCES institutions(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_institutions_tenant ON institutions(tenant_id);
CREATE INDEX idx_institutions_parent ON institutions(parent_institution);
CREATE INDEX idx_institutions_active ON institutions(is_active);
```

### 3. Users Table
Represents system users across the platform.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_active ON users(is_active);
```

### 4. User Institutions Table
Junction table for multi-institution staff assignments.

```sql
CREATE TABLE user_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, institution_id)
);

CREATE INDEX idx_user_institutions_user ON user_institutions(user_id);
CREATE INDEX idx_user_institutions_institution ON user_institutions(institution_id);
```

### 5. Roles Table
RBAC role definitions.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  institution_id UUID REFERENCES institutions(id),
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_tenant_name ON roles(tenant_id, name);
CREATE INDEX idx_roles_institution ON roles(institution_id);
```

### 6. Audit Logs Table
Immutable audit trail for compliance.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  changes JSONB,
  user_id UUID,
  user_email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_tenant_entity ON audit_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

### 7. Students Table
Student records with longitudinal tracking.

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  id_number VARCHAR(9),
  date_of_birth DATE,
  gender ENUM('M', 'F', 'Other'),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  family_id UUID,
  enrollment_status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
  academic_year INTEGER,
  class_grade VARCHAR(10),
  ndarim_plus_id VARCHAR(50),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_tenant_id ON students(tenant_id, id_number);
CREATE INDEX idx_students_institution ON students(tenant_id, institution_id);
CREATE INDEX idx_students_family ON students(family_id);
```

---

**Last Updated**: May 24, 2026
**Version**: 4.0.0
