ROLE
You are a Senior Product Designer with over 20 years of experience designing enterprise software for Industrial IoT, Telecom Operations, SCADA Systems, Network Operations Centers (NOC), Digital Twin platforms, and Incident Management Systems.
Your mission is to design a world-class enterprise web platform for Djezzy, one of Algeria’s largest telecommunications operators.
The final design should be polished enough to impress hackathon judges while remaining realistic for production deployment.
The platform should feel inspired by:
* IBM Maximo
* Honeywell Forge
* Microsoft Azure IoT Central
* Schneider EcoStruxure
* Siemens Insights Hub
* Cisco ThousandEyes
* Grafana Enterprise
* ServiceNow IT Operations
while respecting Djezzy’s visual identity.
________________

PRODUCT
Design a platform called
Djezzy Data Nexus (DDN)
This is an intelligent operational platform that combines
* SCADA Monitoring
* Rule-Based Expert System
* Incident Management
* Digital Twin
* Preventive Maintenance
* Engineering Knowledge Base
* AI Engineering Assistant
into one unified experience.
The platform supports the operational workflow of Djezzy engineers from the moment an alarm appears until the incident is resolved and documented.
________________

PROJECT CONTEXT
The system receives real-time SCADA data from telecom infrastructure.
Available information includes
* Temperature
* Humidity
* Voltage
* Equipment Status
* Alarm Messages
* Timestamp
* Electrical Measurements
* Room Status
The platform transforms raw SCADA events into engineering decisions.
________________

MVP SCOPE
The platform supports two operational levels.
National Level
Used by Super Administrators.
Provides
* National KPIs
* Interactive Algeria Map
* Overall Health Score
* Site Comparison
* User Management
* Reports
* Maintenance Statistics
No Digital Twin is available except for the pilot site.
________________

Pilot Site
MSC10 Blida
This site contains the complete operational experience including
Digital Twin
Interactive Room Navigation
Power Flow View
Live SCADA Monitoring
Expert Diagnosis
Ticket Management
Maintenance
Knowledge Center
AI Assistant
________________

USERS
Super Administrator
Can access
All sites
National dashboards
Users
Permissions
Reports
Maintenance
Knowledge Base
Configuration
________________

Engineer
Responsible for
Monitoring the Blida Digital Twin
Receiving assigned tickets
Reviewing expert diagnosis
Resolving incidents
Closing tickets
Submitting incident reports
Validating maintenance
Searching historical failures
________________

Site Operator
Responsible for
Monitoring SCADA
Monitoring Digital Twin
Receiving alarms
Reviewing diagnosis
Creating tickets
Escalating incidents
Tracking engineer progress
________________

MAIN MODULES
The platform is composed of
Dashboard
Site Monitoring
Digital Twin
Incident Center
Maintenance
Knowledge Center
AI Assistant
Administration
Settings
________________

DASHBOARD
Design role-based dashboards.
Super Admin Dashboard
Must include
National Health Score
Interactive Algeria Map
Site Ranking
Open Tickets
Critical Sites
Recent Incidents
Maintenance Compliance
Health Trends
Regional Comparison
Executive Summary
________________

Engineer Dashboard
Must focus on MSC10.
Include
Site Health
Assigned Tickets
Pending Tickets
Solved Tickets
Temperature
Humidity
Voltage
Digital Twin Preview
Recent Diagnoses
Maintenance Tasks
________________

Site Operator Dashboard
Include
Current Health Score
Digital Twin
Live Alarms
Create Ticket
Environmental Metrics
Open Tickets
Recent Diagnoses
________________

DIGITAL TWIN
This is the flagship feature.
Create two synchronized modes.
________________

Physical View
Interactive site layout.
Rooms
UPS Room
Battery Room
Switch Room
Generator Area
ENR Room
V-SAT Room
Electrical Room
Cooling Systems
Clicking a room opens
Room Dashboard
________________

Every room displays
Health Score
Temperature
Humidity
Equipment
Open Tickets
Current Alarm
Maintenance Status
________________

Power Flow View
Inspired by the electrical distribution architecture.
Display
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
Electricity should be animated.
Healthy path
Yellow
Critical path
Red pulse
Disconnected
Gray
Hovering equipment displays
Voltage
Status
Temperature
Health
Tickets
________________

ROOM DASHBOARD
Each room displays
Health Score
Environmental Metrics
Equipment Cards
Temperature Trend
Humidity Trend
Current Tickets
Alarm Timeline
Maintenance Status
Recent Activity
________________

EQUIPMENT PAGE
Every equipment page includes
General Information
Manufacturer
Model
Installation Date
Health Score
Live SCADA Data
Alarm History
Maintenance History
Current Tickets
Expert Diagnosis
Related Knowledge Articles
________________

INCIDENT CENTER
The operational core.
Contains four sections.
________________

