import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  BookOpen, ClipboardList, MessageSquare, BarChart2,
  Clock, ChevronRight, FileText, Sparkles, CheckCircle2,
} from 'lucide-react';
import DashboardLayout, { COURSE_GRADIENTS } from '../../components/layout/DashboardLayout';

interface ClassItem  { id: string; name: string; subject: string | null; teacher: { name: string } | null; }
interface AssignmentItem { id: string; title: string; type: string; deadline: string | null; class: { name: string } | null; submitted: boolean; }

function getTimeGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [classes, setClasses]         = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { if (profile?.id) loadDashboard(); }, [profile]);

  async function loadDashboard() {
    const [enrollmentsRes, submissionsRes] = await Promise.all([
      supabase.from('enrollments').select('class:class_id(id, name, subject, teacher:teacher_id(name))').eq('student_id', profile!.id),
      supabase.from('submissions').select('assignment_id').eq('student_id', profile!.id),
    ]);
    const myClasses: ClassItem[] = (enrollmentsRes.data ?? []).map((e: any) => e.class);
    setClasses(myClasses);
    const submittedIds = new Set((submissionsRes.data ?? []).map((s: any) => s.assignment_id));
    if (myClasses.length > 0) {
      const { data } = await supabase.from('assignments')
        .select('id, title, type, deadline, class:class_id(name)')
        .in('class_id', myClasses.map(c => c.id))
        .eq('status', 'published')
        .order('deadline', { ascending: true }).limit(6);
      setAssignments((data ?? []).map((a: any) => ({ ...a, submitted: submittedIds.has(a.id) })));
    }
    setLoading(false);
  }

  const navItems = [
    { icon: BarChart2,     label: 'Dashboard',   to: '/student' },
    { icon: BookOpen,      label: 'My Classes',  to: '/student/classes' },
    { icon: FileText,      label: 'Materials',   to: '/student/materials' },
    { icon: ClipboardList, label: 'Assignments', to: '/student/assignments' },
    { icon: BarChart2,     label: 'My Grades',   to: '/student/grades' },
    { icon: MessageSquare, label: 'Luma Chat',   to: '/student/chat' },
  ];

  const pending   = assignments.filter(a => !a.submitted).length;
  const submitted = assignments.filter(a =>  a.submitted).length;

  return (
    <DashboardLayout
      navItems={navItems} role="student" pageTitle="My Dashboard"
      pageSubtitle={`Good ${getTimeGreeting()}, ${profile?.name?.split(' ')[0]} 👋`}
      headerActions={
        <Link to="/student/chat" className="btn-gradient flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4" /> Luma Chat
        </Link>
      }
    >
      {/* ── Hero banner with background image ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{ minHeight: 220 }}>
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80"
          alt="Learning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,56,120,0.88) 0%, rgba(0,86,210,0.78) 60%, rgba(0,153,204,0.70) 100%)'
        }} />
        <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h2 className="font-bold text-3xl text-white tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
              Good {getTimeGreeting()}, {profile?.name?.split(' ')[0]}!
            </h2>
            <p className="text-blue-200 text-sm">Here's your learning overview.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Enrolled Classes', value: classes.length,    icon: BookOpen      },
              { label: 'Pending Tasks',    value: pending,            icon: Clock         },
              { label: 'Submitted',        value: submitted,          icon: CheckCircle2  },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 min-w-[120px]">
                <s.icon className="w-5 h-5 text-blue-200 shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-white leading-none">{s.value}</div>
                  <div className="text-blue-200 text-xs mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── My Classes ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>My Classes</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink-3)' }}>{classes.length} enrolled</p>
          </div>
          <Link to="/student/classes"
            className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: 'var(--blue)' }}>
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
            <p className="font-medium" style={{ color: 'var(--ink-3)' }}>You're not enrolled in any classes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, i) => (
              <Link key={cls.id} to={`/student/classes/${cls.id}`} className="course-card group">
                <div className={`h-28 bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} flex items-end p-4 relative overflow-hidden`}>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-xs font-bold uppercase tracking-wider bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                    {cls.subject ?? 'General'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>{cls.name}</h3>
                  {cls.teacher && <p className="text-xs" style={{ color: 'var(--ink-4)' }}>by {cls.teacher.name}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                      Enrolled
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--blue)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Assignments ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>Assignments</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink-3)' }}>{pending} pending</p>
          </div>
          <Link to="/student/assignments"
            className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: 'var(--blue)' }}>
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
              <p className="font-medium" style={{ color: 'var(--ink-3)' }}>No assignments right now. 🎉</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--ink-5)' }}>
              {assignments.map(a => (
                <Link key={a.id} to={`/student/assignments/${a.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 transition group">
                  <div className={`w-1 h-10 rounded-full shrink-0 ${a.submitted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{a.title}</div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--ink-4)' }}>{a.class?.name}</span>
                      <span style={{ color: 'var(--ink-5)' }}>·</span>
                      <span className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--ink-4)' }}>{a.type}</span>
                      {a.deadline && (
                        <>
                          <span style={{ color: 'var(--ink-5)' }}>·</span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--ink-4)' }}>
                            <Clock className="w-3 h-3" />
                            {new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 badge ${a.submitted ? 'badge-green' : 'badge-amber'}`}>
                    {a.submitted ? 'Submitted' : 'Pending'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
