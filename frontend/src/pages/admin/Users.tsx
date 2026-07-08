import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Search, Users, GraduationCap, School, Settings, BarChart2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface UserItem { id: string; name: string; email: string; role: string; created_at: string; }

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.institution_id) loadUsers();
  }, [profile]);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('institution_id', profile!.institution_id!)
      .neq('role', 'admin')
      .order('name');
    setUsers(data ?? []);
    setLoading(false);
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const studentCount = users.filter(u => u.role === 'student').length;

  const navItems = [
    { icon: BarChart2,     label: 'Overview',  to: '/admin' },
    { icon: School,        label: 'Classes',   to: '/admin/classes' },
    { icon: Users,         label: 'Teachers',  to: '/admin/teachers' },
    { icon: GraduationCap, label: 'Students',  to: '/admin/students' },
    { icon: Settings,      label: 'Settings',  to: '/admin/settings' },
  ];

  return (
    <DashboardLayout navItems={navItems} role="admin" pageTitle="Users" pageSubtitle={`${users.length} total members`}>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{teacherCount}</div>
            <div className="text-sm" style={{ color: 'var(--ink-4)' }}>Teachers</div>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
            <GraduationCap className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{studentCount}</div>
            <div className="text-sm" style={{ color: 'var(--ink-4)' }}>Students</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ink-4)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="form-input pl-10" />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          {(['all', 'teacher', 'student'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-4 py-2 text-sm font-medium transition capitalize"
              style={{
                background: roleFilter === r ? 'var(--blue)' : 'transparent',
                color: roleFilter === r ? 'white' : 'var(--ink-3)',
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--ink-4)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--ink-3)' }}>
            {search || roleFilter !== 'all' ? 'No users match your filters.' : 'No users yet. Users must register with your institution code.'}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map(u => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {u.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{u.name}</div>
                    <div className="text-xs" style={{ color: 'var(--ink-4)' }}>{u.email}</div>
                  </div>
                </div>
                <span className={`badge ${u.role === 'teacher' ? 'badge-blue' : 'badge-green'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
