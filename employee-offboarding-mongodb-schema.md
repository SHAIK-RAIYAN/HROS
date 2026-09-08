# Employee Offboarding Automation — MongoDB Schema

## Purpose

Final database design for the 3-hour AI-assisted hackathon implementation.

The design intentionally keeps the data model small while supporting:

- Configurable workflow stages
- Role-based approvals
- Sequential and parallel execution
- Department-specific clearance checklists
- Approval / rejection
- Remarks and timestamps
- Complete audit history
- Email notifications and reminders
- HR dashboard visibility
- PDF document generation
- Access revocation tracking

---

# 1. Model Overview

## Existing HROS Models

These models already exist in BlazeUp HROS and should be reused:

```text
Employee
User
Role
```

## New Models

Create only these four new MongoDB collections/models:

```text
1. WorkflowTemplate
2. OffboardingCase
3. WorkflowStage
4. WorkflowAuditLog
```

Do NOT create separate collections for:

```text
Notification
WorkflowTask
GeneratedDocument
DocumentTemplate
AccessRevocation
ChecklistItem
Department
ApprovalHistory
```

---

# 2. Entity Relationship

```text
Employee
   │
   │ 1:N
   ▼
OffboardingCase
   │
   │ 1:N
   ▼
WorkflowStage
   │
   └── Embedded accessRevocation[]

OffboardingCase
   │
   └── 1:N
       ▼
WorkflowAuditLog

OffboardingCase
   └── documentUrls
```

---

# 3. WorkflowTemplate

## Purpose

Defines a reusable workflow configuration.

This is the generic workflow definition, not an employee's actual workflow execution.

Example:

```text
Employee Offboarding

Sequence 1:
  Project / Reporting Manager

Sequence 2:
  Admin & Systems
  Accounts
  Personnel

Sequence 3:
  HR
```

## Mongoose Schema

```js
const WorkflowTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    entityType: {
      type: String,
      enum: ["OFFBOARDING"],
      required: true,
    },

    version: {
      type: Number,
      default: 1,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    stages: [
      {
        stageCode: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        sequence: {
          type: Number,
          required: true,
        },

        executionMode: {
          type: String,
          enum: ["SEQUENTIAL", "PARALLEL"],
          default: "SEQUENTIAL",
          required: true,
        },

        roleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role",
          required: true,
        },

        checklist: [
          {
            itemId: {
              type: String,
              required: true,
            },

            label: {
              type: String,
              required: true,
            },

            required: {
              type: Boolean,
              default: true,
            },
          },
        ],

        requiresRemarks: {
          type: Boolean,
          default: false,
        },

        allowRejection: {
          type: Boolean,
          default: true,
        },

        dueHours: {
          type: Number,
          default: 24,
        },

        reminderAfterHours: {
          type: Number,
          default: 24,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
```

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `name` | String | Yes | Human-readable workflow name |
| `code` | String | Yes | Unique workflow identifier |
| `entityType` | Enum | Yes | Workflow business type |
| `version` | Number | Yes | Workflow version |
| `isActive` | Boolean | No | Whether template can be used |
| `stages` | Array | Yes | Configured workflow stages |
| `createdBy` | ObjectId → User | No | Creator |
| `updatedBy` | ObjectId → User | No | Last updater |

## Stage Definition Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `stageCode` | String | Yes | Stable stage identifier |
| `name` | String | Yes | Display name |
| `sequence` | Number | Yes | Execution order |
| `executionMode` | `SEQUENTIAL` / `PARALLEL` | Yes | How stages at the sequence execute |
| `roleId` | ObjectId → Role | Yes | Role responsible for approval |
| `checklist` | Array | No | Department-specific clearance items |
| `requiresRemarks` | Boolean | No | Whether remarks are required |
| `allowRejection` | Boolean | No | Whether stage can reject |
| `dueHours` | Number | No | Hours allowed after activation |
| `reminderAfterHours` | Number | No | Initial reminder threshold |

---

# 4. OffboardingCase

## Purpose

Represents one employee's actual offboarding process.

This is the main business object used by the HR dashboard.

## Mongoose Schema

