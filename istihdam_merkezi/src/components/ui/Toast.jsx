import React, { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../utils/helpers";

// Basit toast state - store yerine local state kullanıyoruz
const toasts = [];
const toastListeners = [];

export const showToast = (toast) => {
  const id = Date.now() + Math.random();
  const newToast = { ...toast, id };
  toasts.push(newToast);
  toastListeners.forEach((listener) => listener([...toasts]));
  
  if (toast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, toast.duration);
  }
  
  return id;
};

export const dismissToast = (id) => {
  const index = toasts.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    toastListeners.forEach((listener) => listener([...toasts]));
  }
};

/**
 * Toast Container Component
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    const listener = (newToasts) => setToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div
      className="fixed top-16 sm:top-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] flex flex-col gap-2 max-w-md sm:w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

/**
 * Toast Component
 */
const Toast = ({ id, type, title, message, duration }) => {

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, dismissToast]);

  const types = {
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-50 dark:bg-green-900/30",
      borderClass: "border-green-500 dark:border-green-400",
      iconClass: "text-green-600 dark:text-green-400",
      titleClass: "text-green-900 dark:text-green-200",
      messageClass: "text-green-700 dark:text-green-300",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-red-50 dark:bg-red-900/30",
      borderClass: "border-red-500 dark:border-red-400",
      iconClass: "text-red-600 dark:text-red-400",
      titleClass: "text-red-900 dark:text-red-200",
      messageClass: "text-red-700 dark:text-red-300",
    },
    warning: {
      icon: AlertCircle,
      bgClass: "bg-yellow-50 dark:bg-yellow-900/30",
      borderClass: "border-yellow-500 dark:border-yellow-400",
      iconClass: "text-yellow-600 dark:text-yellow-400",
      titleClass: "text-yellow-900 dark:text-yellow-200",
      messageClass: "text-yellow-700 dark:text-yellow-300",
    },
    info: {
      icon: Info,
      bgClass: "bg-blue-50 dark:bg-blue-900/30",
      borderClass: "border-blue-500 dark:border-blue-400",
      iconClass: "text-blue-600 dark:text-blue-400",
      titleClass: "text-blue-900 dark:text-blue-200",
      messageClass: "text-blue-700 dark:text-blue-300",
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 border-l-4 rounded-lg shadow-lg",
        "animate-slide-in-right",
        config.bgClass,
        config.borderClass
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconClass)} />

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn("text-sm font-semibold mb-1", config.titleClass)}>
            {title}
          </h4>
        )}
        {message && (
          <p className={cn("text-sm", config.messageClass)}>{message}</p>
        )}
      </div>

      <button
        onClick={() => dismissToast(id)}
        className={cn(
          "flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black hover:bg-opacity-10",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          config.iconClass
        )}
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastContainer;
