import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Map, Activity, Calendar, FileText, ShieldAlert, Cpu, LogOut, Gauge, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSites } from '../../hooks/useSites';
import { displayText } from '../../lib/frenchLabels';

type SidebarNavLinkProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  tooltipLabel?: string;
};

const SidebarNavLink = ({ to, label, icon, isCollapsed, tooltipLabel }: SidebarNavLinkProps) => (
  <NavLink
    to={to}
    title={isCollapsed ? tooltipLabel || label : undefined}
    aria-label={tooltipLabel || label}
    className={({isActive}) => `flex items-center rounded-md font-sans text-sm transition-colors ${isCollapsed ? 'h-10 justify-center px-0' : 'gap-3 px-3 py-2'} ${isActive ? 'bg-bg-surface text-primary' : 'text-on-surface hover:bg-bg-surface'}`}
  >
    {icon}
    <span className={isCollapsed ? 'sr-only' : ''}>{label}</span>
  </NavLink>
);

const SidebarSectionLabel = ({ label, isCollapsed }: { label: string; isCollapsed: boolean }) => {
  if (isCollapsed) {
    return <div className="mx-auto my-3 h-px w-8 bg-border-subtle" aria-hidden="true" />;
  }

  return (
    <div className="text-xs font-mono text-on-surface-variant px-3 py-2 uppercase tracking-wider">
      {label}
    </div>
  );
};

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, logout, user } = useAppStore();
  const navigate = useNavigate();
  const { data: sites, isLoading } = useSites();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const canManageMaintenance = ['Super Admin', 'Engineer', 'Site Operator'].includes(user?.role || '');
  const assignedSiteIds = user?.siteIds || ['msc10-blida'];
  const displaySites = isSuperAdmin ? sites : sites?.filter((site: any) => assignedSiteIds.includes(site.id));
  const isCollapsed = !isSidebarOpen;

  return (
    <aside className={`bg-bg-secondary border-r border-border-subtle h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-[76px]' : 'w-[280px]'}`}>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? 'Ouvrir la barre laterale' : 'Reduire la barre laterale'}
        aria-expanded={!isCollapsed}
        title={isCollapsed ? 'Ouvrir la barre laterale' : 'Reduire la barre laterale'}
        className="absolute -right-3 top-5 z-20 h-7 w-7 rounded-full border border-border-subtle bg-bg-surface text-on-surface-variant hover:text-primary hover:border-primary flex items-center justify-center transition-colors shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`h-16 flex items-center border-b border-border-subtle shrink-0 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <h1 className={`text-primary font-display font-bold tracking-tight truncate ${isCollapsed ? 'text-lg' : 'text-xl'}`}>
          DDN
        </h1>
      </div>
      
      <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {isSuperAdmin && (
          <>
            <SidebarSectionLabel label="Niveau national" isCollapsed={isCollapsed} />
            <SidebarNavLink to="/" label="Tableau national" icon={<Map className="w-5 h-5" />} isCollapsed={isCollapsed} />
            <SidebarNavLink to="/tickets" label="Tous les tickets" icon={<FileText className="w-5 h-5" />} isCollapsed={isCollapsed} />
            <SidebarNavLink to="/reports" label="Tous les rapports" icon={<FileText className="w-5 h-5" />} isCollapsed={isCollapsed} />
          </>
        )}

        {isLoading ? (
          <div className={isCollapsed ? 'mx-auto my-4 h-2 w-2 rounded-full bg-on-surface-variant animate-pulse' : 'px-3 py-4 text-sm text-on-surface-variant'}>
            {!isCollapsed && 'Chargement des sites...'}
          </div>
        ) : (
          displaySites?.map((site: any) => (
            <React.Fragment key={site.id}>
              <SidebarSectionLabel label={displayText(site.name)} isCollapsed={isCollapsed} />
              <SidebarNavLink to={`/sites/${site.id}/dashboard`} label="Tableau du site" tooltipLabel={`${displayText(site.name)} Tableau du site`} icon={<Gauge className="w-5 h-5" />} isCollapsed={isCollapsed} />
              <SidebarNavLink to={`/sites/${site.id}/digital-twin`} label="Jumeau numerique" tooltipLabel={`${displayText(site.name)} Jumeau numerique`} icon={<Cpu className="w-5 h-5" />} isCollapsed={isCollapsed} />
              <SidebarNavLink to={`/sites/${site.id}/power-flow`} label="Flux électrique" tooltipLabel={`${displayText(site.name)} Flux électrique`} icon={<Activity className="w-5 h-5" />} isCollapsed={isCollapsed} />
              <SidebarNavLink to={`/sites/${site.id}/incidents`} label="Centre incidents" tooltipLabel={`${displayText(site.name)} Centre incidents`} icon={<ShieldAlert className="w-5 h-5" />} isCollapsed={isCollapsed} />
              <SidebarNavLink to={`/sites/${site.id}/tickets`} label="Tickets" tooltipLabel={`${displayText(site.name)} Tickets`} icon={<FileText className="w-5 h-5" />} isCollapsed={isCollapsed} />
              <SidebarNavLink to={`/sites/${site.id}/reports`} label="Rapports tickets" tooltipLabel={`${displayText(site.name)} Rapports tickets`} icon={<FileText className="w-5 h-5" />} isCollapsed={isCollapsed} />
            </React.Fragment>
          ))
        )}

        <SidebarSectionLabel label="Opérations" isCollapsed={isCollapsed} />
        {canManageMaintenance && (
          <>
            <SidebarNavLink to="/maintenance" label="Maintenance" icon={<Calendar className="w-5 h-5" />} isCollapsed={isCollapsed} />
            <SidebarNavLink to="/mantainancehistory" label="Historique maintenance" icon={<History className="w-5 h-5" />} isCollapsed={isCollapsed} />
          </>
        )}
        <SidebarNavLink to="/knowledge" label="Centre de connaissances" icon={<FileText className="w-5 h-5" />} isCollapsed={isCollapsed} />
      </nav>
      
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-border-subtle flex flex-col gap-1 shrink-0`}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? 'Se deconnecter' : undefined}
          aria-label="Se deconnecter"
          className={`w-full flex items-center rounded-md font-sans text-sm text-on-surface-variant hover:bg-status-critical/10 hover:text-status-critical transition-colors ${isCollapsed ? 'h-10 justify-center px-0' : 'gap-3 px-3 py-2'}`}
        >
          <LogOut className="w-5 h-5" />
          <span className={isCollapsed ? 'sr-only' : ''}>Se deconnecter</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
