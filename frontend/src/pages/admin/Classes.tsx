import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { School, Plus, ChevronRight, GraduationCap, Search, Settings, BarChart2, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

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

  const navItems = [
    { icon: BarChart2,     label: 'Overview',  to: '/admin' },
    { icon: School,        label: 'Classes',   to: '/admin/classes' },
    { icon: Users,         label: 'Teachers',  to: '/admin/teachers' },
    { icon: GraduationCap, label: 'Students',  to: '/admin/students' },
    { icon: Settings,      label: 'Settings',  to: '/admin/settings' },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      role="admin"
      pageTitle="Classes"
      pageSubtitle={`${classes.length} total classes`}
      headerActions={
        <Link to="/admin/classes/new" className="btn-gradient flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Class
        </Link>
      }
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--ink-4)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="form-input pl-10"
        />
      </div>

      {/* Classes list */}
      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <School className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--ink-5)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{search ? 'No classes match your search.' : 'No classes yet.'}</p>
            {!search && (
              <Link to="/admin/classes/new" className="text-sm font-semibold mt-1 block hover:underline" style={{ color: 'var(--blue)' }}>
                Create your first class →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map(cls => (
              <Link key={cls.id} to={`/admin/classes/${cls.id}`}
                className="flex items-center justify-between px-6 py-4 transition group hover:bg-violet-50/50 dark:hover:bg-violet-900/10">
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{cls.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>
                    {cls.subject ? `${cls.subject} · ` : ''}
                    {cls.teacher ? cls.teacher.name : <span className="text-amber-500">No teacher assigned</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-4)' }}>
                    <GraduationCap className="w-3.5 h-3.5" /> {cls.studentCount}
                  </span>
                  <ChevronRight className="w-4 h-4 transition" style={{ color: 'var(--ink-5)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
