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
  danger:  { icon: AlertTriangle, color: 'text-[#f56c6c]', btn: 'bg-[#f56c6c] hover:bg-[#f78989]' },
  warning: { icon: AlertCircle,   color: 'text-[#e6a23c]', btn: 'bg-[#e6a23c] hover:bg-[#ebb563]' },
  info:    { icon: Info,          color: 'text-[#409eff]', btn: 'bg-[#409eff] hover:bg-[#66b1ff]' },
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
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:text-[#409eff] hover:border-[#409eff] transition-colors">
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
