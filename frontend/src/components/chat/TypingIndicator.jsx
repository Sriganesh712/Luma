import React from 'react';

export const TypingIndicator = () => {
  return (
    <div className="flex gap-1.5 px-4 py-3 rounded-3xl bg-white border border-slate-200 w-fit shadow-base animate-fade-in">
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce-dot" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce-dot" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce-dot" style={{ animationDelay: '300ms' }} />
    </div>
  );
};
