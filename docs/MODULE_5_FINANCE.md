# Module 5: Finance & Ndarim Plus Integration

## Overview
Handles financial management with seamless Ndarim Plus integration, charge token management, and payment tracking.

## Key Features

### 5.1 Automatic Student Record Creation
When a registration is accepted:
1. Student record created in Mosdent
2. Ndarim Plus API called
3. Customer record created in Ndarim Plus
4. Ndarim Plus ID stored in student record
5. First charge token created if applicable

### 5.2 Charge Token System
- Represents billable amount to family
- Status tracking: pending → paid/overdue
- Synced with Ndarim Plus
- Multiple tokens per student possible
- Comments and descriptions

### 5.3 Bi-Directional Sync
- Payment status synced from Ndarim Plus
- Receipt data imported to Mosdent
- Balance information synchronized
- Real-time on-demand sync available

### 5.4 Multi-Level Reporting
- Family payment history
- Class/grade financial summaries
- Institution revenue reports
- Aging analysis (overdue payments)

## API Endpoints

### Charge Tokens
```
POST   /api/finance/charge-tokens       # Create charge token
GET    /api/finance/charge-tokens       # List tokens (filtered)
GET    /api/finance/charge-tokens/:id   # Get token details
PUT    /api/finance/charge-tokens/:id   # Update token
DELETE /api/finance/charge-tokens/:id   # Cancel token
```

### Payment Status
```
GET    /api/finance/families/:id/payments        # Get family payments
GET    /api/finance/families/:id/balance         # Get family balance
GET    /api/finance/families/:id/history         # Payment history
```

### Sync Operations
```
POST   /api/finance/sync/ndarim        # Sync with Ndarim Plus
GET    /api/finance/sync/status        # Get sync status
```

### Reports
```
GET    /api/finance/reports/revenue    # Revenue report
GET    /api/finance/reports/aging      # Aging analysis
GET    /api/finance/reports/collections # Collection status
```

## Data Models

### Charge Token
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  studentId: UUID (FK)
  familyId: UUID (FK)
  institutionId: UUID (FK)
  
  amount: number (in Israeli Shekels)
  currency: string (default: ILS)
  description: string // e.g., "Monthly Tuition", "School Supplies"
  
  dueDate: Date
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  
  // Ndarim Plus sync info
  ndarimPlusId: string (nullable)
  lastSyncedAt: Date (nullable)
  
  // Receipts/Payments
  payments: Array<{
    amount: number
    date: Date
    referenceNumber: string
  }>
  
  createdBy: string (user email)
  createdAt: Date
  updatedAt: Date
}
```

### Payment Receipt
```typescript
{
  id: UUID (PK)
  tenantId: UUID (FK)
  chargeTokenId: UUID (FK)
  
  amount: number
  paymentDate: Date
  paymentMethod: 'check' | 'credit_card' | 'bank_transfer' | 'cash'
  referenceNumber: string
  notes: string
  
  // If from Ndarim Plus
  ndarimPlusReceiptId: string (nullable)
  
  createdAt: Date
}
```

## Ndarim Plus Integration Flow

### Initial Sync: Student Acceptance
```
┌─────────────────────────────────────┐
│ CRM Module: Student Accepted        │
└────────────┬────────────────────────┘
             │ Event: registration.accepted
             ▼
┌─────────────────────────────────────┐
│ Finance Module: Receive Event       │
└────────────┬────────────────────────┘
             │
             ├─→ Create Charge Token (if applicable)
             │
             ├─→ Call Ndarim Plus API: Create Customer
             │   POST /api/customers
             │   Body: {
             │     name: "Family Name",
             │     phone: "...",
             │     email: "...",
             │     address: "..."
             │   }
             │
             ├─→ Store Ndarim Plus ID
             │
             └─→ Sync Complete
