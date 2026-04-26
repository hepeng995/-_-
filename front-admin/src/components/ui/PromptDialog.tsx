import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

export interface PromptOptions {
  title?: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}

interface PromptDialogProps {
  isOpen: boolean;
  options: PromptOptions;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({ isOpen, options, onConfirm, onCancel }: PromptDialogProps) {
  const [value, setValue] = useState(options.defaultValue || '');

  useEffect(() => {
    if (isOpen) setValue(options.defaultValue || '');
  }, [isOpen, options.defaultValue]);

  const canConfirm = options.required ? value.trim().length > 0 : true;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={options.title || '请输入'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">{options.message}</label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={options.placeholder || ''}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y text-sm"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:text-bamboo-500 hover:border-bamboo-500 transition-colors">
            {options.cancelText || '取消'}
          </button>
          <button
            onClick={() => onConfirm(value)}
            disabled={!canConfirm}
            className="px-4 py-2 text-sm text-white bg-bamboo-500 hover:bg-bamboo-400 rounded disabled:opacity-50 transition-colors"
          >
            {options.confirmText || '确定'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