```js
const OffboardingCaseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    workflowTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
    },

    workflowVersion: {
      type: Number,
      required: true,
    },

    employeeSnapshot: {
      employeeCode: String,
      name: String,
      email: String,
      designation: String,
      department: String,
      joiningDate: Date,
      managerName: String,
    },

    resignationDate: {
      type: Date,
      required: true,
    },

    lastWorkingDay: {
      type: Date,
      required: true,
      index: true,
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "INITIATED",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "INITIATED",
      index: true,
    },

    currentSequence: {
      type: Number,
      default: 1,
      required: true,
    },

    documentUrls: {
      resignationAcceptance: {
        type: String,
        default: null,
      },

      noc: {
        type: String,
        default: null,
      },

      experienceRelieving: {
        type: String,
        default: null,
      },
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    initiatedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },

    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

OffboardingCaseSchema.index({
  status: 1,
  lastWorkingDay: 1,
});

OffboardingCaseSchema.index({
  employeeId: 1,
  status: 1,
});
```

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `caseNumber` | String | Yes | Human-readable unique offboarding ID |
| `employeeId` | ObjectId → Employee | Yes | Existing employee reference |
| `workflowTemplateId` | ObjectId → WorkflowTemplate | Yes | Workflow used for this case |
| `workflowVersion` | Number | Yes | Version used when case started |
| `employeeSnapshot` | Object | No | Historical employee data |
| `resignationDate` | Date | Yes | Resignation date |
| `lastWorkingDay` | Date | Yes | Employee's final working day |
| `reason` | String | No | Resignation/offboarding reason |
| `status` | Enum | Yes | Overall case status |
| `currentSequence` | Number | Yes | Current workflow sequence |
| `documentUrls` | Object | No | Generated PDF download paths |
| `initiatedBy` | ObjectId → User | Yes | HR user who started the case |
| `initiatedAt` | Date | No | Start time |
| `completedAt` | Date | No | Completion time |
| `cancelledAt` | Date | No | Cancellation time |
| `cancellationReason` | String | No | Why case was cancelled |

## Status Values

```text
INITIATED
IN_PROGRESS
ON_HOLD
COMPLETED
CANCELLED
REJECTED
```

### Important

When any active stage is rejected:

```text
WorkflowStage → REJECTED
        ↓
OffboardingCase → REJECTED
        ↓
Workflow stops
```

Do not implement rework/branching for the hackathon.

---

# 5. WorkflowStage

## Purpose

Represents an actual stage execution for one employee.

The `WorkflowTemplate` contains the definition.

`WorkflowStage` contains the live state.

Example:

```text
Offboarding Case #OFF-001

WorkflowStage
  Manager       APPROVED
  Admin         ACTIVE
  Accounts      ACTIVE
  Personnel     ACTIVE
  HR            PENDING
```

This model combines the workflow stage and task concepts to keep the implementation simple.

## Mongoose Schema

```js
const WorkflowStageSchema = new mongoose.Schema(
  {
    offboardingCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OffboardingCase",
      required: true,
      index: true,
    },

    stageCode: {
      type: String,
      required: true,
    },

    stageName: {
      type: String,
      required: true,
    },

    sequence: {
      type: Number,
      required: true,
    },

    executionMode: {
      type: String,
      enum: ["SEQUENTIAL", "PARALLEL"],
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },

    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACTIVE",
        "APPROVED",
        "REJECTED",
        "SKIPPED",
      ],
      default: "PENDING",
      index: true,
    },

    checklist: [
      {
        itemId: {
          type: String,
          required: true,
        },

        label: {
          type: String,
          required: true,
        },

        required: {
          type: Boolean,
          default: true,
        },

        completed: {
          type: Boolean,
          default: false,
        },

        completedAt: Date,
      },
    ],

    remarks: {
      type: String,
      default: "",
    },

    activatedAt: Date,

    completedAt: Date,

    dueAt: Date,

    lastReminderAt: Date,

    reminderCount: {
      type: Number,
      default: 0,
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    accessRevocation: [
      {
        system: {
          type: String,
          enum: [
            "EMAIL",
            "VPN",
            "APPLICATION",
            "AD",
            "OTHER",
          ],
          required: true,
        },

        accessIdentifier: {
          type: String,
        },

        action: {
          type: String,
          enum: ["DISABLE", "DELETE", "REVOKE"],
          required: true,
        },

        status: {
          type: String,
          enum: [
            "PENDING",
            "COMPLETED",
            "FAILED",
          ],
          default: "PENDING",
        },

        executionMode: {
          type: String,
          enum: ["MANUAL", "AUTOMATED"],
          default: "MANUAL",
        },

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        performedAt: Date,

        remarks: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

WorkflowStageSchema.index({
  offboardingCaseId: 1,
  sequence: 1,
});

WorkflowStageSchema.index({
  assignedUserId: 1,
  status: 1,
});

WorkflowStageSchema.index({
  roleId: 1,
  status: 1,
});
```

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `offboardingCaseId` | ObjectId → OffboardingCase | Yes | Parent case |
| `stageCode` | String | Yes | Stable stage identifier |
| `stageName` | String | Yes | Display name |
| `sequence` | Number | Yes | Workflow sequence |
| `executionMode` | Enum | Yes | Sequential/parallel behavior |
| `roleId` | ObjectId → Role | Yes | Responsible role |
| `assignedUserId` | ObjectId → User | No | Actual user performing the stage |
| `status` | Enum | Yes | Stage state |
| `checklist` | Array | No | Executable checklist |
| `remarks` | String | No | Approver remarks |
| `activatedAt` | Date | No | When stage became active |
| `completedAt` | Date | No | When stage finished |
| `dueAt` | Date | No | Stage deadline |
| `lastReminderAt` | Date | No | Last reminder time |
| `reminderCount` | Number | No | Number of reminders |
| `completedBy` | ObjectId → User | No | User who completed it |
| `accessRevocation` | Array | No | Admin & Systems access actions |

