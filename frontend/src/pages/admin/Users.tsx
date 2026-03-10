import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Search, Users, GraduationCap } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-white text-xl font-bold">Users</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div>
            <div><div className="text-2xl font-bold text-white">{teacherCount}</div><div className="text-slate-400 text-sm">Teachers</div></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><GraduationCap className="w-5 h-5 text-green-400" /></div>
            <div><div className="text-2xl font-bold text-white">{studentCount}</div><div className="text-slate-400 text-sm">Students</div></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm" />
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {(['all', 'teacher', 'student'] as const).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 text-sm font-medium transition capitalize ${roleFilter === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {search || roleFilter !== 'all' ? 'No users match your filters.' : 'No users yet. Users must register with your institution code.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{u.name}</div>
                      <div className="text-slate-400 text-xs">{u.email}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    u.role === 'teacher' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
