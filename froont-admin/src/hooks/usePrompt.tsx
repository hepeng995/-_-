import { useState, useCallback } from 'react';
import { PromptDialog, type PromptOptions } from '../components/ui/PromptDialog';

interface PromptState {
  isOpen: boolean;
  options: PromptOptions;
  resolver: ((value: string | null) => void) | null;
}

const INITIAL_STATE: PromptState = { isOpen: false, options: { message: '' }, resolver: null };

export function usePrompt() {
  const [state, setState] = useState<PromptState>(INITIAL_STATE);

  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      setState({ isOpen: true, options, resolver: resolve });
    });
  }, []);

  const handleConfirm = useCallback((value: string) => {
    setState((prev) => {
      prev.resolver?.(value);
      return INITIAL_STATE;
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((prev) => {
      prev.resolver?.(null);
      return INITIAL_STATE;
    });
  }, []);

  const dialog = state.isOpen ? (
    <PromptDialog
      isOpen={state.isOpen}
      options={state.options}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { prompt, dialog };
}
