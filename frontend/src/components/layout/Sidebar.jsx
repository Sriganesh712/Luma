import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navigationItems } from '../../data/mockMessages';

const iconComponents = {
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v7a1 1 0 001 1h2m4-4v4m0 0h2a1 1 0 001-1v-4m0 0V9m0 0l-7-4" />
    </svg>
  ),
  BookOpen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11.002c0 5.252-4.5 10.002-10 10.002M2 17.25h20" />
    </svg>
  ),
  BarChart3: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Focus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M12 15a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
  ),
};

export const Sidebar = ({ activeItem = 'home', onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-2xl text-slate-600 hover:bg-slate-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed md:static left-0 top-0 h-full w-64 bg-slate-100 border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-smooth ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-sm">Sahayak</span>
              <span className="text-xs text-slate-500">Academic Mentor</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = iconComponents[item.icon];
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick?.(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ease-smooth ${
                  isActive
                    ? 'bg-white text-accent-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                <IconComponent />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-3 rounded-2xl bg-white/40 border border-white/20 text-center">
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Pro Tip:</span> Use focus mode for distraction-free learning
            </p>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
