# Djezzy Data Nexus (DDN) - Agent Guide

Welcome, AI Agent! This document is designed to give you a comprehensive understanding of the Djezzy Data Nexus (DDN) project. Read this file to grasp the core functionality, user roles, design philosophy, and what needs to be built.

## 1. Product Vision
DDN is an enterprise-grade, intelligent decision-support system meant to help Djezzy monitor, diagnose, manage, and maintain its telecom infrastructure.

Unlike traditional SCADA (Supervisory Control and Data Acquisition) systems that simply show raw data and alarms, DDN provides **operational intelligence**. It answers not just "What happened?" but also "Why did it happen?", "How critical is it?", and "What should I do now?".

**The MVP (Minimum Viable Product) focuses on a pilot site: MSC10 Blida.**

## 2. The Golden Operational Workflow
Every action in the platform revolves around this core lifecycle:
1. **Monitor/Detect:** Real-time SCADA sensors detect an anomaly (e.g., Temperature spike, Power failure).
2. **Diagnose:** A Rule-Based Expert System analyzes the alarm and generates a diagnosis (probable causes, impacts, recommended actions).
3. **Ticket Creation:** A Site Operator reviews the AI diagnosis and creates an actionable ticket.
4. **Assign & Resolve:** An Engineer receives the ticket, intervenes, and resolves the issue using the platform's guidance and tools.
5. **Document & Learn:** The ticket is closed, automatically generating an Incident Report that is fed into a searchable Knowledge Base to help with future incidents.

## 3. Key Modules & Features
*   **Digital Twin (The Flagship Feature):** Exclusively for the MSC10 Blida pilot site. It features two synchronized views:
    *   *Physical View:* An interactive floor plan showing the UPS Room, Battery Room, Switch Room, etc. Clicking a room shows its specific health, metrics, and equipment.
    *   *Power Flow View:* An animated electrical topology (Grid -> Transformer -> ATS -> UPS -> Panels -> Rooms). It visually traces the flow of energy and highlights critical paths in red.
*   **Incident Center:** The operational hub combining live alarms, expert diagnoses, and professional Kanban-style ticketing.
*   **Hierarchical Health Scores:** Instead of raw data, the system relies on Health Scores:
    *   *Room Health* (based on temp/humidity)
    *   *UPS Health* (based on electrical metrics & penalties)
    *   *Overall Site Health* (weighted aggregate with critical override "kill switches").
*   **Maintenance Module:** Proactive scheduling, pipeline tracking, and historical logging of equipment maintenance.
*   **Engineering AI Assistant:** A floating chat interface that can explain diagnoses, search manuals, summarize incidents, and answer engineering questions.

## 4. User Roles & Dashboards
The UI is role-based, ensuring users only see what matters to them:
1.  **Super Administrator:** National-level overview. They see an interactive map of Algeria, overall health KPIs across all sites, and handle user/system administration.
2.  **Engineer:** Focuses on resolving issues at MSC10 Blida. Their home screen is the Digital Twin, alongside their assigned tickets and pending maintenance tasks.
3.  **Site Operator:** Focuses on monitoring and escalating. They see live SCADA data, alarms, and the Digital Twin, and are responsible for creating tickets for Engineers.

## 5. Data Architecture
*   **Environmental Sensors:** Ambient, Switch Room, Battery Room, ENR Room, and V-SAT Room temperatures & humidity.
*   **Power Telemetry:** Grid Power (L1, L2, L3 Voltage, Frequency), UPS Output (Voltage, Current, Load), UPS Internal (Temp, Battery Capacity).
*   **Alarms:** Grid power failures, high-temperature alerts, UPS faults (bypass mode), AC unit logs.

## 6. UI/UX & Design System
*   **Aesthetic:** Professional, reliable, industrial, and modern. Inspired by IBM Maximo, Honeywell Forge, and Azure IoT. It should NOT look like a generic or flashy dashboard.
*   **Theme:** Dark mode by default (Primary BG: `#0F1115`, Surface: `#242932`).
*   **Colors:** Djezzy Yellow (Primary), White/Light Gray (Text), Green (Healthy), Amber (Warning), Red (Critical), Purple (AI).
*   **Typography:** Modern geometric sans-serif (e.g., Inter, Roboto) tailored for readability.
*   **Responsiveness:** Desktop-first (intended for Network Operation Centers). Tablet supported. Mobile is strictly for emergency read-only access.

## 7. What We Need (Development Goals)
When building or expanding this application, your tasks will generally involve:
1.  **Building the UI Components:** Creating robust, reusable enterprise components (KPI cards, gauge charts, interactive map, Kanban boards).
2.  **Developing the Digital Twin:** Implementing the interactive floor plan (Physical View) and animated topology (Power Flow View).
3.  **Implementing the Logic:** Connecting the SCADA data simulation to the Health Score calculation logic and Rule-Based Expert System.
4.  **Enforcing the Workflow:** Ensuring the UI logically guides the user from Alarm -> Diagnosis -> Ticket -> Resolution.

*Always refer back to this guide to ensure your implementation aligns with the enterprise, mission-critical nature of Djezzy Data Nexus.*
