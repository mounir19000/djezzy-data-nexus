import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Activity, Calendar, FileText, Settings, ShieldAlert, Cpu, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Sidebar = () => {
  const { logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[280px] bg-bg-secondary border-r border-border-subtle h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border-subtle shrink-0">
        <h1 className="text-primary font-display font-bold text-xl tracking-tight">Djezzy SSOP</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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

        <div className="text-xs font-mono text-on-surface-variant px-3 pt-6 py-2 uppercase tracking-wider">
          MSC10 Blida
        </div>
        <NavLink to="/twin" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <Cpu className="w-5 h-5" />
          <span>Digital Twin</span>
        </NavLink>
        <NavLink to="/power-flow" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <Activity className="w-5 h-5" />
          <span>Power Flow</span>
        </NavLink>

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
        <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}>
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
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
