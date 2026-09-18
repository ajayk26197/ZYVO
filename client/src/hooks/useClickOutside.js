import { useEffect, useRef } from 'react';

/**
 * Hook that invokes handler when a click / touch occurs outside of the specified ref(s),
 * or when the Escape key is pressed.
 * 
 * @param {React.RefObject | React.RefObject[]} refs - Single ref or array of refs
 * @param {Function} handler - Callback to invoke when clicked outside
 * @param {boolean} [active=true] - Whether the listener should be active
 */
export function useClickOutside(refs, handler, active = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;

    const listener = (event) => {
      const refList = Array.isArray(refs) ? refs : [refs];
      // Check if target is contained in ANY of the provided refs
      const isInside = refList.some(
        (ref) => ref?.current && ref.current.contains(event.target)
      );

      if (!isInside) {
        handlerRef.current(event);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handlerRef.current(event);
      }
    };

    // Use mousedown and touchstart to capture early outside clicks
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refs, active]);
}

export default useClickOutside;
