import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import notificationApi from '../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      // Ignore
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications({ page: 0, size: 8 });
      setNotifications(res.data?.content || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-coral-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-slate-900 dark:text-white text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-xs bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-3.5 transition-colors cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-navy-800/60 ${
                    !n.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold ${!n.isRead ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
