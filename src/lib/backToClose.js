import { useEffect, useRef } from 'react';

/**
 * The phone's Back button closes what is open on top, not the page.
 *
 * A lead, a booking or a dialog opens over the page without changing the
 * address, so Back used to skip right past it to whatever page was open
 * before — the Booking page, often. Each open overlay now adds a step to
 * the browser history; Back takes that step and closes the top one only.
 * Closed with its own X or Cancel, the overlay takes its step back out.
 */
const stack = [];
let skipNext = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (skipNext) {
      skipNext -= 1;
      return;
    }
    const top = stack.pop();
    top?.current?.();
  });
}

export function useBackToClose(open, onClose) {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const entry = close;
    const id = Math.random().toString(36).slice(2);
    stack.push(entry);
    window.history.pushState({ ...(window.history.state || {}), overlay: id }, '');
    return () => {
      const i = stack.indexOf(entry);
      // Still on the stack: closed by its own button, not by Back.
      if (i !== -1) {
        stack.splice(i, 1);
        // Take the step back out — unless a link already moved on to
        // another page, where going back would undo that.
        if (window.history.state?.overlay === id) {
          skipNext += 1;
          window.history.back();
        }
      }
    };
  }, [open]);
}
