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
  success: { icon: CheckCircle, bg: 'bg-[#f0f9eb]', border: 'border-[#e1f3d8]', text: 'text-[#67c23a]' },
  error:   { icon: XCircle,    bg: 'bg-[#fef0f0]', border: 'border-[#fde2e2]', text: 'text-[#f56c6c]' },
  warning: { icon: AlertCircle, bg: 'bg-[#fdf6ec]', border: 'border-[#faecd8]', text: 'text-[#e6a23c]' },
  info:    { icon: Info,        bg: 'bg-[#ecf5ff]', border: 'border-[#d9ecff]', text: 'text-[#409eff]' },
};

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: 400 }}>
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
