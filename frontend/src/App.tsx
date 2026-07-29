import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import NationalOperationsDashboard from './pages/national/NationalOperationsDashboard';
import SiteDashboard from './pages/sites/SiteDashboard';
import DigitalTwinDashboard from './pages/twin/DigitalTwinDashboard';
import PowerFlowView from './pages/twin/PowerFlowView';
import IncidentDiagnosisCenter from './pages/operations/IncidentDiagnosisCenter';
import TicketKanban from './pages/operations/TicketKanban';
import MaintenanceCalendar from './pages/operations/MaintenanceCalendar';
import KnowledgeCenter from './pages/operations/KnowledgeCenter';
import Reports from './pages/operations/Reports';
import NotificationsPage from './pages/operations/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute, RoleBoundary } from './components/layout/ProtectedRoute';
import { useAppStore } from './store/useAppStore';

const RoleHome = () => {
  const user = useAppStore((state) => state.user);

  if (user?.role === 'Engineer') return <Navigate to="/sites/msc10-blida/dashboard" replace />;
  if (user?.role === 'Site Operator') return <Navigate to="/sites/msc10-blida/incidents" replace />;

  return <NationalOperationsDashboard />;
};

const SiteQueryRedirect = ({ target }: { target: 'digital-twin' | 'power-flow' }) => {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId') || 'msc10-blida';

  return <Navigate to={`/sites/${siteId}/${target}`} replace />;
};

const LegacySettingsRoute = () => {
  return (
    <RoleBoundary allowedRoles={['Super Admin']}>
      <SettingsPage />
    </RoleBoundary>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/*" element={<Navigate to="/login" replace />} />
        
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Default Route */}
          <Route index element={<RoleHome />} />
          <Route path="sites/:siteId" element={<Navigate to="dashboard" replace />} />
          <Route path="sites/:siteId/dashboard" element={<SiteDashboard />} />
          <Route path="sites/:siteId/digital-twin" element={<DigitalTwinDashboard />} />
          <Route path="sites/:siteId/power-flow" element={<PowerFlowView />} />
          <Route path="sites/:siteId/incidents" element={<IncidentDiagnosisCenter />} />
          <Route path="sites/:siteId/tickets" element={<TicketKanban />} />
          <Route path="sites/:siteId/reports" element={<Reports />} />
          <Route path="twin" element={<SiteQueryRedirect target="digital-twin" />} />
          <Route path="power-flow" element={<SiteQueryRedirect target="power-flow" />} />
          <Route path="incidents" element={<IncidentDiagnosisCenter />} />
          <Route path="tickets" element={<TicketKanban />} />
          <Route path="maintenance" element={
            <RoleBoundary allowedRoles={['Super Admin', 'Engineer', 'Site Operator']}>
              <MaintenanceCalendar />
            </RoleBoundary>
          } />
          <Route path="knowledge" element={<KnowledgeCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<LegacySettingsRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
