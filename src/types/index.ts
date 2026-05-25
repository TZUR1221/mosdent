// Common types used across the application

export interface TenantContext {
  tenantId: string;
  name: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
}

export interface UserClaims {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  institutions: string[];
  permissions: string[];
}

export interface RequestContext {
  tenant: TenantContext;
  user: UserClaims;
  requestId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, any>;
}

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
  total: number;
}

export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Student Profile Types
export interface StudentProfile extends BaseEntity {
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  institutionId: string;
  familyId: string;
  enrollmentStatus: 'active' | 'inactive' | 'graduated' | 'suspended';
  academicYear: number;
  classGrade: string;
}

// Financial Types
export interface ChargeToken extends BaseEntity {
  studentId: string;
  familyId: string;
  amount: number;
  description: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  ndarimPlusplusId?: string;
  lastSyncedAt?: Date;
}

// Communication Types
export interface EmailRecord extends BaseEntity {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  sentAt: Date;
  status: 'sent' | 'failed' | 'draft';
  senderSignature: string;
  attachments?: string[];
}

// Registration/CRM Types
export interface RegistrationSubmission extends BaseEntity {
  familyId?: string;
  formId: string;
  submissionData: Record<string, any>;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedAt?: Date;
  submittedBy: string;
  signature?: string; // Canvas signature
  notes?: string;
}

// Task/Ticket Types
export interface Task extends BaseEntity {
  title: string;
  description: string;
  assignedTo: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  linkedEntity?: {
    type: 'student' | 'family' | 'ticket' | 'registration';
    id: string;
  };
  slaDueDate?: Date;
}

// Audit Log Types
export interface AuditLog extends BaseEntity {
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  userId: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
}

// Permission Types
export interface Role extends BaseEntity {
  name: string;
  description: string;
  permissions: string[];
  institutionId?: string; // If null, it's global
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  resource: string;
  action: string;
}
