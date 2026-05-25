# Module 2: CRM & Registration Management

## Overview
Handles candidate registration workflows, anti-duplication system, internal Kanban board, and family record management.

## Key Features

### 2.1 Hybrid Registration Form
- Built-in default questions (name, ID, phone, address)
- Dynamic custom questions added by institution
- No database schema modifications needed
- Question templates for common scenarios

### 2.2 Anti-Duplication System
Real-time duplicate detection:
- ID number matching
- Phone number matching
- Pop-up alerts to secretary
- Quick link to existing family record
- Prevents accidental duplicates

### 2.3 Registration Status Flow
```
DRAFT → SUBMITTED → UNDER_REVIEW → ACCEPTED/REJECTED
```

### 2.4 Kanban Board
Visual workflow board:
- Columns for each status
- Drag-drop status updates
- Color-coded cards
- Internal notes (hidden from applicants)

### 2.5 Physical Signature
- Canvas-based finger drawing on mobile
- Saved as encrypted image
- Stored in registration record
- Required before submission

## API Endpoints

### Registration Submissions
```
POST   /api/crm/registrations           # Create new registration
GET    /api/crm/registrations           # List registrations
GET    /api/crm/registrations/:id       # Get registration details
PUT    /api/crm/registrations/:id       # Update registration
POST   /api/crm/registrations/:id/submit # Submit registration
POST   /api/crm/registrations/:id/sign  # Add signature
```

### Duplicate Detection
```
POST   /api/crm/check-duplicates        # Check for duplicates
  Body: { idNumber: string, phone: string }
  Returns: { isDuplicate: boolean, familyId?: string, family?: {...} }
```

### Kanban Board
```
GET    /api/crm/kanban                  # Get kanban board state
POST   /api/crm/registrations/:id/move  # Move registration to new status
```

### Internal Notes
```
POST   /api/crm/registrations/:id/notes # Add internal note
GET    /api/crm/registrations/:id/notes # Get all notes for registration
```

## Data Models

### Registration Form
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  institutionId: UUID (FK)
  title: string
  description: string
  fields: Array<{
    id: string
    name: string
    type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'date'
    required: boolean
    options: string[] // for select type
    placeholder: string
  }>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Registration Submission
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  formId: UUID (FK)
  institutionId: UUID (FK)
  familyId: UUID (FK, nullable)
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  
  // Dynamic form data
  submissionData: {
    [fieldName]: any
  }
  
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected'
  submittedAt: Date (nullable)
  submittedBy: string (email)
  
  // Signature
  signature: string (encrypted base64)
  signedAt: Date (nullable)
  
  createdAt: Date
  updatedAt: Date
}
```

### Registration Note (Internal)
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  registrationId: UUID (FK)
  content: string
  createdBy: string (user email)
  isInternal: boolean (always true)
  createdAt: Date
}
```

## Registration Workflow Example

### 1. Applicant Fills Form
```
Mobile/Web Form
├── Personal Details
├── Family Information
├── Dynamic Questions
├── Canvas Signature
└── Submit
```

### 2. System Checks Duplicates
```javascript
async function submitRegistration(registrationId) {
  const registration = await Registration.findById(registrationId);
  
  // Check for duplicates
  const duplicates = await checkDuplicates(
    registration.idNumber,
    registration.phone
  );
  
  if (duplicates.found) {
    // Notify secretary with pop-up
    return {
      duplicate: true,
      familyId: duplicates.familyId,
      family: { ... }
    };
  }
  
  // Proceed to submission
  registration.status = 'submitted';
  registration.submittedAt = now;
  await registration.save();
}
```

### 3. Secretary Reviews on Kanban
```
DRAFT            SUBMITTED        UNDER_REVIEW     ACCEPTED
[Card 1]  -->    [Card 2]   -->   [Card 3]   -->   [Card 4]
[Card 5]         [Card 6]         [Card 7]         
                                  [Card 8]
```

### 4. Adding Internal Notes
Secretary can add notes during review:
```
"Called parents to confirm details - verified address"
"Missing immunization records - sent email reminder"
"Ready for approval - meets all criteria"
```

Notes are completely hidden from parents/applicants.

### 5. Acceptance Triggers Finance Module
When registration marked as ACCEPTED:
```javascript
// Event fired
await eventEmitter.emit('registration.accepted', {
  registrationId: registration.id,
  studentId: student.id,
  familyId: family.id
});

// Finance Module listens and creates:
// 1. Student record in system
// 2. Automatic Ndarim Plus customer
// 3. First charge token (if applicable)
```

## Default Form Questions

```javascript
{
  name: "First Name",
  type: "text",
  required: true,
  placeholder: "Enter first name"
}

{
  name: "Last Name",
  type: "text",
  required: true,
  placeholder: "Enter last name"
}

{
  name: "ID Number",
  type: "text",
  required: true,
  placeholder: "Israeli ID number (9 digits)"
}

{
  name: "Email",
  type: "email",
  required: true,
  placeholder: "your@email.com"
}

{
  name: "Phone",
  type: "phone",
  required: true,
  placeholder: "+972 50 000 0000"
}

{
  name: "Address",
  type: "text",
  required: false,
  placeholder: "Street address"
}
```

## Custom Question Examples

Institution can add questions like:
- "What is your religious affiliation?"
- "Home internet access?"
- "Does student have computer at home?"
- "Any special needs or accommodations?"
- "Dietary restrictions?"
- "Emergency contact information?"

## Duplicate Detection Algorithm

```javascript
async function checkDuplicates(idNumber, phone) {
  // Normalize inputs
  const normalizedId = idNumber.trim();
  const normalizedPhone = normalizePhone(phone);
  
  // Search in existing registrations
  const byId = await Registration.findOne({
    where: { idNumber: normalizedId }
  });
  
  const byPhone = await Registration.findOne({
    where: { applicantPhone: normalizedPhone }
  });
  
  // Also search in student records
  const studentById = await Student.findOne({
    where: { idNumber: normalizedId }
  });
  
  if (byId || byPhone || studentById) {
    return {
      found: true,
      matches: [byId, byPhone, studentById].filter(x => x)
    };
  }
  
  return { found: false };
}
```

## Integration with Other Modules

### → Finance Module
When student accepted, Finance Module creates Ndarim Plus record

### → Pedagogy Module
Student 360 profile created with enrollment

### → Communications Module
Welcome email sent using Communications system

### → Security Module
All registration submissions logged to audit trail
