import React from 'react';
import { Bell, User, Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Topbar = () => {
  const { userRole } = useAppStore();

  return (
    <header className="h-16 bg-background border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search equipment, tickets..." 
            className="w-full bg-bg-surface border border-border-subtle rounded-md pl-10 pr-4 py-1.5 text-sm font-sans focus:outline-none focus:border-primary transition-colors text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4 border-r border-border-subtle pr-4">
          <div className="w-2 h-2 rounded-full bg-status-healthy"></div>
          <span className="text-sm font-mono text-status-healthy">System Online</span>
        </div>
        
        <button className="relative p-2 hover:bg-bg-surface rounded-full transition-colors">
          <Bell className="w-5 h-5 text-on-surface" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-status-critical rounded-full border border-background"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-sans font-medium text-on-surface">Admin User</div>
            <div className="text-xs font-mono text-primary">{userRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center">
            <User className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
