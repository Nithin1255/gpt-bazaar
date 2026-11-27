import React, { useState } from 'react';
import { CheckCircle2, Info, Plus, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminDashboard, type AdminTab } from './components/admin/AdminDashboard';

function AdminWorkspace() {
  const { toasts, firestoreError } = useStore();
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const navLinks: { id: AdminTab; label: string }[] = [
    { id: 'orders', label: 'Live Orders' },
    { id: 'products', label: 'Products' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'categories', label: 'Categories' },
    { id: 'overview', label: 'Overview' },
  ];

  const handleQuickUpload = () => {
    setAdminTab('products');
    setUploadTrigger((n) => n + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-[#0F172A]">
      {/* Dedicated Admin Operations Top Bar */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-[#E4EBE6]">
        <div className="max-w-[1440px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setAdminTab('orders')}
            className="font-display font-extrabold text-lg tracking-tight text-[#074220] whitespace-nowrap shrink-0 cursor-pointer inline-flex items-baseline gap-1.5"
          >
            <span>
              GPT <span className="text-[#0E6F2D]">Bazaar</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">Admin</span>
          </button>

          {/* Zone 2: 5 Clean Single-Line Admin Section Links */}
          <nav className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const active = adminTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setAdminTab(link.id)}
                  className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'text-[#0E6F2D] font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[2px] rounded-full bg-[#0E6F2D]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleQuickUpload}
              className="h-9 px-4 rounded-lg bg-[#0E6F2D] hover:bg-[#0A5823] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product
            </button>
          </div>
        </div>
      </header>

      {/* Firestore error banner if any */}
      {firestoreError && (
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Firestore notice: {firestoreError}</span>
          </div>
        </div>
      )}

      {/* Main Content — Exclusively the Admin Operations Console */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5">
        <AdminDashboard
          activeTab={adminTab}
          onTabChange={setAdminTab}
          hideNav
          externalTriggerAdd={uploadTrigger}
        />
      </main>

      {/* Live Confirmation Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg"
          >
            {t.tone === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-[#FFC800] shrink-0" />
            ) : t.tone === 'info' ? (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AdminWorkspace />
      </StoreProvider>
    </ErrorBoundary>
  );
}
