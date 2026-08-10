import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header, { MobileNav } from './Header.jsx';
import Toaster from '../ui/Toaster.jsx';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    // No sidebar: one header carries both navigation levels and the page
    // below it gets the full width of the window.
    <div className="flex h-screen flex-col bg-surface-base bg-app-aurora">
      <Header onOpenMobile={() => setMobileOpen(true)} />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <main key={pathname} className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-ink-900/[0.07] px-6 py-5 text-center text-xs text-ink-400">
          Smira Club · Travel agency admin panel — demo data for client review
        </footer>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Toaster />
    </div>
  );
}
