import { useEffect } from 'react';

/**
 * Copies every column heading onto the cells beneath it, as data-label, for
 * tables marked .stack-mobile — so that when a phone stacks a row into a card
 * (see index.css) each value still says what it is.
 *
 * Done once for the whole panel and kept up as rows change, rather than
 * asking eight hand-built tables to label every cell themselves.
 */
function label(root) {
  root.querySelectorAll('table.stack-mobile').forEach((table) => {
    const heads = [];
    table.querySelectorAll('thead tr:last-child th').forEach((th) => {
      const text = th.textContent.trim();
      for (let i = 0; i < (th.colSpan || 1); i += 1) heads.push(text);
    });
    if (!heads.length) return;
    table.querySelectorAll('tbody tr, tfoot tr').forEach((tr) => {
      let at = 0;
      [...tr.children].forEach((td) => {
        const text = heads[at] ?? '';
        if (td.getAttribute('data-label') !== text) td.setAttribute('data-label', text);
        at += td.colSpan || 1;
      });
    });
  });
}

export default function useStackLabels(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => label(root));
    };
    run();
    const watch = new MutationObserver(run);
    // Our own data-label writes are attribute changes, so they do not wake it.
    watch.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
    };
  }, [ref]);
}
