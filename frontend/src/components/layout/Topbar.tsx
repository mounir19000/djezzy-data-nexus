import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useSites } from '../../hooks/useSites';
import { NotificationTray } from '../ui/NotificationTray';
import { displayRole, displayText } from '../../lib/frenchLabels';

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
      const siteName = displayText(site?.name || fallbackSiteName(siteId));
      const siteLocation = displayText(site?.location || (siteId === 'msc10-blida' ? 'Blida, Algeria' : 'Selected site'));

      if (section === 'digital-twin') {
        return {
          title: `${siteName} Jumeau numerique`,
          subtitle: 'Santé des salles, télémétrie en direct, tickets et alarmes actives.'
        };
      }

      if (section === 'power-flow') {
        return {
          title: `${siteName} Flux électrique`,
          subtitle: 'Topologie électrique et état des équipements en direct.'
        };
      }

      if (section === 'incidents') {
        return {
          title: `${siteName} Centre incidents`,
          subtitle: 'Alarmes du site, diagnostic expert et escalade des tickets.'
        };
      }

      if (section === 'tickets') {
        return {
          title: `${siteName} Tickets`,
          subtitle: 'Tickets d’intervention créés depuis les alarmes ou lancés manuellement.'
        };
      }

      if (section === 'reports') {
        return {
          title: `${siteName} Rapports`,
          subtitle: 'Réponses ingénieur soumises depuis les tickets d’intervention.'
        };
      }

      return {
        title: `${siteName} Tableau de bord`,
        subtitle: `Santé opérationnelle et alarmes actives - ${siteLocation}.`
      };
    }

    if (pathname === '/') {
      return {
        title: 'Opérations nationales',
        subtitle: 'Vue en temps réel de toute l’infrastructure Djezzy.'
      };
    }

    const headers: Record<string, { title: string; subtitle: string }> = {
      '/incidents': {
        title: 'Centre de diagnostic des incidents',
        subtitle: 'Alarmes en direct, diagnostic par règles et escalade des tickets.'
      },
      '/tickets': {
        title: 'Tous les tickets sites',
        subtitle: 'Tickets d’intervention créés depuis les alarmes ou lancés manuellement.'
      },
      '/maintenance': {
        title: 'Maintenance et planification',
        subtitle: 'Maintenance preventive et calendriers d’inspection.'
      },
      '/mantainancehistory': {
        title: 'Historique maintenance',
        subtitle: 'Interventions terminées, rapports et état des équipements.'
      },
      '/knowledge': {
        title: 'Centre de connaissances',
        subtitle: 'Documentation technique et procédures opérationnelles standard.'
      },
      '/reports': {
        title: 'Tous les rapports de tickets',
        subtitle: 'Réponses ingénieur soumises depuis les tickets d’intervention.'
      },
      '/notifications': {
        title: 'Notifications',
        subtitle: 'Alarmes simulees en direct et mises à jour du flux operateur.'
      },
      '/settings': {
        title: 'Paramètres plateforme',
        subtitle: 'Configurer les seuils globaux et la logique du système expert.'
      }
    };

    return headers[pathname] || {
      title: 'DDN',
      subtitle: 'Plateforme opérationnelle Djezzy Data Nexus.'
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
            <p className="text-xs text-on-surface-variant font-mono">{displayRole(user?.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