## Stage Status

```text
PENDING
ACTIVE
APPROVED
REJECTED
SKIPPED
```

---

# 6. WorkflowAuditLog

## Purpose

Immutable history of workflow actions.

Do NOT use the fields in `WorkflowStage` as your only audit trail.

For example, if a stage changes:

```text
ACTIVE
→ REJECTED
→ APPROVED
```

the audit collection must preserve all actions.

## Mongoose Schema

```js
const WorkflowAuditLogSchema = new mongoose.Schema(
  {
    offboardingCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OffboardingCase",
      required: true,
      index: true,
    },

    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      default: null,
    },

    action: {
      type: String,
      enum: [
        "OFFBOARDING_CREATED",
        "STAGE_ACTIVATED",
        "CHECKLIST_UPDATED",
        "APPROVED",
        "REJECTED",
        "REMINDER_SENT",
        "NOTIFICATION_SENT",
        "NOTIFICATION_FAILED",
        "DOCUMENT_GENERATED",
        "ACCESS_REVOKED",
        "WORKFLOW_COMPLETED",
        "WORKFLOW_CANCELLED",
      ],
      required: true,
      index: true,
    },

    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        default: null,
      },

      name: {
        type: String,
      },
    },

    remarks: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

WorkflowAuditLogSchema.index({
  offboardingCaseId: 1,
  timestamp: -1,
});
```

## Fields

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `offboardingCaseId` | ObjectId → OffboardingCase | Yes | Parent case |
| `stageId` | ObjectId → WorkflowStage | No | Related stage |
| `action` | Enum | Yes | Action that occurred |
| `performedBy.userId` | ObjectId → User | No | User performing action |
| `performedBy.roleId` | ObjectId → Role | No | User role at the time |
| `performedBy.name` | String | No | Historical display name |
| `remarks` | String | No | Human-readable notes |
| `metadata` | Mixed | No | Additional contextual data |
| `timestamp` | Date | Yes | When action occurred |

## Audit Actions

```text
OFFBOARDING_CREATED
STAGE_ACTIVATED
CHECKLIST_UPDATED
APPROVED
REJECTED
REMINDER_SENT
NOTIFICATION_SENT
NOTIFICATION_FAILED
DOCUMENT_GENERATED
ACCESS_REVOKED
WORKFLOW_COMPLETED
WORKFLOW_CANCELLED
```

### Notification rule

Only write:

```text
NOTIFICATION_SENT
```

after the email was successfully sent.

If SMTP fails:

```text
NOTIFICATION_FAILED
```

---

# 7. Terralogic Workflow Seed

Create one active workflow template:

