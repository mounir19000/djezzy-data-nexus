import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Activity, Calendar, FileText, Settings, ShieldAlert, Cpu, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSites } from '../../hooks/useSites';

const Sidebar = () => {
  const { logout, user } = useAppStore();
  const navigate = useNavigate();
  const { data: sites, isLoading } = useSites();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isEngineer = user?.role === 'Engineer';
  // Super Admins see all sites. Others might only see their assigned site, but for now we default to MSC10 Blida or dynamic list
  const displaySites = isSuperAdmin ? sites : sites?.filter((s: any) => s.id === 'msc10-blida');

  return (
    <aside className="w-[280px] bg-bg-secondary border-r border-border-subtle h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border-subtle shrink-0">
        <h1 className="text-primary font-display font-bold text-xl tracking-tight">Djezzy SSOP</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {isSuperAdmin && (
          <>
            <div className="text-xs font-mono text-on-surface-variant px-3 py-2 uppercase tracking-wider">
              National Level
            </div>
            <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
              <Map className="w-5 h-5" />
              <span>National Dashboard</span>
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
              <Activity className="w-5 h-5" />
              <span>Analytics</span>
            </NavLink>
          </>
        )}

        {isLoading ? (
          <div className="px-3 py-4 text-sm text-on-surface-variant">Loading sites...</div>
        ) : (
          displaySites?.map((site: any) => (
            <React.Fragment key={site.id}>
              <div className="text-xs font-mono text-on-surface-variant px-3 pt-6 py-2 uppercase tracking-wider">
                {site.name}
              </div>
              <NavLink to={`/twin?siteId=${site.id}`} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
                <Cpu className="w-5 h-5" />
                <span>Digital Twin</span>
              </NavLink>
              <NavLink to={`/power-flow?siteId=${site.id}`} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
                <Activity className="w-5 h-5" />
                <span>Power Flow</span>
              </NavLink>
              <NavLink to={`/settings?siteId=${site.id}`} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
                <Settings className="w-5 h-5" />
                <span>Site Settings</span>
              </NavLink>
            </React.Fragment>
          ))
        )}

        <div className="text-xs font-mono text-on-surface-variant px-3 pt-6 py-2 uppercase tracking-wider">
          Operations
        </div>
        <NavLink to="/incidents" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <ShieldAlert className="w-5 h-5" />
          <span>Incident Center</span>
        </NavLink>
        <NavLink to="/tickets" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <FileText className="w-5 h-5" />
          <span>Ticket Kanban</span>
        </NavLink>
        <NavLink to="/maintenance" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <Calendar className="w-5 h-5" />
          <span>Maintenance</span>
        </NavLink>
        <NavLink to="/knowledge" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <FileText className="w-5 h-5" />
          <span>Knowledge Center</span>
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <FileText className="w-5 h-5" />
          <span>Reports</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-border-subtle flex flex-col gap-1 shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-on-surface-variant hover:bg-status-critical/10 hover:text-status-critical transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
