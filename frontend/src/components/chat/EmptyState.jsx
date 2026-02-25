import React from "react";
import { Sparkles } from "lucide-react";

export const EmptyState = ({ onPromptClick }) => {
  const suggestions = [
    "Explain Newton's Laws in simple terms",
    "How do I improve time management?",
    "Help me structure a research paper",
    "Explain recursion with examples",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
      
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shadow-lg mb-4">
        <Sparkles className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        Welcome to <span className="text-accent-600">Sahayak</span>
      </h2>

      <p className="text-slate-500 max-w-md mb-6">
        Your academic AI mentor. Ask me about subjects, study strategies,
        research help, or writing guidance.
      </p>

      <div className="grid gap-3 w-full max-w-md">
        {suggestions.map((text, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(text)}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition text-sm text-slate-700 shadow-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
