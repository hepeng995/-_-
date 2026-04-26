import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const TYPE_CONFIG = {
  danger:  { icon: AlertTriangle, color: 'text-terracotta-500', btn: 'bg-terracotta-500 hover:bg-terracotta-400' },
  warning: { icon: AlertCircle,   color: 'text-harvest-500', btn: 'bg-harvest-500 hover:bg-harvest-400' },
  info:    { icon: Info,          color: 'text-bamboo-500', btn: 'bg-bamboo-500 hover:bg-bamboo-400' },
};

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, options, onConfirm, onCancel }: ConfirmDialogProps) {
  const type = options.type || 'warning';
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={options.title || '提示'}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <Icon size={20} className={`${config.color} mt-0.5 shrink-0`} />
          <p className="text-sm text-gray-600 leading-relaxed">{options.message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:text-bamboo-500 hover:border-bamboo-500 transition-colors">
            {options.cancelText || '取消'}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm text-white rounded transition-colors ${config.btn}`}>
            {options.confirmText || '确定'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
