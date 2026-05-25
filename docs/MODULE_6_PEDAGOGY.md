# Module 6: Pedagogy & Student 360 Profiles

## Overview
Comprehensive longitudinal tracking of student performance with automated intelligent alert system based on customizable rules.

## Key Features

### 6.1 Student 360 Profile
Consolidated view of student data:
- Personal information
- Academic history (all grades across years)
- Attendance records and absences
- Behavioral notes and incidents
- Diagnostic assessments
- Meeting notes and observations
- Counselor communications

### 6.2 Longitudinal Tracking
Historical data from entire education journey:
- Grade trends across subjects and years
- Attendance patterns over time
- Behavior progression
- Achievement milestones
- Interventions and outcomes

### 6.3 Automated Alert System
Smart rule engine that monitors student performance:
- Point-based alerts (single anomaly)
- Cumulative alerts (trend-based)
- Custom threshold definitions
- Automatic task creation
- Stakeholder notifications

### 6.4 Task Integration
- Auto-create tasks in ERP module
- Assign to counselors/teachers
- Track interventions
- Document outcomes

## API Endpoints

### Student Profile
```
GET    /api/pedagogy/students/:id       # Get 360 profile
GET    /api/pedagogy/students/:id/grades   # Grade history
GET    /api/pedagogy/students/:id/attendance # Attendance records
GET    /api/pedagogy/students/:id/notes  # Behavioral notes
```

### Grades Management
```
POST   /api/pedagogy/grades             # Record grade
PUT    /api/pedagogy/grades/:id         # Update grade
GET    /api/pedagogy/grades/subject/:subject # Get subject grades
```

### Attendance
```
POST   /api/pedagogy/attendance         # Record attendance
GET    /api/pedagogy/attendance/student/:id # Student attendance history
```

### Alert Rules
```
POST   /api/pedagogy/alert-rules        # Create alert rule
GET    /api/pedagogy/alert-rules        # List rules
PUT    /api/pedagogy/alert-rules/:id    # Update rule
DELETE /api/pedagogy/alert-rules/:id    # Delete rule
POST   /api/pedagogy/alerts/trigger     # Manually trigger check
```

### Reports
```
GET    /api/pedagogy/reports/student/:id   # Student report
GET    /api/pedagogy/reports/class/:id     # Class report
GET    /api/pedagogy/reports/trends       # Trend analysis
```

## Data Models

### Grade Record
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  studentId: UUID (FK)
  institutionId: UUID (FK)
  
  subject: string // "Math", "English", "Science"
  gradeValue: number (0-100)
  gradeScale: 'numeric' | 'letter' | 'descriptor'
  
  gradeDate: Date
  academicYear: number
  semester: 1 | 2
  gradeType: 'quiz' | 'test' | 'exam' | 'project' | 'participation'
  
  recordedBy: string (teacher email)
  notes: string (nullable)
  
  createdAt: Date
  updatedAt: Date
}
```

### Attendance Record
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  studentId: UUID (FK)
  
  attendanceDate: Date
  status: 'present' | 'absent' | 'late' | 'excused'
  reason: string (nullable) // "Doctor appointment"
  
  recordedBy: string (teacher email)
  
  createdAt: Date
}
```

### Behavioral Note
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  studentId: UUID (FK)
  
  noteType: 'positive' | 'concern' | 'disciplinary'
  content: string
  
  recordedBy: string (staff email)
  recordedDate: Date
  
  confidential: boolean
  visibility: 'teachers' | 'parents' | 'counselor' | 'admin'
  
  createdAt: Date
}
```

### Alert Rule
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  institutionId: UUID (FK)
  
  name: string // "Math Performance Drop"
  description: string
  ruleType: 'point' | 'cumulative' | 'threshold'
  
  // Rule definition
  criteria: {
    type: 'point' | 'cumulative'
    subject?: string // null = all subjects
    metric: 'grade' | 'attendance' | 'behavior'
    operator: '<' | '>' | '=' | 'drop'
    threshold: number // percentage or absolute
    timeframe?: 'week' | 'month' | 'semester' | 'year'
  }
  
  // Action when triggered
  action: {
    createTask: boolean
    notifyTeacher: boolean
    notifyParent: boolean
    notifyCounselor: boolean
    taskDetails?: {
      title: string
      priority: 'high' | 'urgent'
      description: string
    }
  }
  
  isActive: boolean
  createdBy: string (admin email)
  
  createdAt: Date
  updatedAt: Date
}
```

