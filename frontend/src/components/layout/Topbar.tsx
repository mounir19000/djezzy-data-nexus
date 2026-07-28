import React from 'react';
import { Bell, Search, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-background border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search tickets, alarms, equipment..." 
            className="w-full bg-bg-surface border border-border-subtle rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-bg-surface">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-status-critical rounded-full border border-background"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-bg-surface">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-bg-surface">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-border-subtle pl-4 ml-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm uppercase">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-on-surface leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-on-surface-variant font-mono">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="ml-2 text-on-surface-variant hover:text-status-critical transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
