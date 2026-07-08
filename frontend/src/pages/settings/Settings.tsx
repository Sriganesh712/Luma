import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  BarChart2, BookOpen, FileText, ClipboardList, MessageSquare,
  School, Users, GraduationCap, Settings as SettingsIcon,
} from 'lucide-react';

const themeOptions: { value: ThemeMode; icon: typeof Sun; label: string; description: string }[] = [
  { value: 'light',  icon: Sun,     label: 'Light',  description: 'Always use light appearance' },
  { value: 'dark',   icon: Moon,    label: 'Dark',   description: 'Always use dark appearance' },
  { value: 'system', icon: Monitor, label: 'System', description: 'Follow your device settings' },
];

function getNavItems(role: string) {
  if (role === 'admin') return [
    { icon: BarChart2,     label: 'Overview',  to: '/admin' },
    { icon: School,        label: 'Classes',   to: '/admin/classes' },
    { icon: Users,         label: 'Teachers',  to: '/admin/teachers' },
    { icon: GraduationCap, label: 'Students',  to: '/admin/students' },
    { icon: SettingsIcon,  label: 'Settings',  to: '/admin/settings' },
  ];
  if (role === 'teacher') return [
    { icon: BookOpen,      label: 'Overview',      to: '/teacher' },
    { icon: Users,         label: 'My Classes',    to: '/teacher/classes' },
    { icon: FileText,      label: 'Materials',     to: '/teacher/materials' },
    { icon: ClipboardList, label: 'Assignments',   to: '/teacher/assignments' },
    { icon: MessageSquare, label: 'Student Chats', to: '/teacher/chats' },
    { icon: SettingsIcon,  label: 'Settings',      to: '/teacher/settings' },
  ];
  return [
    { icon: BarChart2,     label: 'Dashboard',   to: '/student' },
    { icon: BookOpen,      label: 'My Classes',  to: '/student/classes' },
    { icon: FileText,      label: 'Materials',   to: '/student/materials' },
    { icon: ClipboardList, label: 'Assignments', to: '/student/assignments' },
    { icon: BarChart2,     label: 'My Grades',   to: '/student/grades' },
    { icon: MessageSquare, label: 'Luma Chat',   to: '/student/chat' },
    { icon: SettingsIcon,  label: 'Settings',    to: '/student/settings' },
  ];
}

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { profile } = useAuth();
  const role = profile?.role ?? 'student';

  return (
    <DashboardLayout
      navItems={getNavItems(role)}
      role={role}
      pageTitle="Settings"
      pageSubtitle="Customize your experience"
    >
      <div className="max-w-2xl space-y-6">
        {/* Appearance Section */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
              <Palette className="w-5 h-5" style={{ color: 'var(--blue)' }} />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--ink)' }}>Appearance</h2>
              <p className="text-xs" style={{ color: 'var(--ink-4)' }}>Choose your preferred theme</p>
            </div>
          </div>

          <div className="grid gap-3">
            {themeOptions.map(({ value, icon: Icon, label, description }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className="w-full text-left px-4 py-4 rounded-xl border-2 transition-all flex items-center gap-4 group"
                style={{
                  borderColor: theme === value ? 'var(--blue)' : 'var(--border)',
                  background: theme === value ? 'var(--bg-hover)' : 'var(--bg-card)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition"
                  style={{
                    background: theme === value ? 'var(--blue-light)' : 'var(--bg-section)',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: theme === value ? 'var(--blue)' : 'var(--ink-4)' }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>{description}</div>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                  style={{
                    borderColor: theme === value ? 'var(--blue)' : 'var(--border)',
                  }}
                >
                  {theme === value && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--blue)' }} />
                  )}
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--ink-4)' }}>
            Currently using <span className="font-semibold" style={{ color: 'var(--ink-3)' }}>{resolvedTheme}</span> appearance.
            {theme === 'system' && ' Your device controls this setting.'}
          </p>
        </div>

        {/* Account Info */}
        <div className="card-glass p-6">
          <h2 className="font-bold text-base mb-4" style={{ color: 'var(--ink)' }}>Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--ink-3)' }}>Name</span>
              <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{profile?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--ink-3)' }}>Email</span>
              <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{profile?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm" style={{ color: 'var(--ink-3)' }}>Role</span>
              <span className="text-sm font-medium capitalize" style={{ color: 'var(--ink)' }}>{profile?.role ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
