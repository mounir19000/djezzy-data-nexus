DESIGN DIRECTION
Think
IBM Maximo
* Microsoft Azure IoT
* Schneider EcoStruxure
* Honeywell Forge
* Djezzy Branding
________________

COLOR SYSTEM
Primary
Djezzy Yellow
Primary Background
#0F1115
Secondary Background
#181B22
Surface
#242932
Primary Text
White
Secondary Text
Light Gray
Borders
Dark Gray
________________

Status Colors
Healthy
Green
Warning
Amber
Critical
Red
Offline
Gray
Information
Blue
AI
Purple Accent
________________

TYPOGRAPHY
Modern geometric sans-serif.
Scale
Display (40–48 px)
Page Title (32 px)
Section Title (24 px)
Card Title (18 px)
Body (16 px)
Caption (14 px)
Sensor Values (Monospace)
________________

GRID
Desktop
12 columns
Sidebar
280 px
Content
Fluid
Card spacing
24 px
Border radius
16 px
________________

COMPONENT LIBRARY
Navigation
* Sidebar
* Top Bar
* Breadcrumbs
* Tabs
Data Display
* KPI Cards
* Health Score Cards
* Equipment Cards
* Ticket Cards
* Alarm Cards
* Diagnosis Cards
* Maintenance Cards
* Knowledge Cards
Charts
* Line
* Area
* Bar
* Donut
* Gauge
* Heatmap
* Timeline
Forms
* Search
* Dropdown
* Multi-select
* Date Picker
* Comment Box
* File Upload
Tables
* Sortable
* Sticky Header
* Expandable Rows
* Bulk Actions
________________

DIGITAL TWIN COMPONENTS
Interactive Room Card
Equipment Status Badge
Power Flow Node
Electrical Connection Line
Animated Energy Flow
Room Health Overlay
Equipment Tooltip
Alarm Indicator
Ticket Counter Badge
________________

EXPERT SYSTEM COMPONENTS
Diagnosis Card
Problem Badge
Cause Tree
Impact Card
Recommendation Card
Confidence Indicator
Recovery Checklist
Contact Card
________________

TICKET COMPONENTS
Ticket Status Badge
Priority Chip
Assignment Card
Timeline
Engineer Activity Feed
Comments Panel
Attachments
Resolution Summary
________________

HEALTH SCORE COMPONENTS
Overall Site Gauge
Room Gauge
UPS Gauge
Score Breakdown Panel
Threshold Indicator
Trend Sparkline
Health History Chart
The UI should also provide an expandable explanation showing how the score is derived from the weighted room, UPS, and site methodology, including the critical override conditions defined for grid failure scenarios.
________________

MICRO-INTERACTIONS
* Live KPI counters animate on update
* Map markers pulse when a critical alarm appears
* Power flow animates continuously in the Power View
* Alarm cards slide in smoothly
* Ticket status changes animate between Kanban columns
* Health gauges transition smoothly
* Hovering a room highlights connected equipment
* AI Assistant opens as a floating panel
* Skeleton loaders appear while SCADA data is loading
Animations should be subtle (200–300 ms) and reinforce clarity rather than decoration.
________________

RESPONSIVE DESIGN
Although the application targets desktop operations centers, it should remain fully responsive.
Desktop (Primary)
* Full sidebar navigation
* Multi-column dashboards
* Large Digital Twin canvas
* Side-by-side diagnosis and ticket panels
Tablet
* Collapsible sidebar
* Two-column layouts
* Simplified Digital Twin interactions
Mobile
* Responsive support for viewing dashboards and tickets only
* No dedicated mobile-first workflow
* Preserve readability for emergency access
________________

ICONOGRAPHY
Use a consistent outline icon set.
Categories include:
* Site
* Building
* Room
* UPS
* Generator
* Battery
* Cooling
* Temperature
* Humidity
* Voltage
* Alarm
* Ticket
* Maintenance
* Engineer
* AI Assistant
* Knowledge Base
* Report
* Settings
________________

VISUAL PRINCIPLES
* Dark mode by default
* Minimalistic enterprise aesthetic
* Large whitespace
* Rounded cards
* Clear visual hierarchy
* Color reserved for operational status
* Data density balanced with readability
* Every page highlights the next recommended action
The final experience should feel like a premium operations center used by telecom engineers, where SCADA monitoring, Digital Twin visualization, rule-based diagnosis, ticket management, maintenance, and engineering knowledge are unified into a single coherent platform.
