import { useState, useId, useCallback, useRef, useEffect } from 'react';

interface UseCollapsibleControlProps {
  onValueChange?: () => void;
  label: string;
  currentValue: string;
}

interface AriaAttributes {
  'aria-haspopup': 'true';
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-label': string;
  role: 'button';
  tabIndex: 0;
}

export const useCollapsibleControl = ({
  onValueChange,
  label,
  currentValue,
}: UseCollapsibleControlProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const controlId = useId();
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isVisible && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isVisible]);

  const handleToggle = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    },
    [isVisible, handleToggle]
  );

  const handleValueChange = useCallback(
    (callback: () => void) => {
      callback();
      onValueChange?.();
      setIsVisible(false);
    },
    [onValueChange]
  );

  const getAriaAttributes = useCallback(
    (): AriaAttributes => ({
      'aria-haspopup': 'true',
      'aria-expanded': isVisible,
      'aria-controls': controlId,
      'aria-label': `Current ${label}: ${currentValue}. Click to change.`,
      role: 'button',
      tabIndex: 0,
    }),
    [controlId, isVisible, label, currentValue]
  );

  const getControlsAttributes = useCallback(
    () => ({
      id: controlId,
      role: 'region',
      'aria-label': `${label} selection`,
      'data-visible': isVisible,
    }),
    [controlId, isVisible, label]
  );

  const getLabelId = useCallback(() => `${controlId}-label`, [controlId]);

  return {
    isVisible,
    controlId,
    selectRef,
    handleKeyPress,
    handleToggle,
    handleValueChange,
    getAriaAttributes,
    getControlsAttributes,
    getLabelId,
  };
};
