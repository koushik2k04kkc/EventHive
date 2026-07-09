import React, { useEffect, useState } from 'react';

const toastStyles = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = window.setTimeout(() => setIsExiting(true), 2500);
    const removeTimer = window.setTimeout(() => onClose(), 3000);
    return () => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <div className={`transform transition-all duration-300 ${isExiting ? 'translate-x-6 opacity-0' : 'translate-x-0 opacity-100'} ${toastStyles[toast.type] || toastStyles.info} rounded-lg px-4 py-3 text-white shadow-lg`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{toast.title || 'Notification'}</p>
          {toast.message ? <p className="mt-1 text-sm">{toast.message}</p> : null}
        </div>
        <button type="button" onClick={onClose} className="text-white/80 transition hover:text-white" aria-label="Close notification">×</button>
      </div>
    </div>
  );
};

const ToastNotification = ({ toasts = [], removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ToastNotification;