```js
{
  name: "Standard Employee Offboarding",
  code: "EMPLOYEE_OFFBOARDING",
  entityType: "OFFBOARDING",
  version: 1,
  isActive: true,

  stages: [
    {
      stageCode: "PROJECT_MANAGER",
      name: "Project / Reporting Manager",
      sequence: 1,
      executionMode: "SEQUENTIAL",
      roleId: PROJECT_MANAGER_ROLE_ID,

      checklist: [
        {
          itemId: "PROJECT_COMPLETION",
          label: "Project responsibilities completed",
          required: true
        },
        {
          itemId: "KNOWLEDGE_TRANSFER",
          label: "Knowledge transfer completed",
          required: true
        },
        {
          itemId: "ACCESS_REVIEW",
          label: "Client/project/system access reviewed",
          required: true
        }
      ],

      requiresRemarks: true,
      allowRejection: true,
      dueHours: 24,
      reminderAfterHours: 12
    },

    {
      stageCode: "ADMIN_SYSTEMS",
      name: "Admin & Systems",
      sequence: 2,
      executionMode: "PARALLEL",
      roleId: ADMIN_SYSTEMS_ROLE_ID,

      checklist: [
        {
          itemId: "LAPTOP",
          label: "Laptop returned",
          required: true
        },
        {
          itemId: "CHARGER",
          label: "Charger returned",
          required: true
        },
        {
          itemId: "PHONE",
          label: "Phone returned",
          required: false
        },
        {
          itemId: "DATA_CARD",
          label: "Data card returned",
          required: false
        },
        {
          itemId: "KEYS",
          label: "Keys returned",
          required: false
        },
        {
          itemId: "EMAIL_ACCESS",
          label: "Email access revoked",
          required: true
        },
        {
          itemId: "SYSTEM_ACCESS",
          label: "System access revoked",
          required: true
        }
      ],

      requiresRemarks: true,
      allowRejection: true,
      dueHours: 24,
      reminderAfterHours: 12
    },

    {
      stageCode: "ACCOUNTS",
      name: "Accounts",
      sequence: 2,
      executionMode: "PARALLEL",
      roleId: ACCOUNTS_ROLE_ID,

      checklist: [
        {
          itemId: "TRAVEL_ADVANCE",
          label: "Travel advances cleared",
          required: true
        },
        {
          itemId: "STAFF_LOAN",
          label: "Staff loans cleared",
          required: true
        },
        {
          itemId: "SALARY_ADVANCE",
          label: "Salary advances cleared",
          required: true
        },
        {
          itemId: "IMPREST",
          label: "Imprest cleared",
          required: true
        }
      ],

      requiresRemarks: true,
      allowRejection: true,
      dueHours: 24,
      reminderAfterHours: 12
    },

    {
      stageCode: "PERSONNEL",
      name: "Personnel",
      sequence: 2,
      executionMode: "PARALLEL",
      roleId: PERSONNEL_ROLE_ID,

      checklist: [
        {
          itemId: "ID_CARD",
          label: "ID card returned",
          required: true
        },
        {
          itemId: "ACCESS_CARD",
          label: "Access card returned",
          required: true
        },
        {
          itemId: "BUSINESS_CARDS",
          label: "Business cards returned",
          required: false
        }
      ],

      requiresRemarks: true,
      allowRejection: true,
      dueHours: 24,
      reminderAfterHours: 12
    },

    {
      stageCode: "HR_FINAL",
      name: "HR Final Clearance",
      sequence: 3,
      executionMode: "SEQUENTIAL",
      roleId: HR_ROLE_ID,

      checklist: [
        {
          itemId: "FINAL_CLEARANCE",
          label: "Final HR clearance completed",
          required: true
        },
        {
          itemId: "CERTIFICATION",
          label: "HR certification completed",
          required: true
        }
      ],

      requiresRemarks: true,
      allowRejection: true,
      dueHours: 24,
      reminderAfterHours: 12
    }
  ]
}
```

---

# 8. Workflow Execution Rules

## Initialisation

When HR initiates offboarding:

```text
1. Fetch Employee.
2. Fetch active WorkflowTemplate.
3. Create OffboardingCase.
4. Copy employee fields into employeeSnapshot.
5. Store workflowTemplateId and workflowVersion.
6. Create one WorkflowStage document for every configured stage.
7. Set currentSequence = 1.
8. Activate every stage with sequence = 1.
9. Assign each active stage to the user associated with its role.
10. Create audit entry.
11. Send email to active-stage approver(s).
```

## Sequential Processing

For a single sequential stage:

```text
Manager APPROVED
      ↓
Check sequence completion
      ↓
Advance currentSequence
      ↓
Activate next sequence
```

## Parallel Processing

For sequence 2:

```text
Admin      ACTIVE
Accounts   ACTIVE
Personnel  ACTIVE
```

Do NOT advance until:

```text
Admin      APPROVED
Accounts   APPROVED
Personnel  APPROVED
```

