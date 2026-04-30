import { type ReactNode } from 'react';

interface MobileBatchActionBarProps {
  count: number;
  children: ReactNode;
  label?: string;
}

export function MobileBatchActionBar({
  count,
  children,
  label = '已选项目',
}: MobileBatchActionBarProps) {
  if (!count) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="rounded-3xl bg-ink-600 px-4 py-3 text-white shadow-[0_18px_40px_rgba(12,27,36,0.28)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-bamboo-100">当前已选 {count} 项</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
