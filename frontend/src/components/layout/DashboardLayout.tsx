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
    <div className="min-h-screen flex bg-zinc-50">
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
          bg-white border-r border-zinc-200 shadow-md
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-200">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600"
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm tracking-tight text-zinc-950">AI-Mentor</div>
            <div className="text-xs font-medium capitalize mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[role] ?? 'bg-zinc-100 text-zinc-600'}`}>
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 transition text-zinc-600"
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
        <div className="px-3 py-4 space-y-1 border-t border-zinc-200">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-100"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600"
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-zinc-950">{profile?.name}</div>
              <div className="text-xs truncate text-zinc-500">{profile?.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600"
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
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 transition text-zinc-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base leading-tight text-zinc-950">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-xs mt-0.5 text-zinc-500">{pageSubtitle}</p>
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

