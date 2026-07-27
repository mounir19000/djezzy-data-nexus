PLATFORM ARCHITECTURE
The platform is divided into operational modules rather than technical modules.
Dashboard

│

├── Site Monitoring

├── Digital Twin (MSC10)

├── Incident Center

├── Maintenance

├── Knowledge Center

├── AI Assistant

├── Administration

└── Settings

This organization reflects the daily workflow of engineers.
________________

USER ROLES
1. Super Administrator
The Super Administrator has complete visibility over the Djezzy infrastructure.
Responsibilities:
* View all telecom sites
* Monitor nationwide KPIs
* Manage users
* Configure expert rules
* Manage maintenance schedules
* Access all incident reports
* Generate executive reports
* Manage permissions
* Configure platform settings
Dashboard includes:
* Overall Health KPI
* Site comparison
* National map
* Active incidents
* Maintenance compliance
* User activity
* Reports
________________

1. Engineer
Engineers are responsible for resolving incidents at the MSC10 Blida pilot site.
Responsibilities:
- Monitor the Digital Twin
- Receive ticket assignments
- Review expert diagnoses
- Investigate incidents
- Resolve tickets
- Close tickets
- Submit incident reports
- Validate maintenance completion
Primary workspace:
Digital Twin
Incident Center
Maintenance
Knowledge Center
AI Assistant
________________
1. Site Operator
The Site Operator continuously monitors the Blida site.
Responsibilities:
- Monitor live SCADA data
- Receive alarms
- Review expert diagnosis
- Create tickets
- Notify engineers
- Track ticket status
Operators cannot close tickets.
They focus on monitoring and incident escalation.
________________

ROLE-BASED EXPERIENCE
Each role has a personalized homepage.
________________

Super Administrator Home
National Overview Dashboard
Widgets:
Overall Health Score
Interactive Algeria map
Site Health Ranking
Critical Sites
Active Tickets
Pending Maintenance
Recent Incidents
Alarm Statistics
Reports
User Activity
________________

Engineer Home
Digital Twin Dashboard
Widgets:
Blida Health Score
Open Tickets
Assigned Tickets
Solved Tickets
Pending Maintenance
Temperature
Humidity
Voltage
Recent Diagnoses
________________

Site Operator Home
Monitoring Dashboard
Widgets:
Live Alarms
Digital Twin
Current Health Score
Open Tickets
Create Ticket
Environmental Metrics
Recent Diagnoses
________________

INCIDENT CENTER
The Incident Center is the operational heart of the platform.
It combines:
Live Alarms
Expert Diagnosis
Tickets
Incident Reports
Failure History
Knowledge Base
This avoids switching between multiple disconnected modules.
________________

TICKET WORKFLOW
SCADA Alarm

↓

Expert System

↓

Operator Reviews Diagnosis

↓

Create Ticket

↓

First Assignment

↓

Engineer Intervention

↓

Engineer Closes Ticket

↓

Incident Report

↓

Knowledge Center

Every ticket progresses through clearly defined states.
Pending
Assigned
In Progress
Resolved
Closed
________________

KNOWLEDGE CENTER
Every closed incident becomes reusable engineering knowledge.
Each record contains:
Problem
Symptoms
Equipment
Diagnosis
Root Cause
Corrective Actions
Maintenance Performed
Engineer Notes
Resolution Time
Related Tickets
Related Equipment
This module acts as an internal engineering knowledge repository.
________________

DIGITAL TWIN NAVIGATION
Available only for MSC10 Blida.
Navigation hierarchy:
MSC10 Blida

↓

Physical View

↓

Room

↓

Equipment

↓

Metrics

↓

Diagnosis

↓

Tickets

↓

Maintenance

Power Flow View provides an alternative visualization:
Grid

↓

Transformer

↓

ATS

↓

UPS

↓

Distribution Panels

↓

Rooms

↓

Equipment

Both views remain synchronized.
________________

GLOBAL NAVIGATION
The sidebar should include:
Dashboard
Site Monitoring
Digital Twin
Incident Center
Maintenance
Knowledge Center
AI Assistant
Administration (Super Admin only)
Settings
________________

BREADCRUMBS
Always visible.
Example:
Dashboard

> 
> 

MSC10 Blida

> 
> 

Battery Room

> 
> 

UPS 2

> 
> 

Open Ticket #145

---

GLOBAL SEARCH
Search across:
Sites
Rooms
Equipment
Tickets
Incident Reports
Knowledge Articles
Maintenance Tasks
Users (Admin only)
Autocomplete should be available.
________________

NOTIFICATION CENTER
Centralized notifications for:
Critical alarms
New tickets
Ticket assignments
Maintenance reminders
Maintenance overdue
Engineer mentions
System notifications
Notifications are role-aware.
________________

PERMISSION MATRIX
Feature
Super Admin
Engineer
Site Operator
View all sites
✅
❌
❌
View MSC10 Digital Twin
✅
✅
✅
Monitor alarms
✅
✅
✅
View expert diagnosis
✅
✅
✅
Create ticket
✅
❌
✅
Assign ticket
✅
✅
❌
Resolve ticket
✅
✅
❌
Close ticket
✅
✅
❌
Manage users
✅
❌
❌
Configure expert rules
✅
❌
❌
Manage maintenance schedules
✅
✅
❌
Access Knowledge Center
✅
✅
✅
Use AI Assistant
✅
✅
✅
________________

INFORMATION PRIORITY
Every page follows the same hierarchy:
1. Current operational status
2. Active incidents
3. Expert diagnosis
4. Required actions
5. Historical context
6. Supporting documentation
This consistent structure ensures users always know what is happening, what requires attention, and what to do next, regardless of their role.