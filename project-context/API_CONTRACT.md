# API Contract: Employee Offboarding Automation

## Base URL
`http://localhost:5000/api`

## Authentication Headers
All protected endpoints require mock authentication headers:
- `x-user-id`: MongoDB ObjectId of the requesting user.
- `x-role-id`: MongoDB ObjectId of the user's role.

---

## 1. System Metadata & Reference Endpoints (Public)

### `GET /api/health`
Returns system health.
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-08T09:31:09.646Z"
}
```

### `GET /api/roles`
Returns all system roles.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b392d348f8f01234",
      "name": "Project Manager",
      "code": "PROJECT_MANAGER"
    }
  ]
}
```

### `GET /api/users`
Returns all mock users with populated roles.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b392d348f8f05678",
      "name": "HR User",
      "email": "hr@terralogic.com",
      "roleId": {
        "_id": "60d5ecb8b392d348f8f01234",
        "name": "Human Resources",
        "code": "HR"
      }
    }
  ]
}
```

### `GET /api/employees`
Returns all employees available for offboarding.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b392d348f8f09999",
      "employeeCode": "EMP001",
      "name": "John Doe",
      "email": "john.doe@terralogic.com",
      "designation": "Developer",
      "department": "Engineering",
      "joiningDate": "2023-01-15T00:00:00.000Z",
      "managerName": "Project Manager User"
    }
  ]
}
```

---

## 2. Offboarding Lifecycle Endpoints (Protected)

### `POST /api/offboarding`
Initiates a new offboarding case for an employee.
- **Headers**: `x-user-id`, `x-role-id`
- **Request Body**:
```json
{
  "employeeId": "60d5ecb8b392d348f8f09999",
  "resignationDate": "2026-09-01",
  "lastWorkingDay": "2026-09-30",
  "reason": "Career transition"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Offboarding case initiated successfully",
  "data": {
    "case": {
      "_id": "60d5ecb8b392d348f8f0aaaa",
      "caseNumber": "OFF-869790",
      "employeeId": "60d5ecb8b392d348f8f09999",
      "status": "IN_PROGRESS",
      "currentSequence": 1,
      "employeeSnapshot": {
        "employeeCode": "EMP001",
        "name": "John Doe",
        "email": "john.doe@terralogic.com",
        "designation": "Developer",
        "department": "Engineering"
      }
    },
    "stages": [
      {
        "_id": "60d5ecb8b392d348f8f0bbbb",
        "stageCode": "PROJECT_MANAGER",
        "sequence": 1,
        "status": "ACTIVE"
      }
    ]
  }
}
```

### `GET /api/offboarding`
Retrieves all offboarding cases for the HR dashboard.
- **Headers**: `x-user-id`, `x-role-id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b392d348f8f0aaaa",
      "caseNumber": "OFF-869790",
      "status": "IN_PROGRESS",
      "currentSequence": 1,
      "employeeId": { ... },
      "initiatedBy": { "name": "HR User", "email": "hr@terralogic.com" }
    }
  ]
}
```

### `GET /api/offboarding/:id`
Retrieves a single offboarding case with all stages and audit history.
- **Headers**: `x-user-id`, `x-role-id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "case": { ... },
    "stages": [ ... ],
    "auditLogs": [ ... ]
  }
}
```

---

## 3. Department Task & Clearance Endpoints (Protected)

### `GET /api/tasks`
Retrieves tasks assigned to the caller's role (`x-role-id`) in `ACTIVE` or `PENDING` status.
- **Headers**: `x-user-id`, `x-role-id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ecb8b392d348f8f0bbbb",
      "stageCode": "PROJECT_MANAGER",
      "stageName": "Project / Reporting Manager",
      "sequence": 1,
      "status": "ACTIVE",
      "checklist": [
        {
          "itemId": "PROJECT_COMPLETION",
          "label": "Project responsibilities completed",
          "required": true,
          "completed": false
        }
      ],
      "offboardingCaseId": { ... }
    }
  ]
}
```

### `POST /api/tasks/:id/complete` (or `PUT /api/tasks/:id`)
Submits clearance decision (`APPROVED` or `REJECTED`), checklist updates, remarks, and access revocation actions.
- **Headers**: `x-user-id`, `x-role-id`
- **Request Body**:
```json
{
  "status": "APPROVED",
  "remarks": "All knowledge transfer completed",
  "checklist": [
    {
      "itemId": "PROJECT_COMPLETION",
      "completed": true
    },
    {
      "itemId": "KNOWLEDGE_TRANSFER",
      "completed": true
    },
    {
      "itemId": "ACCESS_REVIEW",
      "completed": true
    }
  ],
  "accessRevocation": [
    {
      "system": "EMAIL",
      "accessIdentifier": "john.doe@terralogic.com",
      "action": "DISABLE",
      "status": "COMPLETED"
    }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "stage": {
      "_id": "60d5ecb8b392d348f8f0bbbb",
      "status": "APPROVED",
      "completedAt": "2026-09-08T09:31:09.900Z"
    },
    "caseStatus": "IN_PROGRESS",
    "currentSequence": 2
  }
}
```

## 4. Static Document Downloads (Public)

### `GET /uploads/documents/:filename`
Downloads dynamically generated PDF certificates and letters:
- `resignation-{caseNumber}.pdf`: Resignation Acceptance Letter
- `noc-{caseNumber}.pdf`: No Objection Certificate & Clearance Record
- `relieving-{caseNumber}.pdf`: Experience & Relieving Letter

- **Response (200 OK)**:
  - `Content-Type: application/pdf`
  - Streamed binary PDF file buffer.