Then:

```text
currentSequence = 3
HR = ACTIVE
```

## Rejection

If any required stage is rejected:

```text
WorkflowStage.status = REJECTED
OffboardingCase.status = REJECTED
Workflow stops
Audit log created
HR can see rejection reason
```

---

# 9. Document Generation

Do not create another database model.

Store PDF paths directly in:

```js
OffboardingCase.documentUrls
```

Structure:

```js
documentUrls: {
  resignationAcceptance: String | null,
  noc: String | null,
  experienceRelieving: String | null
}
```

Generate these three PDFs:

```text
1. Resignation Acceptance Letter
2. NOC / Clearance Certificate
3. Experience / Relieving Letter
```

For the hackathon:

```text
PDFKit
Local filesystem
/tmp or uploads/documents
```

After generation:

```text
Generate PDF
    ↓
Save file
    ↓
Update OffboardingCase.documentUrls
    ↓
Create DOCUMENT_GENERATED audit entry
```

---

# 10. Notifications and Reminders

No Notification model.

Use Nodemailer directly.

## Stage activation

```text
Stage becomes ACTIVE
        ↓
Resolve assigned user
        ↓
Send email
        ↓
Success → NOTIFICATION_SENT audit
Failure → NOTIFICATION_FAILED audit
```

## Reminder

A reminder can be triggered by:

```text
Manual HR button
OR
Simple scheduled/cron check
```

No WebSocket, notification bell, or in-app notification system is required.

---

# 11. Access Revocation

Access revocation exists only inside:

```text
WorkflowStage.accessRevocation[]
```

Primarily used by:

```text
ADMIN_SYSTEMS
```

Example:

```js
accessRevocation: [
  {
    system: "EMAIL",
    accessIdentifier: "employee@company.com",
    action: "DISABLE",
    status: "COMPLETED",
    executionMode: "MANUAL",
    performedBy: userId,
    performedAt: new Date()
  }
]
```

The hackathon does not need a real Active Directory or email-provider integration.

The system should accurately record the action and audit it.

---

# 12. Existing HROS Models

Reuse the existing schemas.

## Employee

The new models only need:

```text
employeeId → Employee
```

and the following snapshot when offboarding begins:

```text
employeeCode
name
email
designation
department
joiningDate
managerName
```

## User

Used for:

```text
initiatedBy
assignedUserId
completedBy
performedBy
```

## Role

Used for role-based workflow assignment:

```text
PROJECT_MANAGER
ADMIN_SYSTEMS
ACCOUNTS
PERSONNEL
HR
```

Do not create duplicate employee, user, or role collections.

---

# 13. Required Indexes

## OffboardingCase

```js
OffboardingCaseSchema.index({
  status: 1,
  lastWorkingDay: 1,
});

OffboardingCaseSchema.index({
  employeeId: 1,
  status: 1,
});
```

## WorkflowStage

```js
WorkflowStageSchema.index({
  offboardingCaseId: 1,
  sequence: 1,
});

WorkflowStageSchema.index({
  assignedUserId: 1,
  status: 1,
});

WorkflowStageSchema.index({
  roleId: 1,
  status: 1,
});
```

## WorkflowAuditLog

```js
WorkflowAuditLogSchema.index({
  offboardingCaseId: 1,
  timestamp: -1,
});
```

---

# 14. Hackathon Scope Constraints

Keep the implementation intentionally simple.

### Build

```text
✓ Four new MongoDB models
✓ Role-based stage assignment
✓ Sequential workflow
✓ Parallel workflow
✓ Checklist
✓ Approve
✓ Reject
✓ Remarks
✓ Deadlines
✓ Manual reminders
✓ Email notifications
✓ Audit timeline
✓ HR dashboard
✓ Department clearance view
✓ Access revocation tracking
✓ Three generated PDFs
```

### Do NOT build

```text
✗ Workflow designer UI
✗ Drag-and-drop workflow builder
✗ Notification collection
✗ Notification bell
✗ WebSockets
✗ Kafka
✗ RabbitMQ
✗ S3
✗ Real Active Directory integration
✗ Complex branching
✗ Rework workflow
✗ Document version management
✗ Separate task service
✗ Separate microservices
```

---

# 15. Final Collection List

```text
workflowtemplates
offboardingcases
workflowstages
workflowauditlogs
```

Existing HROS collections remain unchanged.

This is the final schema baseline for the hackathon implementation.
