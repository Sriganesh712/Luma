import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  role: string;
  pageTitle: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const COURSE_GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
];

export default function DashboardLayout({
  navItems, role, pageTitle, pageSubtitle, headerActions, children
}: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const roleColors: Record<string, string> = {
    student: 'bg-blue-50 text-blue-700',
    teacher: 'bg-emerald-50 text-emerald-700',
    admin:   'bg-violet-50 text-violet-700',
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-white border-r
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderColor: 'var(--ink-5)', boxShadow: 'var(--shadow-md)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--ink-5)' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--grad-primary)' }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm tracking-tight" style={{ color: 'var(--ink)' }}>AI-Mentor</div>
            <div className="text-xs font-medium capitalize mt-0.5" style={{ color: 'var(--ink-3)' }}>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[role] ?? 'bg-gray-100 text-gray-600'}`}>
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
            style={{ color: 'var(--ink-3)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => {
            const isActive = location.pathname === to || (to !== '/' + role && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item-v2 ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid var(--ink-5)' }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-section)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'var(--grad-primary)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{profile?.name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--ink-4)' }}>{profile?.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition text-sm font-medium hover:bg-red-50 hover:text-red-600"
            style={{ color: 'var(--ink-3)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Sticky frosted glass header */}
        <header
          className="sticky top-0 z-20 glass-surface px-6 py-3.5 flex items-center gap-4"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            style={{ color: 'var(--ink-3)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>{pageSubtitle}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {headerActions}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
