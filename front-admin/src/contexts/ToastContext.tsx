import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast 容器直接在这里渲染，无需额外组件 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ---- Toast 容器 ---- */
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const TOAST_STYLES: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle, bg: 'bg-sprout-50', border: 'border-sprout-200', text: 'text-sprout-500' },
  error:   { icon: XCircle,    bg: 'bg-terracotta-50', border: 'border-terracotta-200', text: 'text-terracotta-500' },
  warning: { icon: AlertCircle, bg: 'bg-harvest-50', border: 'border-harvest-200', text: 'text-harvest-500' },
  info:    { icon: Info,        bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-500' },
};

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: 400 }} aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type];
          const Icon = style.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${style.bg} ${style.border}`}
            >
              <Icon size={18} className={style.text} />
              <span className="flex-1 text-sm text-gray-700">{toast.message}</span>
              <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 p-0.5">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return {
    success: (msg: string, duration?: number) => ctx.addToast(msg, 'success', duration),
    error:   (msg: string, duration?: number) => ctx.addToast(msg, 'error', duration),
    warning: (msg: string, duration?: number) => ctx.addToast(msg, 'warning', duration),
    info:    (msg: string, duration?: number) => ctx.addToast(msg, 'info', duration),
  };
}

export default ToastContext;
