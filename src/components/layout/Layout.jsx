import { useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import MobileTabBar from './MobileTabBar.jsx';
import Toaster from '../ui/Toaster.jsx';
import SavedDialog from '../ui/SavedDialog.jsx';
import useStackLabels from '../../lib/useStackLabels.js';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const shell = useRef(null);
  useStackLabels(shell);

  return (
    // One header across the top, the section rail down the left.
    // 100dvh, not 100vh: a phone's address bar would otherwise hide the bottom bar.
    <div ref={shell} className="flex h-[100dvh] flex-col bg-surface-base bg-app-aurora">
      <Header onOpenMobile={() => setMobileOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        {/* On a phone the bottom bar covers the last few rows, so leave room for it. */}
        <div className="min-w-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+4.5rem)] lg:pb-0">
          <main key={pathname} className="mx-auto max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:py-8">
            <Outlet />
          </main>

          <footer className="hidden border-t border-ink-900/[0.07] px-6 py-5 text-center text-xs text-ink-400 lg:block">
            Smira Club · Travel agency admin panel — demo data for client review
          </footer>
        </div>
      </div>

      <MobileTabBar onMore={() => setMobileOpen(true)} />
      <Toaster />
      <SavedDialog />
    </div>
  );
}
