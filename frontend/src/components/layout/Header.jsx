import React from 'react';

export const Header = () => {
  return (
    <div className="w-full border-b border-slate-200 bg-slate-50/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              AI Mentor
            </h1>
            <p className="mt-1 text-sm text-slate-500">Your personal academic companion</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-subtle" />
            <span className="text-xs font-medium text-slate-700">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
