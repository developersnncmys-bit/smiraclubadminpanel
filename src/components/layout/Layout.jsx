import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import Toaster from '../ui/Toaster.jsx';

export default function Layout() {
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    // One header spans the full width; the sidebar and page sit beneath it.
    <div className="flex h-screen flex-col bg-surface-base bg-app-aurora">
      <Topbar
        compact={compact}
        onToggleCompact={() => setCompact((c) => !c)}
        onOpenMobile={() => setMobileOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          compact={compact}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1 overflow-y-auto">
          <main key={pathname} className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
            <Outlet />
          </main>

          <footer className="border-t border-ink-900/5 px-6 py-5 text-center text-xs text-ink-400">
            Smira Club · Travel agency admin panel — demo data for client review
          </footer>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