Live Alarms
Streaming alarms.
Each alarm displays
Time
Equipment
Severity
Description
Room
Status
________________

Expert Diagnosis
Selecting an alarm opens
Problem Detected
Probable Causes
Operational Impacts
Technical Justification
Recommended Actions
Recovery Conditions
Personnel to Contact
Confidence Level
This diagnosis is entirely generated by the Rule-Based Expert System.
________________

Tickets
Professional ticket management.
Views
Table
Kanban
Timeline
Ticket Status
Pending
Assigned
In Progress
Resolved
Closed
Ticket Details
Priority
Equipment
Engineer
Diagnosis
Photos
Comments
Resolution
History
________________

Incident Report
Automatically generated after ticket closure.
Contains
Timeline
Engineer Notes
Photos
Resolution
Duration
Lessons Learned
Related Equipment
________________

TICKET WORKFLOW
Follow exactly this workflow.
SCADA Alarm

↓

Rule-Based Expert System

↓

Diagnosis

↓

Site Operator Reviews

↓

Create Ticket

↓

First Assignment

↓

Engineer Intervention

↓

Engineer Resolves

↓

Close Ticket

↓

Incident Report

↓

Knowledge Base Updated

The UI should naturally guide users through this sequence.
________________

MAINTENANCE
Three major pages.
Maintenance Calendar
Maintenance Pipeline
Maintenance History
Every maintenance task includes
Equipment
Checklist
Responsible Engineer
Attachments
Photos
Validation
Completion Status
Email Reminder
Supervisor Approval
________________

KNOWLEDGE CENTER
A searchable engineering knowledge repository.
Every closed incident becomes a reusable case.
Each article contains
Symptoms
Problem
Cause
Resolution
Engineer Notes
Related Tickets
Related Equipment
Search by
Equipment
Room
Failure Type
Date
________________

AI ASSISTANT
Floating assistant available from every page.
Capabilities
Explain diagnosis
Search manuals
Generate reports
Summarize incidents
Search Knowledge Base
Explain alarms
Answer engineering questions
Generate maintenance recommendations
Example
“Explain UPS Failure.”
“What caused Ticket #145?”
“Search previous battery failures.”
“Generate today’s report.”
________________

HEALTH SCORE
Health Score is one of the primary KPIs.
The UI must visualize the methodology rather than only showing the final value.
Include:
* Overall Site Health
* Room Health
* UPS Health
* Health trend
* Score breakdown
* Threshold indicators
Represent the calculations according to the documented methodology, including room scoring, UPS scoring, weighted site aggregation, and critical override (“kill switch”) conditions.
Users should be able to click a health score to understand why it increased or decreased.
________________

DESIGN SYSTEM
Dark mode by default.
Inspired by Djezzy.
Use
Black
Graphite
Yellow Accent
White Typography
Green
Amber
Red
Purple Accent for AI
Enterprise typography.
Rounded cards.
Minimal shadows.
Large spacing.
Premium appearance.
________________

COMPONENTS
Design reusable components.
Navigation
Sidebar
Top Bar
Breadcrumbs
Search
Dashboard
KPI Cards
Health Cards
Charts
Tables
Equipment Cards
Alarm Cards
Diagnosis Cards
Ticket Cards
Knowledge Cards
Maintenance Cards
Power Flow Components
Digital Twin Components
AI Components
Dialogs
Forms
Notifications
Timeline
________________

ANIMATIONS
Subtle enterprise animations.
Power Flow Animation
Live Alarm Animation
Animated Health Gauges
Map Marker Pulse
Kanban Drag
Chart Updates
Hover Effects
Skeleton Loading
Success States
Transitions
________________

UX PRINCIPLES
Every screen should answer
What happened?
Why?
How severe?
What should I do?
What happens next?
The user should never need more than three clicks to access any equipment from the Digital Twin.
________________

RESPONSIVE
Primary target
Desktop
Secondary
Tablet
Mobile responsiveness only for emergency consultation.
No dedicated mobile application.
________________

DELIVERABLES
Generate a complete enterprise UI including
* Information Architecture
* User Flows
* Wireframes
* High-Fidelity Mockups
* Desktop Screens
* Tablet Screens
* Component Library
* Design System
* Interactive Prototype
* Empty States
* Error States
* Loading States
* Micro-interactions
* Accessibility Guidelines
* Developer Handoff Notes
________________

DESIGN QUALITY
The final result must not look like a student dashboard.
It should look like a platform that Djezzy could genuinely deploy in its Network Operations Center.
The design should communicate:
* Operational reliability
* Engineering precision
* Decision support
* Situational awareness
* Simplicity despite complexity
The Digital Twin should be the visual centerpiece of the product, while the Incident Center should serve as the operational hub connecting SCADA monitoring, expert diagnosis, ticket management, maintenance, and the engineering knowledge base into one coherent workflow.
________________
