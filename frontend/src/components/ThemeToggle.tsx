import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: 'light',  icon: Sun,     label: 'Light' },
  { value: 'dark',   icon: Moon,    label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    // Cycle through modes on click
    const next: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' };
    const current = modes.find(m => m.value === theme)!;
    const Icon = current.icon;
    return (
      <button
        onClick={() => setTheme(next[theme])}
        className="p-2 rounded-xl transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title={`Theme: ${current.label}`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === value
              ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          title={label}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