```

### Ongoing Sync: Payment Status
```
Periodic Job (Every 6 hours):
├─ Query Mosdent for charge tokens
├─ For each token with ndarimPlusId:
│  ├─ Call Ndarim Plus: Get Payment Status
│  ├─ Update token status in Mosdent
│  ├─ Check for new receipts
│  └─ Update payment history
└─ Log all sync activities
```

### On-Demand Sync
```
Family requests payment status:
├─ User clicks "Refresh Payment Status"
├─ System calls: POST /api/finance/sync/ndarim/:familyId
├─ Ndarim Plus API queried for latest data
├─ Results merged with Mosdent data
└─ Up-to-date info displayed
```

## Implementation Details

### Creating a Charge Token
```javascript
async function createChargeToken(data) {
  // Create charge token
  const token = await ChargeToken.create({
    tenantId: data.tenantId,
    studentId: data.studentId,
    familyId: data.familyId,
    amount: data.amount,
    description: data.description,
    dueDate: data.dueDate,
    status: 'pending',
    createdBy: req.context.user.email
  });
  
  // Sync to Ndarim Plus
  const ndarimResponse = await ndarimPlusClient.createCharge({
    customerId: family.ndarimPlusId,
    amount: token.amount,
    description: token.description,
    dueDate: token.dueDate
  });
  
  // Store Ndarim Plus ID
  token.ndarimPlusId = ndarimResponse.chargeId;
  token.lastSyncedAt = new Date();
  await token.save();
  
  return token;
}
```

### Syncing Payment Status
```javascript
async function syncNdarimPlus(familyId) {
  const family = await Family.findById(familyId);
  const tokens = await ChargeToken.findAll({
    where: { familyId }
  });
  
  for (const token of tokens) {
    if (!token.ndarimPlusId) continue;
    
    // Get status from Ndarim Plus
    const status = await ndarimPlusClient.getChargeStatus(
      token.ndarimPlusId
    );
    
    // Update Mosdent
    token.status = status.status;
    
    // Check for new payments
    if (status.payments && status.payments.length > 0) {
      for (const payment of status.payments) {
        const existingPayment = token.payments.find(
          p => p.referenceNumber === payment.referenceNumber
        );
        if (!existingPayment) {
          token.payments.push({
            amount: payment.amount,
            date: payment.date,
            referenceNumber: payment.referenceNumber
          });
        }
      }
    }
    
    token.lastSyncedAt = new Date();
    await token.save();
  }
}
```

### Getting Payment Summary
```javascript
async function getPaymentSummary(familyId) {
  const tokens = await ChargeToken.findAll({
    where: { familyId }
  });
  
  const summary = {
    totalOwed: 0,
    totalPaid: 0,
    overdue: [],
    pending: [],
    recentPayments: []
  };
  
  for (const token of tokens) {
    if (token.status === 'pending' || token.status === 'overdue') {
      summary.totalOwed += token.amount;
      summary.pending.push(token);
    }
    
    if (token.status === 'overdue') {
      summary.overdue.push(token);
    }
    
    // Calculate paid amount
    for (const payment of token.payments) {
      summary.totalPaid += payment.amount;
      summary.recentPayments.push({
        ...payment,
        description: token.description
      });
    }
  }
  
  return summary;
}
```

## Configuration

In `.env`:
```
NDARIM_PLUS_API_URL=https://api.ndarim-plus.com
NDARIM_PLUS_API_KEY=your_api_key
NDARIM_PLUS_SYNC_INTERVAL=21600000  // 6 hours in ms
```

## Error Handling

### Ndarim Plus API Failures
- Retry logic with exponential backoff
- Fallback to cached data
- Alert if sync fails for 24+ hours
- Manual retry button available

### Charge Token Validation
- Amount must be positive
- Due date must be future date
- Student must exist in system
- Family must have Ndarim Plus record

## Subscription Tier Limits

| Feature | Starter | Professional | Enterprise |
|---------|---------|-------------|-----------|
| Max Charge Tokens | 100 | 5,000 | Unlimited |
| Sync Frequency | Daily | Every 6h | Real-time |
| Reports | Basic | Advanced | Custom |
| Multi-Currency | ✗ | ✓ | ✓ |

## Audit Trail

All financial operations logged:
- Charge token creation/modification
- Payment recordings
- Ndarim Plus sync operations
- Balance adjustments
- Manual corrections
