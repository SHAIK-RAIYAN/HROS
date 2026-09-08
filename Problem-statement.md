# Problem Statement: Employee Offboarding Automation 

## 1. Background

The current employee offboarding process at Terralogic is largely manual and paper-based. When an employee resigns or is relieved, HR initiates a physical clearance process involving multiple departments. Documents such as the No Objection Certificate (NOC), Resignation Acceptance Letter, and Experience/Relieving Letter are manually prepared, circulated, signed, and tracked.

The NOC requires clearance from multiple departments, including Project/Reporting Manager, Admin & Systems, Accounts, Personnel, and HR. Since the process depends on physical documents and manual follow-ups, HR has limited visibility into the overall progress and cannot easily determine which department has completed or is delaying the clearance.

The objective is to digitize and automate this process within the existing BlazeUp HROS platform.

## 2. Current Process

### No Objection Certificate (NOC)

Each department verifies and clears the employee based on their responsibilities:

Project / Reporting Manager: Project completion, knowledge transfer, and client/system access.
Admin & Systems: Laptop, charger, phone, data card, keys, email ID, and system access.
Accounts: Travel advances, staff loans, salary advances, and imprest.
Personnel: ID card, access card, and business cards.
HR: Final clearance and certification.

### Resignation Acceptance Letter

The letter is manually prepared with employee details, resignation date, and last working day. It also includes the applicable Non-Compete and Non-Solicitation clauses and requires approval/sign-off from the relevant parties.

### Experience / Relieving Letter

The Experience/Relieving Letter is currently generated manually and issued to the employee on or after their last working day.

## 3. Problems with the Current Process

No centralized visibility: HR cannot see the overall offboarding progress in real time.
Manual follow-ups: HR needs to individually follow up with departments for pending clearances.
Process delays: Physical documents can be misplaced, delayed, or remain pending with approvers.
No audit trail: There is no centralized digital record of who approved a clearance, when it was approved, or what remarks were provided.
Duplicate data entry: Employee information needs to be manually entered across multiple documents.
No automated notifications: Approvers are not automatically notified when action is required.
No deadline tracking: There is no systematic tracking of clearance activities against the employee's last working day.
Manual document generation: Offboarding-related documents require manual preparation and processing.
Manual access revocation: System and email access removal is not connected to the offboarding workflow.

## 4. Proposed Solution

Build an Employee Offboarding Automation module within BlazeUp HROS that digitizes the complete offboarding and clearance process.

The workflow should be driven by a configurable global approval chain rather than a simple checklist.

The approval chain should support:

Configurable stages: HR administrators can define and reorder approval stages.
Role-based approvals: Each stage is assigned to a role rather than a specific individual.
Sequential and parallel approvals: Stages can either execute sequentially or allow multiple departments to work in parallel where applicable.
Auditability: Every approval, rejection, remark, and action should be recorded with the user's name, role, and timestamp.
Reusability: The approval chain engine should be designed as a generic workflow capability that can support other HROS processes in the future.

## 5. Functional Requirements

### A. Offboarding Initiation

HR should be able to initiate an employee's offboarding by providing:

Employee
Resignation date
Last working day
Reason/details, where applicable

Employee information should be automatically populated from the existing employee database.

Once initiated, the configured approval chain should be created and the relevant approvers should be notified.

### B. Digital Clearance

Each department should receive its respective clearance task based on the approval chain.

The clearance should include:

Department-specific checklist/items
Remarks/comments
Approval/sign-off
Approver name and role
Approval timestamp

The next stage should become active based on the configured workflow rules.

### C. Notifications and Reminders

The system should:

Notify approvers when their stage becomes active.
Send reminders for pending actions based on configured timelines.
Notify HR when the complete offboarding workflow is completed.
Allow HR to manually send reminders for pending stages.

### D. Document Generation

The system should automatically generate:

Resignation Acceptance Letter
NOC / Clearance Certificate
Experience / Relieving Letter

Documents should be pre-populated with employee information and generated as downloadable PDFs.

### E. HR Offboarding Dashboard

HR should have a centralized view of all active offboarding cases, including:

Employee details
Resignation date
Last working day
Overall offboarding status
Approval chain progress
Completed, active, and pending stages
Pending approver
Timeline of activities
Manual reminder option

### F. Access Revocation

Admin & Systems clearance should capture access revocation activities, including the deletion of the employee's email ID and other applicable system access.

The system should record the action along with the timestamp and responsible user.

Where system integrations are available, access revocation should be capable of being triggered automatically.

## 6. Technical Requirements

The solution should be implemented within the existing BlazeUp HROS architecture:

Backend: Node.js microservices
Database: MongoDB
Frontend: React
Reuse existing employee data and APIs.
Implement the approval chain as a generic, reusable workflow engine rather than coupling it specifically to offboarding.
Maintain a complete audit history for workflow actions and approvals.

## 7. Expected Outcome

The automated offboarding workflow should replace the current paper-based process with a centralized, trackable, and auditable digital workflow, enabling HR and departments to complete employee clearance efficiently while providing real-time visibility, automated notifications, standardized documentation, and clear accountability at every stage.
