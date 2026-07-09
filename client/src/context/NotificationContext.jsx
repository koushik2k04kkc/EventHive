import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  function addNotification(message, type = "info") {
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    const notification = {
      id,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => [notification, ...prev]);

    setTimeout(() => {
      removeNotification(id);
    }, 3000);

    return id;
  }

  function removeNotification(id) {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      removeNotification,
      markAllRead
    }),
    [notifications, unreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-50 space-y-3">
        {notifications.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className={`w-72 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              item.type === "success"
                ? "bg-emerald-600"
                : item.type === "error"
                ? "bg-rose-600"
                : "bg-slate-900"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider.");
  }

  return context;
}