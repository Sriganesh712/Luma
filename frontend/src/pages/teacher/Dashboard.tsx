import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  BookOpen, FileText, ClipboardList, Users,
  Plus, ChevronRight, Clock, MessageSquare, Sparkles,
} from 'lucide-react';
import DashboardLayout, { COURSE_GRADIENTS } from '../../components/layout/DashboardLayout';

interface ClassItem      { id: string; name: string; subject: string | null; studentCount: number; }
interface AssignmentItem { id: string; title: string; type: string; status: string; deadline: string | null; class: { name: string } | null; }

function getTimeGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

const statusBadge: Record<string, string> = {
  draft:     'badge badge-gray',
  published: 'badge badge-green',
  closed:    'badge badge-red',
};

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [classes, setClasses]         = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { if (profile?.id) loadDashboard(); }, [profile]);

  async function loadDashboard() {
    const [classesRes, assignmentsRes] = await Promise.all([
      supabase.from('classes').select('id, name, subject, enrollments(count)').eq('teacher_id', profile!.id),
      supabase.from('assignments').select('id, title, type, status, deadline, class:class_id(name)')
        .eq('teacher_id', profile!.id).order('created_at', { ascending: false }).limit(5),
    ]);
    setClasses((classesRes.data ?? []).map((c: any) => ({ id: c.id, name: c.name, subject: c.subject, studentCount: c.enrollments?.[0]?.count ?? 0 })));
    setAssignments((assignmentsRes.data ?? []).map((a: any) => ({ ...a, class: Array.isArray(a.class) ? a.class[0] ?? null : a.class })));
    setLoading(false);
  }

  const navItems = [
    { icon: BookOpen,      label: 'Overview',      to: '/teacher' },
    { icon: Users,         label: 'My Classes',    to: '/teacher/classes' },
    { icon: FileText,      label: 'Materials',     to: '/teacher/materials' },
    { icon: ClipboardList, label: 'Assignments',   to: '/teacher/assignments' },
    { icon: MessageSquare, label: 'Student Chats', to: '/teacher/chats' },
  ];

  const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0);

  return (
    <DashboardLayout
      navItems={navItems} role="teacher" pageTitle="Teacher Dashboard"
      pageSubtitle={`Good ${getTimeGreeting()}, ${profile?.name?.split(' ')[0]}`}
      headerActions={
        <div className="flex items-center gap-2">
          <Link to="/teacher/materials/upload" className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <Plus className="w-4 h-4" /> Upload
          </Link>
          <Link to="/teacher/assignments/new" className="btn-gradient flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Assignment
          </Link>
        </div>
      }
    >
      {/* ── Hero banner ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{ minHeight: 200 }}>
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
          alt="Teaching"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(5,118,66,0.90) 0%, rgba(6,182,212,0.80) 100%)'
        }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h2 className="font-bold text-3xl text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Good {getTimeGreeting()}, {profile?.name?.split(' ')[0]}!
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Manage your classes and assignments.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Classes',     value: classes.length  },
              { label: 'Students',    value: totalStudents   },
              { label: 'Assignments', value: assignments.length },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 min-w-[90px] text-center">
                <div className="text-2xl font-bold text-white leading-none">{s.value}</div>
                <div className="text-emerald-100 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Classes ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>My Classes</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink-3)' }}>{classes.length} active</p>
          </div>
          <Link to="/teacher/classes" className="flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl skeleton" />)}
          </div>
        ) : classes.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-section)' }}>
              <BookOpen className="w-7 h-7" style={{ color: 'var(--ink-4)' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--ink-3)' }}>No classes assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, i) => (
              <Link key={cls.id} to={`/teacher/classes/${cls.id}`} className="course-card group">
                <div className={`h-28 bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-end p-4 relative overflow-hidden`}>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-xs font-bold uppercase tracking-wider bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                    {cls.subject ?? 'General'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>{cls.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-4)' }}>
                    <Users className="w-3.5 h-3.5" />
                    {cls.studentCount} students
                  </div>
                  <div className="mt-3 flex justify-end">
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--blue)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent Assignments ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>Recent Assignments</h2>
          </div>
          <Link to="/teacher/assignments" className="flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: 'var(--blue)' }}>
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="card-glass overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading…</div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-section)' }}>
                <ClipboardList className="w-7 h-7" style={{ color: 'var(--ink-4)' }} />
              </div>
              <p className="font-medium" style={{ color: 'var(--ink-3)' }}>No assignments yet.</p>
              <Link to="/teacher/assignments/new" className="text-sm font-semibold mt-1 block hover:underline" style={{ color: 'var(--blue)' }}>
                Create your first →
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--ink-5)' }}>
              {assignments.map(a => (
                <Link key={a.id} to={`/teacher/assignments/${a.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 transition">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{a.title}</div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5 text-xs" style={{ color: 'var(--ink-4)' }}>
                      <span>{a.class?.name}</span>
                      <span>·</span>
                      <span className="uppercase tracking-wide">{a.type}</span>
                      {a.deadline && (
                        <><span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span></>
                      )}
                    </div>
                  </div>
                  <span className={statusBadge[a.status] ?? 'badge badge-gray'}>{a.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
