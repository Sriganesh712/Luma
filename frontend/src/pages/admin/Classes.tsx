import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { School, Plus, ChevronRight, GraduationCap, Search, ArrowLeft } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  subject: string | null;
  teacher: { name: string } | null;
  studentCount: number;
}

export default function AdminClasses() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.institution_id) loadClasses();
  }, [profile]);

  async function loadClasses() {
    const { data } = await supabase
      .from('classes')
      .select('id, name, subject, teacher:teacher_id(name), enrollments(count)')
      .eq('institution_id', profile!.institution_id!)
      .order('created_at', { ascending: false });

    setClasses((data ?? []).map((c: any) => ({
      id: c.id, name: c.name, subject: c.subject,
      teacher: Array.isArray(c.teacher) ? c.teacher[0] ?? null : c.teacher,
      studentCount: c.enrollments?.[0]?.count ?? 0,
    })));
    setLoading(false);
  }

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.subject ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-white text-xl font-bold">Classes</h1>
          <Link to="/admin/classes/new" className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition">
            <Plus className="w-4 h-4" /> New Class
          </Link>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <School className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">{search ? 'No classes match your search.' : 'No classes yet.'}</p>
              {!search && (
                <Link to="/admin/classes/new" className="text-indigo-400 hover:text-indigo-300 text-sm mt-1 block transition">
                  Create your first class →
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map(cls => (
                <Link key={cls.id} to={`/admin/classes/${cls.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition group">
                  <div>
                    <div className="text-white font-medium text-sm">{cls.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {cls.subject ? `${cls.subject} · ` : ''}
                      {cls.teacher ? cls.teacher.name : <span className="text-amber-500">No teacher assigned</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> {cls.studentCount}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
