PRODUCT VISION
Design a modern enterprise-grade web platform called Djezzy Smart Site Operations Platform (SSOP).
The platform is an intelligent decision-support system designed to help Djezzy monitor, diagnose, manage, and maintain its telecom infrastructure.
Unlike traditional SCADA systems that only display alarms, this platform transforms raw SCADA events into actionable operational intelligence through:
* Rule-Based Expert System
* Intelligent Incident Management
* Digital Twin Visualization
* Preventive Maintenance
* Engineering AI Assistant
The platform combines operational monitoring with engineering workflows, allowing operators and engineers to move from alarm detection to problem resolution within a single integrated environment.
The MVP focuses on MSC10 Blida for operational management through a Digital Twin while providing a nationwide operational overview for administrators.
________________

PRODUCT OBJECTIVES
The platform has five strategic objectives.
1. Monitor
Continuously monitor telecom sites using real-time SCADA data.
The system receives live information including
* Temperature
* Humidity
* Voltage
* Power Status
* Equipment States
* Alarm Messages
* Timestamp
* Room Status
The platform must always display the current operational state of every monitored site.
________________

1. Diagnose
When an alarm is received, the Rule-Based Expert System immediately analyzes it.
Instead of simply displaying:
UPS FAILURE
the platform provides
Problem detected
Probable causes
Operational impacts
Technical justification
Recommended actions
Personnel to contact
Expected recovery conditions
Confidence based on activated rules
The objective is to reduce diagnosis time while standardizing engineering decisions.
________________
2. Manage Incidents
The platform becomes the operational center for incident management.
Every detected issue follows a structured workflow.
SCADA Alarm

↓

Expert System Diagnosis

↓

Operator Review

↓

Ticket Creation

↓

Engineer Assignment

↓

Engineer Intervention

↓

Incident Report

↓

Ticket Closed

↓

Knowledge Base Updated

The platform should guide users naturally through this workflow without unnecessary complexity.
________________

1. Maintain Infrastructure
Preventive maintenance should become proactive rather than reactive.
Using maintenance schedules extracted from equipment manuals (UPS, Generators, Cooling Systems), the platform automatically:
- reminds engineers of upcoming maintenance
- sends email notifications
- tracks maintenance progress
- validates completed interventions
- stores maintenance history
Maintenance is fully integrated with ticket management.
________________
1. Preserve Engineering Knowledge
Every resolved incident enriches the platform’s internal knowledge.
Each closed ticket contributes to a searchable engineering knowledge base containing:
- symptoms
- diagnosis
- root cause
- corrective actions
- engineer notes
- resolution time
- related equipment
This enables continuous operational improvement without relying on machine learning.
________________

PRODUCT PHILOSOPHY
Traditional SCADA systems answer one question:
What happened?
This platform answers five questions:
What happened?
Why did it happen?
How critical is it?
What should I do now?
Has this happened before?
The interface should always prioritize decision support over raw data visualization.
________________

TARGET USERS
The platform serves different operational roles.
Each user sees only the information required for their responsibilities.
The experience should adapt according to permissions rather than presenting the same interface to everyone.
________________

USER EXPERIENCE PRINCIPLES
The platform should feel:
Professional
Reliable
Calm
Fast
Industrial
Modern
Readable
Operational
Users should never feel overwhelmed by dashboards full of numbers.
Instead, every page should clearly communicate:
Current situation
Current risks
Recommended actions
Next steps
________________

PRODUCT PERSONALITY
The interface should communicate:
Operational confidence
Engineering precision
Trust
Efficiency
Clarity
It should avoid flashy consumer-style interfaces.
The design must resemble software used in mission-critical environments.
________________

OPERATIONAL PHILOSOPHY
Every action inside the platform follows the same lifecycle.
Monitor

↓

Detect

↓

Diagnose

↓

Assign

↓

Resolve

↓

Document

↓

Learn

This operational cycle should be reflected throughout the interface.
________________

DIGITAL TWIN PHILOSOPHY
The Digital Twin is the flagship feature of the MVP.
It is implemented only for MSC10 Blida.
Instead of navigating through tables, engineers interact with the physical representation of the site.
Two synchronized views should be available:
Physical View
Interactive site layout showing:
* UPS Room
* Battery Room
* Switch Room
* Generator Area
* ENR Room
* V-SAT Room
* Cooling Equipment
Selecting a room opens its operational dashboard.
________________

Power Flow View
Interactive visualization inspired by the site’s electrical architecture.
Display the flow of electricity through:
Grid
↓
Transformer
↓
ATS
↓
UPS
↓
Electrical Panels
↓
Technical Rooms
↓
Critical Equipment
Equipment status should be reflected visually.
Healthy equipment appears normal.
Warning equipment is highlighted.
Critical equipment pulses in red.
________________

HEALTH SCORE PHILOSOPHY
Health Scores should be the primary operational indicator.
Rather than exposing dozens of raw measurements, the platform summarizes infrastructure health using three hierarchical scores.
Room Health
Calculated from environmental conditions according to the provided methodology.
________________

UPS Health
Calculated from weighted electrical metrics and alarm penalties.
________________

Overall Site Health
Calculated using weighted room and UPS scores, with override (“kill switch”) rules for severe power conditions.
The interface should always explain why a score changed.
________________

ENGINEERING ASSISTANT
The integrated AI Assistant is designed as an engineering copilot.
It should help users by:
* explaining alarms
* interpreting diagnoses
* answering engineering questions
* searching maintenance manuals
* retrieving previous incidents
* generating reports
* assisting with troubleshooting
The assistant complements the Rule-Based Expert System but never replaces it.
________________

DESIGN GOALS
The platform should reduce:
Diagnosis time
Ticket creation time
Incident resolution time
Maintenance delays
Operator workload
Navigation complexity
________________

SUCCESS METRICS
A successful design allows users to:
Understand site health within five seconds.
Locate a failing room in less than three clicks.
Create a ticket in under one minute.
Understand expert recommendations immediately.
Complete maintenance validation quickly.
Navigate naturally without training.
________________

HACKATHON DEMONSTRATION SCENARIO
The UI should support a smooth end-to-end demonstration.
Scenario:
A temperature increase is detected.
↓
SCADA generates an alarm.
↓
Expert System produces a diagnosis.
↓
Site Operator reviews recommendations.
↓
Site Operator creates a ticket.
↓
Engineer receives the assignment.
↓
Engineer follows the recommended actions.
↓
Engineer resolves the incident.
↓
Ticket is closed.
↓
Knowledge Base is updated.
↓
Dashboard Health Score improves.
This complete workflow should feel seamless and intuitive.