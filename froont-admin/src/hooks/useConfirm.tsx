import { useState, useCallback } from 'react';
import { ConfirmDialog, type ConfirmOptions } from '../components/ui/ConfirmDialog';

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolver: ((value: boolean) => void) | null;
}

const INITIAL_STATE: ConfirmState = { isOpen: false, options: { message: '' }, resolver: null };

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(INITIAL_STATE);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ isOpen: true, options, resolver: resolve });
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    setState((prev) => {
      prev.resolver?.(value);
      return INITIAL_STATE;
    });
  }, []);

  const dialog = state.isOpen ? (
    <ConfirmDialog
      isOpen={state.isOpen}
      options={state.options}
      onConfirm={() => handleResolve(true)}
      onCancel={() => handleResolve(false)}
    />
  ) : null;

  return { confirm, dialog };
}
