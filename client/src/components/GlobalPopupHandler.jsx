import React, { useEffect } from 'react';
import toast, { useToasterStore } from 'react-hot-toast';

/**
 * GlobalPopupHandler monitors the document for clicks anywhere.
 * If any toast notification or popup is currently active, clicking anywhere
 * on the webpage dismisses it immediately for maximum user-friendliness.
 */
const GlobalPopupHandler = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const handleDocumentClick = () => {
      // Find active/visible toasts
      const visibleToasts = toasts.filter((t) => t.visible && !t.dismissed);
      if (visibleToasts.length === 0) return;

      // To avoid immediately dismissing a toast on the same click that triggered it,
      // only dismiss toasts that were created > 180ms ago or if the click was directly on the toast.
      const now = Date.now();
      const hasMatureToasts = visibleToasts.some((t) => now - (t.createdAt || 0) > 180);

      if (hasMatureToasts) {
        toast.dismiss();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const visibleToasts = toasts.filter((t) => t.visible && !t.dismissed);
        if (visibleToasts.length > 0) {
          toast.dismiss();
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toasts]);

  return null;
};

export default GlobalPopupHandler;
