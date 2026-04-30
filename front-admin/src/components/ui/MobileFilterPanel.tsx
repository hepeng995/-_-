import { type ReactNode, useEffect, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Card, cn } from './Card';
import { useIsMobile } from '../../hooks/useIsMobile';

interface MobileFilterPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  defaultOpen?: boolean;
}

export function MobileFilterPanel({
  children,
  className,
  title = '筛选与操作',
  defaultOpen = false,
}: MobileFilterPanelProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!isMobile) {
      setOpen(true);
      return;
    }

    setOpen(defaultOpen);
  }, [defaultOpen, isMobile]);

  if (!isMobile) {
    return <Card className={cn('p-6', className)}>{children}</Card>;
  }

  return (
    <Card className={cn('p-4', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bamboo-50 text-bamboo-500">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-600">{title}</p>
            <p className="text-xs text-gray-500">展开后可筛选数据并执行操作</p>
          </div>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && <div className="mt-4 border-t border-gray-100 pt-4">{children}</div>}
    </Card>
  );
}
