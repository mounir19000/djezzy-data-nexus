import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useSites } from '../../hooks/useSites';
import { NotificationTray } from '../ui/NotificationTray';

const fallbackSiteName = (siteId?: string) => {
  if (siteId === 'msc10-blida') return 'MSC10 Blida';
  return 'Site';
};

const Topbar = () => {
  const { user } = useAppStore();
  const location = useLocation();
  const { data: sites } = useSites();

  const pageHeader = useMemo(() => {
    const pathname = location.pathname.replace(/\/$/, '') || '/';
    const siteMatch = pathname.match(/^\/sites\/([^/]+)(?:\/([^/]+))?/);

    if (siteMatch) {
      const siteId = siteMatch[1];
      const section = siteMatch[2] || 'dashboard';
      const site = sites?.find((item: any) => item.id === siteId);
      const siteName = site?.name || fallbackSiteName(siteId);
      const siteLocation = site?.location || (siteId === 'msc10-blida' ? 'Blida, Algeria' : 'Selected site');

      if (section === 'digital-twin') {
        return {
          title: `${siteName} Digital Twin`,
          subtitle: 'Physical room health, live telemetry, tickets, and active alarms.'
        };
      }

      if (section === 'power-flow') {
        return {
          title: `${siteName} Power Flow`,
          subtitle: 'Electrical topology and live equipment status.'
        };
      }

      if (section === 'incidents') {
        return {
          title: `${siteName} Incident Center`,
          subtitle: 'Site alarms, expert diagnosis, and ticket escalation.'
        };
      }

      if (section === 'tickets') {
        return {
          title: `${siteName} Tickets`,
          subtitle: 'Alarm-created and manually launched intervention tickets.'
        };
      }

      if (section === 'reports') {
        return {
          title: `${siteName} Reports`,
          subtitle: 'Engineer responses submitted from intervention tickets.'
        };
      }

      return {
        title: `${siteName} Dashboard`,
        subtitle: `${siteLocation} operational health and active alarms.`
      };
    }

    if (pathname === '/') {
      return {
        title: 'National Operations',
        subtitle: 'Real-time overview of all Djezzy infrastructure.'
      };
    }

    const headers: Record<string, { title: string; subtitle: string }> = {
      '/incidents': {
        title: 'Incident Diagnosis Center',
        subtitle: 'Live alarms, rule-based diagnosis, and ticket escalation.'
      },
      '/tickets': {
        title: 'All Site Tickets',
        subtitle: 'Alarm-created and manually launched intervention tickets.'
      },
      '/maintenance': {
        title: 'Maintenance & Scheduling',
        subtitle: 'Preventative maintenance and inspection schedules.'
      },
      '/knowledge': {
        title: 'Knowledge Center',
        subtitle: 'Engineering documentation and standard operating procedures.'
      },
      '/reports': {
        title: 'All Ticket Reports',
        subtitle: 'Engineer responses submitted from intervention tickets.'
      },
      '/notifications': {
        title: 'Notifications',
        subtitle: 'Live simulated alarms and operator workflow updates.'
      },
      '/settings': {
        title: 'Platform Settings',
        subtitle: 'Configure global platform thresholds and expert system logic.'
      }
    };

    return headers[pathname] || {
      title: 'DDN',
      subtitle: 'Djezzy Data Nexus operations platform.'
    };
  }, [location.pathname, sites]);

  return (
    <header className="h-16 bg-background border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="min-w-0 flex-1 pr-6">
        <h1 className="text-lg font-display font-bold text-on-surface truncate">{pageHeader.title}</h1>
        <p className="hidden sm:block text-xs text-on-surface-variant font-sans mt-0.5 truncate">{pageHeader.subtitle}</p>
      </div>
      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <NotificationTray />

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-border-subtle pl-4">
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
