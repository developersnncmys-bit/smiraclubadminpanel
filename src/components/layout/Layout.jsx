import { useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import MobileTabBar from './MobileTabBar.jsx';
import Toaster from '../ui/Toaster.jsx';
import SavedDialog from '../ui/SavedDialog.jsx';
import useStackLabels from '../../lib/useStackLabels.js';
import { useApp } from '../../store/AppStore.jsx';
import { canOpenPath } from '../../data/nav.js';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { auth } = useApp();
  const shell = useRef(null);
  useStackLabels(shell);

  // A page this role does not open — typed in, or an old link — goes home.
  if (!canOpenPath(auth, pathname)) return <Navigate to="/" replace />;

  return (
    // One header across the top, the section rail down the left, and on a
    // phone the tab bar along the bottom. Pinned to the screen (fixed, inset
    // 0) so the page never scrolls the frame itself — only the middle
    // scrolls, and the header and tab bar stay where they are.
    <div ref={shell} className="fixed inset-0 flex flex-col bg-surface-base bg-app-aurora">
      <Header onOpenMobile={() => setMobileOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <main key={pathname} className="mx-auto max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6 lg:py-8">
            <Outlet />
          </main>

          <footer className="hidden border-t border-ink-900/[0.07] px-6 py-5 text-center text-xs text-ink-400 lg:block">
            Smira Club · Travel agency admin panel — demo data for client review
          </footer>
        </div>
      </div>

      {/* A row of the frame, not floating over the page, so it cannot scroll away. */}
      <MobileTabBar />
      <Toaster />
      <SavedDialog />
    </div>
  );
}
