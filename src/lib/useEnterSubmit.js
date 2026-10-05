import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns an onKeyDown handler that calls `submitFn` when Enter is pressed
 * on a single-line <input> or <select> (never <textarea>, never contentEditable).
 *
 * Can be attached to:
 * - A container element (e.g. modal card div): onKeyDown={handleEnter}
 * - An individual <input onKeyDown={handleEnter} />
 *
 * Explicit exception: never intercepts inside <textarea> or [contenteditable]
 * (Tiptap / rich text editors), so Enter in multiline fields inserts a newline as normal.
 */
export default function useEnterSubmit(submitFn) {
  const fnRef = useRef(submitFn);
  useEffect(() => {
    fnRef.current = submitFn;
  });

  return useCallback((e) => {
    if (e.key !== 'Enter' && e.keyCode !== 13) return;
    if (e.nativeEvent?.isComposing) return;
    const tag = e.target.tagName?.toUpperCase();
    // Never intercept Enter inside textareas or contenteditable (Tiptap, etc.)
    if (tag === 'TEXTAREA' || e.target.isContentEditable) return;
    // Only act on single-line inputs
    if (tag === 'INPUT' || tag === 'SELECT') {
      e.preventDefault();
      fnRef.current?.();
    }
  }, []);
}
