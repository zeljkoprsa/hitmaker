// src/features/Metronome/components/Controls/ScrollPickerMenu.tsx

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { ScrollPickerItem, ScrollPickerStrip, ScrollPickerTrack } from './styles';

export interface PickerOption<T> {
  value: T;
  renderItem: () => React.ReactNode;
  ariaLabel: string;
}

interface ScrollPickerMenuProps<T> {
  options: PickerOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  getIsSelected: (option: PickerOption<T>, selectedValue: T) => boolean;
}

export function ScrollPickerMenu<T>({
  options,
  selectedValue,
  onSelect,
  getIsSelected,
}: ScrollPickerMenuProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const wheelDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollEndFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep latest callbacks in refs so effects don't need to re-register on every render
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const getItemWidth = useCallback((): number => {
    if (!scrollRef.current) return 82;
    const first = scrollRef.current.firstElementChild as HTMLElement | null;
    const w = first?.getBoundingClientRect().width ?? 0;
    return w > 0 ? w : 82;
  }, []);

  const getSelectedIndex = useCallback((): number => {
    return options.findIndex(opt => getIsSelected(opt, selectedValue));
  }, [options, selectedValue, getIsSelected]);

  // ── On mount: instantly jump scroll to selected item ──────────────────────
  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    const idx = getSelectedIndex();
    if (idx < 0) return;
    const itemWidth = getItemWidth();
    isScrollingProgrammatically.current = true;
    scrollRef.current.scrollLeft = idx * itemWidth;
    requestAnimationFrame(() => {
      isScrollingProgrammatically.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync scroll when value changes externally ──────────────────────────────
  useEffect(() => {
    if (!scrollRef.current) return;
    const idx = getSelectedIndex();
    if (idx < 0) return;
    const itemWidth = getItemWidth();
    isScrollingProgrammatically.current = true;
    scrollRef.current.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
    // flag is reset by the scrollend handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  // ── scrollend / scroll+debounce: detect when the user settles on an item ──
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;

    const handleSettle = () => {
      if (isScrollingProgrammatically.current) {
        isScrollingProgrammatically.current = false;
        return;
      }
      const itemWidth = getItemWidth();
      const idx = Math.round(el.scrollLeft / itemWidth);
      if (idx >= 0 && idx < options.length) {
        onSelectRef.current(options[idx].value);
      }
    };

    const handleScrollEnd = () => {
      if (scrollEndFallbackRef.current) clearTimeout(scrollEndFallbackRef.current);
      handleSettle();
    };

    const handleScrollFallback = () => {
      if (scrollEndFallbackRef.current) clearTimeout(scrollEndFallbackRef.current);
      scrollEndFallbackRef.current = setTimeout(handleSettle, 150);
    };

    const supportsScrollEnd = 'onscrollend' in window;
    if (supportsScrollEnd) {
      el.addEventListener('scrollend', handleScrollEnd);
    } else {
      el.addEventListener('scroll', handleScrollFallback);
    }

    return () => {
      if (supportsScrollEnd) {
        el.removeEventListener('scrollend', handleScrollEnd);
      } else {
        el.removeEventListener('scroll', handleScrollFallback);
      }
      if (scrollEndFallbackRef.current) clearTimeout(scrollEndFallbackRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, getItemWidth]);

  // ── Wheel: scroll one item per tick, 80ms debounce ────────────────────────
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (wheelDebounceRef.current) return;
      const itemWidth = getItemWidth();
      const direction = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
      el.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
      wheelDebounceRef.current = setTimeout(() => {
        wheelDebounceRef.current = null;
      }, 80);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (wheelDebounceRef.current) clearTimeout(wheelDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getItemWidth]);

  return (
    <ScrollPickerStrip role="listbox">
      <ScrollPickerTrack ref={scrollRef} tabIndex={0}>
        {options.map((opt, idx) => {
          const selected = getIsSelected(opt, selectedValue);
          return (
            <ScrollPickerItem
              key={idx}
              selected={selected}
              onClick={() => onSelectRef.current(opt.value)}
              role="option"
              aria-selected={selected}
              aria-label={opt.ariaLabel}
            >
              {opt.renderItem()}
            </ScrollPickerItem>
          );
        })}
      </ScrollPickerTrack>
    </ScrollPickerStrip>
  );
}
