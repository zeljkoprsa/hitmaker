import React, { useRef, useState } from 'react';

interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'min' | 'max' | 'onChange' | 'type'
> {
  value: number;
  min: number;
  max: number;
  /** Called with the clamped value on blur/Enter. Never fires mid-typing. */
  onCommit: (value: number) => void;
  /** Parse decimals (duration fields). Default: integers only. */
  allowDecimal?: boolean;
}

/**
 * Number input with deferred validation (JAK-49): typing is free-form and
 * only blur/Enter parses, clamps, and commits. Clamping per keystroke made
 * direct entry impossible — typing "72" hit clamp("7") → 30, then "302" →
 * 300. Empty or non-numeric input reverts to the last committed value;
 * Escape cancels the edit.
 */
export const NumberField: React.FC<NumberFieldProps> = ({
  value,
  min,
  max,
  onCommit,
  allowDecimal = false,
  ...rest
}) => {
  // Non-null while editing; mirrored in a ref so Escape can cancel
  // synchronously before the blur handler runs
  const [draft, setDraftState] = useState<string | null>(null);
  const draftRef = useRef<string | null>(null);
  const setDraft = (next: string | null) => {
    draftRef.current = next;
    setDraftState(next);
  };

  const commit = () => {
    const pending = draftRef.current;
    setDraft(null);
    if (pending === null) return;
    const parsed = allowDecimal ? parseFloat(pending) : parseInt(pending, 10);
    if (!isNaN(parsed)) onCommit(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <input
      {...rest}
      type="number"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      min={min}
      max={max}
      value={draft ?? String(value)}
      onFocus={e => {
        setDraft(String(value));
        e.target.select();
      }}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.blur(); // commits via onBlur
        } else if (e.key === 'Escape') {
          setDraft(null);
          e.currentTarget.blur();
        }
        e.stopPropagation();
      }}
    />
  );
};

export default NumberField;
