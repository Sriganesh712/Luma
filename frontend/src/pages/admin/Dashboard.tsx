import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Users, GraduationCap, School,
  ChevronRight, Plus, BarChart2, Settings,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Stats {
  teachers: number;
  students: number;
  classes: number;
}

interface ClassItem {
  id: string;
  name: string;
  subject: string | null;
  teacher: { name: string } | null;
  studentCount: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ teachers: 0, students: 0, classes: 0 });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [institutionCode, setInstitutionCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.institution_id) {
      loadDashboard();
      loadInstitutionCode();
    }
  }, [profile]);

  async function loadInstitutionCode() {
    const { data } = await supabase
      .from('institutions')
      .select('code')
      .eq('id', profile!.institution_id!)
      .single();
    if (data) setInstitutionCode(data.code);
  }

  async function loadDashboard() {
    const instId = profile!.institution_id!;

    const [teachersRes, studentsRes, classesRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }).eq('institution_id', instId).eq('role', 'teacher'),
      supabase.from('users').select('id', { count: 'exact' }).eq('institution_id', instId).eq('role', 'student'),
      supabase.from('classes').select(`
        id, name, subject,
        teacher:teacher_id ( name ),
        enrollments ( count )
      `).eq('institution_id', instId),
    ]);

    setStats({
      teachers: teachersRes.count ?? 0,
      students: studentsRes.count ?? 0,
      classes: classesRes.data?.length ?? 0,
    });

    const mappedClasses: ClassItem[] = (classesRes.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      teacher: c.teacher,
      studentCount: c.enrollments?.[0]?.count ?? 0,
    }));
    setClasses(mappedClasses);
    setLoading(false);
  }

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
      pageTitle="Institution Overview"
      pageSubtitle={`Welcome back, ${profile?.name}`}
      headerActions={
        <Link to="/admin/classes/new" className="btn-gradient flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Class
        </Link>
      }
    >
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6" style={{ minHeight: 180 }}>
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
          alt="Administration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.92) 0%, rgba(139,92,246,0.85) 60%, rgba(168,85,247,0.80) 100%)'
        }} />
        <div className="hero-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 p-8">
          <p className="text-purple-200 text-sm font-medium mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="font-bold text-3xl text-white tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
            Institution Overview
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Teachers', value: stats.teachers },
              { label: 'Students', value: stats.students },
              { label: 'Classes',  value: stats.classes  },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 text-center min-w-[90px]">
                <div className="text-2xl font-bold text-white leading-none">{s.value}</div>
                <div className="text-purple-200 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Institution code */}
      <div className="card-glass p-5 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-4)' }}>Institution Code</p>
        <div className="flex items-center gap-3">
          <code className="font-mono font-bold text-2xl tracking-widest" style={{ color: 'var(--blue)' }}>{institutionCode || '—'}</code>
          <p className="text-xs ml-auto" style={{ color: 'var(--ink-4)' }}>Share with teachers &amp; students to join</p>
        </div>
      </div>

      {/* Classes table */}
      <div className="card-glass overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--ink-5)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--ink)' }}>Classes</h2>
          <Link to="/admin/classes" className="text-sm font-semibold hover:underline transition" style={{ color: 'var(--blue)' }}>
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
        ) : classes.length === 0 ? (
          <div className="py-12 text-center">
            <School className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--ink-5)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>No classes yet.</p>
            <Link to="/admin/classes/new" className="text-sm font-semibold mt-1 block hover:underline" style={{ color: 'var(--blue)' }}>
              Create your first class →
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--ink-5)' }}>
            {classes.map(cls => (
              <Link key={cls.id} to={`/admin/classes/${cls.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition group">
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{cls.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>
                    {cls.subject && `${cls.subject} · `}
                    {cls.teacher ? cls.teacher.name : <span className="text-amber-500">No teacher assigned</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm flex items-center gap-1" style={{ color: 'var(--ink-4)' }}>
                    <GraduationCap className="w-4 h-4" />
                    {cls.studentCount}
                  </div>
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