### Alert Trigger Log
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  studentId: UUID (FK)
  ruleId: UUID (FK)
  
  triggeredReason: string // Explanation of why rule triggered
  triggerData: JSON // Specific values that triggered alert
  
  // Task created from this alert
  taskId: UUID (nullable)
  
  resolved: boolean
  resolvedAt: Date (nullable)
  resolution: string (nullable) // Counselor notes on intervention
  
  createdAt: Date
}
```

## Alert Rule Examples

### Point-Based Alert: Single Grade Anomaly
```javascript
{
  name: "Math Grade Drop",
  ruleType: "point",
  criteria: {
    type: "point",
    subject: "Math",
    metric: "grade",
    operator: "<",
    threshold: 70  // If single math grade below 70
  },
  action: {
    createTask: true,
    notifyTeacher: true,
    notifyParent: false,
    taskDetails: {
      title: "Follow up on Math Grade",
      priority: "medium"
    }
  }
}
```

### Cumulative Alert: Trend Over Time
```javascript
{
  name: "Attendance Decline",
  ruleType: "cumulative",
  criteria: {
    type: "cumulative",
    metric: "attendance",
    operator: "drop",
    threshold: 15,  // 15% drop
    timeframe: "month"
  },
  action: {
    createTask: true,
    notifyTeacher: true,
    notifyParent: true,
    notifyCounselor: true,
    taskDetails: {
      title: "Investigate Attendance Issue",
      priority: "high"
    }
  }
}
```

### Threshold Alert: Concern Pattern
```javascript
{
  name: "Low Average Grade",
  ruleType: "threshold",
  criteria: {
    type: "cumulative",
    metric: "grade",
    operator: "<",
    threshold: 65,  // Average below 65
    timeframe: "semester"
  },
  action: {
    createTask: true,
    notifyTeacher: true,
    notifyParent: true,
    notifyCounselor: true,
    taskDetails: {
      title: "Academic Intervention Required",
      priority: "urgent"
    }
  }
}
```

## Implementation Details

### Recording a Grade and Checking Alerts
```javascript
async function recordGrade(studentId, subject, gradeValue) {
  // Step 1: Create grade record
  const grade = await Grade.create({
    tenantId: req.context.tenant.tenantId,
    studentId,
    subject,
    gradeValue,
    gradeDate: new Date(),
    recordedBy: req.context.user.email
  });
  
  // Step 2: Trigger alert check
  await checkAndTriggerAlerts(studentId);
  
  // Step 3: Log in audit trail
  await logAuditEvent({
    action: 'GRADE_RECORDED',
    entityType: 'grade',
    entityId: grade.id,
    changes: { gradeValue, subject }
  });
  
  return grade;
}
```

### Alert Evaluation Engine
```javascript
async function checkAndTriggerAlerts(studentId) {
  const student = await Student.findById(studentId);
  const institution = await Institution.findById(student.institutionId);
  
  // Get all active rules for this institution
  const rules = await AlertRule.findAll({
    where: {
      institutionId: institution.id,
      isActive: true
    }
  });
  
  for (const rule of rules) {
    const triggered = await evaluateRule(rule, student);
    
    if (triggered) {
      // Create alert trigger record
      const trigger = await AlertTrigger.create({
        tenantId: req.context.tenant.tenantId,
        studentId,
        ruleId: rule.id,
        triggeredReason: triggered.reason,
        triggerData: triggered.data
      });
      
      // Execute actions
      if (rule.action.createTask) {
        const task = await Task.create({
          tenantId: req.context.tenant.tenantId,
          studentId,
          title: rule.action.taskDetails.title,
          description: `Alert triggered: ${triggered.reason}`,
          priority: rule.action.taskDetails.priority,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        trigger.taskId = task.id;
      }
      
      // Send notifications
      if (rule.action.notifyTeacher) {
        await sendNotification(student.teacherId, {
          type: 'alert',
          message: `Alert for ${student.name}: ${triggered.reason}`
        });
      }
      
      if (rule.action.notifyParent) {
        await sendNotificationToFamily(student.familyId, {
          type: 'alert',
          message: `Update on ${student.name}: ${triggered.reason}`
        });
      }
      
      await trigger.save();
    }
  }
}
```

### Evaluating a Rule
```javascript
async function evaluateRule(rule, student) {
  if (rule.criteria.type === 'point') {
    // Single point evaluation
    const latestGrades = await Grade.findAll({
      where: { studentId: student.id },
      order: [['gradeDate', 'DESC']],
      limit: 1
    });
    
    if (latestGrades.length === 0) return null;
    const latestGrade = latestGrades[0];
    
    if (rule.criteria.subject && latestGrade.subject !== rule.criteria.subject) {
      return null;
    }
    
    if (rule.criteria.operator === '<' && latestGrade.gradeValue < rule.criteria.threshold) {
      return {
        triggered: true,
        reason: `Grade in ${latestGrade.subject}: ${latestGrade.gradeValue} (threshold: ${rule.criteria.threshold})`,
        data: { grade: latestGrade.gradeValue, subject: latestGrade.subject }
      };
    }
  }
  
  if (rule.criteria.type === 'cumulative') {
    // Calculate average over timeframe
    const timeframe = rule.criteria.timeframe;
    const startDate = getStartDate(timeframe);
    
    const grades = await Grade.findAll({
      where: {
        studentId: student.id,
        gradeDate: { [Op.gte]: startDate }
      }
    });
    
    if (grades.length === 0) return null;
    
    const average = grades.reduce((sum, g) => sum + g.gradeValue, 0) / grades.length;
    
    if (rule.criteria.operator === '<' && average < rule.criteria.threshold) {
      return {
        triggered: true,
        reason: `Average grade: ${average.toFixed(2)} over ${timeframe} (threshold: ${rule.criteria.threshold})`,
        data: { average, timeframe, gradeCount: grades.length }
      };
    }
  }
  
  return null;
}
```

## Student 360 Profile View

```json
{
  "student": {
    "id": "student-123",
    "name": "David Cohen",
    "idNumber": "123456789",
    "currentClass": "10A",
    "enrollmentStatus": "active"
  },
  "academicPerformance": {
    "subjects": [
      { "name": "Math", "average": 82, "trend": "up" },
      { "name": "English", "average": 75, "trend": "down" },
      { "name": "Science", "average": 88, "trend": "stable" }
    ],
    "overallAverage": 81.67,
    "ranking": "Top 20%"
  },
  "attendance": {
    "totalAbsent": 3,
    "totalLate": 5,
    "absencePercentage": 2.1,
    "trend": "improving"
  },
  "recentNotes": [
    { "date": "2024-05-20", "type": "positive", "content": "Excellent project presentation" },
    { "date": "2024-05-15", "type": "concern", "content": "Missing homework assignments" }
  ],
  "activeAlerts": [],
  "upcomingTasks": [
    { "title": "Math Remediation Session", "dueDate": "2024-05-25" }
  ]
}
```

## Integration with Other Modules

### → ERP Module
- Creates tasks for interventions
- Links to student counseling sessions
- Tracks task completion

### → Communications Module
- Send email/SMS notifications to parents
- Automated alert communications
- Meeting confirmation emails

### → Security Module
- Behavioral notes marked as confidential
- Access logging for sensitive data
- FERPA compliance logging
