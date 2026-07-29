import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, List } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import { formatDateTime } from '../../lib/frenchLabels';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const NotificationTray = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const trayRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();

    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('notification_update', fetchNotifications);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('notification_update', fetchNotifications);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('djezzy_token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/notifications?limit=6`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('djezzy_token');
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('djezzy_token');
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  return (
    <div className="relative" ref={trayRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-bg-surface"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-status-critical rounded-full border-2 border-background"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-surface">
            <h3 className="font-sans font-semibold text-on-surface">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">
                Aucune notification pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 transition-colors ${n.read ? 'bg-background' : 'bg-primary/5'}`}>
                    <div className="flex gap-3 items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${n.read ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1 font-mono">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle bg-bg-surface p-3">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-on-surface hover:border-primary/50 hover:text-primary transition-colors"
            >
              <List className="w-4 h-4" />
              Ouvrir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
