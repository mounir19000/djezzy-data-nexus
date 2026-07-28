import { Search } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { NotificationTray } from '../ui/NotificationTray';

const Topbar = () => {
  const { user } = useAppStore();

  return (
    <header className="h-16 bg-background border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search across sites, rooms, tickets..." 
            className="w-full bg-bg-surface border border-border-subtle rounded-md pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <NotificationTray />
        
        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-border-subtle pl-4 ml-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm uppercase">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-on-surface leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-on-surface-variant font-mono">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
