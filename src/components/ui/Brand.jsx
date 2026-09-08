/**
 * The Smira Club lockup, from the client's own artwork.
 *
 * One component so the mark is defined once and every screen that shows it —
 * the header, the sign-in page — is the same mark at a different height. The
 * file is served from public/ rather than inlined because it is the same
 * bytes on every page and the browser should cache it once.
 */
export default function Brand({ className = 'h-10', dark = false, alt = 'Smira Club' }) {
  return (
    <img
      src={dark ? '/smira-logo-dark.svg' : '/smira-logo.svg'}
      alt={alt}
      className={`w-auto ${className}`}
      draggable="false"
    />
  );
}
