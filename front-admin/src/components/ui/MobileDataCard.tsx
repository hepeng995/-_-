import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, cn } from './Card';

interface MobileDataField {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

interface MobileDataAction {
  label: string;
  onClick: () => void;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  disabled?: boolean;
}

interface MobileDataCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  tags?: ReactNode[];
  fields?: MobileDataField[];
  details?: MobileDataField[];
  actions?: MobileDataAction[];
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  className?: string;
  key?: string | number;
}

const toneMap: Record<NonNullable<MobileDataAction['tone']>, string> = {
  primary: 'bg-bamboo-500 text-white hover:bg-bamboo-400',
  success: 'bg-sprout-500 text-white hover:bg-sprout-400',
  warning: 'bg-harvest-500 text-white hover:bg-harvest-400',
  danger: 'bg-terracotta-500 text-white hover:bg-terracotta-400',
  neutral: 'bg-white text-gray-700 border border-gray-200 hover:border-bamboo-200 hover:text-bamboo-500',
};

export function MobileDataCard({
  title,
  subtitle,
  tags = [],
  fields = [],
  details = [],
  actions = [],
  selected = false,
  onSelect,
  className,
}: MobileDataCardProps) {
  return (
    <Card className={cn('p-4 md:hidden', className)}>
      <div className="flex items-start gap-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-bamboo-500 focus:ring-bamboo-500"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="break-all text-sm font-semibold text-ink-600">{title}</h3>
              {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            </div>

            {tags.length > 0 && (
              <div className="flex max-w-[45%] flex-wrap justify-end gap-2">{tags}</div>
            )}
          </div>

          {fields.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              {fields.map((field) => (
                <div
                  key={`${field.label}-${String(field.value)}`}
                  className={cn(
                    'rounded-2xl bg-gray-50 px-3 py-2',
                    field.fullWidth && 'col-span-full',
                  )}
                >
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">
                    {field.label}
                  </p>
                  <div className="mt-1 text-sm text-gray-700">{field.value}</div>
                </div>
              ))}
            </div>
          )}

          {details.length > 0 && (
            <details className="mt-4 rounded-2xl border border-gray-100 bg-white px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-600">
                更多信息
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
                {details.map((field) => (
                  <div
                    key={`${field.label}-${String(field.value)}`}
                    className={cn(
                      'rounded-2xl bg-gray-50 px-3 py-2',
                      field.fullWidth && 'col-span-full',
                    )}
                  >
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      {field.label}
                    </p>
                    <div className="mt-1 break-all text-sm text-gray-700">{field.value}</div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {actions.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    'rounded-2xl px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    toneMap[action.tone || 'primary'],
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
