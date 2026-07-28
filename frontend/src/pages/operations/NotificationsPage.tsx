import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Inbox } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const fetchNotifications = async () => {
  const token = localStorage.getItem('djezzy_token');
  if (!token) return [];

  const res = await fetch('http://localhost:4000/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const refreshNotifications = async () => {
    try {
      setNotifications(await fetchNotifications());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
    window.addEventListener('notification_update', refreshNotifications);

    return () => window.removeEventListener('notification_update', refreshNotifications);
  }, []);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('djezzy_token');
    await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    window.dispatchEvent(new Event('notification_update'));
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('djezzy_token');
    await fetch('http://localhost:4000/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    window.dispatchEvent(new Event('notification_update'));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Notifications</h2>
          <p className="text-on-surface-variant font-sans mt-1">Live simulated alarms and operator workflow updates.</p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-on-surface hover:border-primary/50 hover:text-primary disabled:opacity-50 disabled:hover:border-border-subtle disabled:hover:text-on-surface"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      </header>

      <section className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/25 text-primary grid place-items-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-sans font-medium text-on-surface">All Notifications</h3>
              <p className="text-xs text-on-surface-variant">{unreadCount} unread of {notifications.length}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-on-surface-variant">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="w-10 h-10 text-on-surface-variant mx-auto" />
            <p className="text-sm text-on-surface-variant mt-3">No notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-5 flex items-start justify-between gap-4 ${notification.read ? 'bg-bg-surface' : 'bg-primary/5'}`}>
                <div className="min-w-0">
                  <p className={`text-sm ${notification.read ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2 font-mono">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="shrink-0 inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary hover:bg-primary/15"
                  >
                    <Check className="w-4 h-4" />
                    Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
