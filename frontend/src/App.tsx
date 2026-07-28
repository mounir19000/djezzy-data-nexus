import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import NationalOperationsDashboard from './pages/national/NationalOperationsDashboard';
import NationalAnalyticsDashboard from './pages/national/NationalAnalyticsDashboard';
import DigitalTwinDashboard from './pages/twin/DigitalTwinDashboard';
import PowerFlowView from './pages/twin/PowerFlowView';
import IncidentDiagnosisCenter from './pages/operations/IncidentDiagnosisCenter';
import TicketKanban from './pages/operations/TicketKanban';
import MaintenanceCalendar from './pages/operations/MaintenanceCalendar';
import KnowledgeCenter from './pages/operations/KnowledgeCenter';
import ExecutiveReportGenerator from './pages/national/ExecutiveReportGenerator';
import SettingsPage from './pages/settings/SettingsPage';
import LoginPage from './pages/auth/LoginPage';
import { ProtectedRoute, RoleBoundary } from './components/layout/ProtectedRoute';

// Placeholder Pages (To be built in subsequent phases)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <h2 className="text-3xl font-display font-bold text-primary mb-4">{title}</h2>
    <p className="text-on-surface-variant font-sans">This module is scheduled for a future development phase.</p>
  </div>
);

// No more placeholders!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Default Route */}
          <Route index element={<NationalOperationsDashboard />} />
          <Route path="analytics" element={<NationalAnalyticsDashboard />} />
          <Route path="twin" element={<DigitalTwinDashboard />} />
          <Route path="power-flow" element={<PowerFlowView />} />
          <Route path="incidents" element={<IncidentDiagnosisCenter />} />
          <Route path="tickets" element={<TicketKanban />} />
          <Route path="maintenance" element={<MaintenanceCalendar />} />
          <Route path="knowledge" element={<KnowledgeCenter />} />
          <Route path="reports" element={<ExecutiveReportGenerator />} />
          <Route path="settings" element={
            <RoleBoundary allowedRoles={['Super Admin']}>
              <SettingsPage />
            </RoleBoundary>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
