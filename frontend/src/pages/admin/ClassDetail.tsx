import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, Trash2, Loader2, GraduationCap, Pencil, School, Settings, BarChart2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

interface ClassData { id: string; name: string; subject: string | null; teacher_id: string | null; }
interface UserItem { id: string; name: string; email: string; }

export default function AdminClassDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [cls, setCls] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<UserItem[]>([]);
  const [allStudents, setAllStudents] = useState<UserItem[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserItem[]>([]);
  const [editTeacher, setEditTeacher] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [enrollIds, setEnrollIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadAll(); }, [id]);

  async function loadAll() {
    const instId = profile!.institution_id!;
    const [clsRes, enrollRes, studentsRes, teachersRes] = await Promise.all([
      supabase.from('classes').select('*').eq('id', id!).single(),
      supabase.from('enrollments').select('student:student_id(id, name, email)').eq('class_id', id!),
      supabase.from('users').select('id, name, email').eq('institution_id', instId).eq('role', 'student').order('name'),
      supabase.from('users').select('id, name, email').eq('institution_id', instId).eq('role', 'teacher').order('name'),
    ]);
    setCls(clsRes.data);
    setSelectedTeacher(clsRes.data?.teacher_id ?? '');
    const enrolled: UserItem[] = (enrollRes.data ?? []).map((e: any) =>
      Array.isArray(e.student) ? e.student[0] : e.student
    ).filter(Boolean);
    setStudents(enrolled);
    const enrolledIds = new Set(enrolled.map(s => s.id));
    setAllStudents((studentsRes.data ?? []).filter(s => !enrolledIds.has(s.id)));
    setAllTeachers(teachersRes.data ?? []);
    setLoading(false);
  }

  async function saveTeacher() {
    setSaving(true);
    const { error } = await supabase.from('classes').update({ teacher_id: selectedTeacher || null }).eq('id', id!);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Teacher updated!');
    setEditTeacher(false);
    loadAll();
  }

  async function enrollStudents() {
    if (!enrollIds.length) return;
    setSaving(true);
    const rows = enrollIds.map(student_id => ({ class_id: id!, student_id }));
    const { error } = await supabase.from('enrollments').upsert(rows);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${enrollIds.length} student(s) enrolled!`);
    setEnrollIds([]);
    loadAll();
  }

  async function unenroll(studentId: string) {
    await supabase.from('enrollments').delete().eq('class_id', id!).eq('student_id', studentId);
    toast.success('Student removed.');
    loadAll();
  }

  const navItems = [
    { icon: BarChart2,     label: 'Overview',  to: '/admin' },
    { icon: School,        label: 'Classes',   to: '/admin/classes' },
    { icon: Users,         label: 'Teachers',  to: '/admin/teachers' },
    { icon: GraduationCap, label: 'Students',  to: '/admin/students' },
    { icon: Settings,      label: 'Settings',  to: '/admin/settings' },
  ];

  const teacher = allTeachers.find(t => t.id === cls?.teacher_id);

  return (
    <DashboardLayout navItems={navItems} role="admin" pageTitle={cls?.name ?? 'Class Detail'} pageSubtitle={cls?.subject ?? undefined}>
      {loading ? (
        <div className="py-20 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Teacher assignment */}
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}><Users className="w-4 h-4" style={{ color: 'var(--blue)' }} /> Class Teacher</h2>
              <button onClick={() => setEditTeacher(!editTeacher)} className="text-sm flex items-center gap-1 transition" style={{ color: 'var(--blue)' }}>
                <Pencil className="w-3.5 h-3.5" /> {editTeacher ? 'Cancel' : 'Change'}
              </button>
            </div>
            {editTeacher ? (
              <div className="flex gap-3">
                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="form-input flex-1">
                  <option value="">— No teacher —</option>
                  {allTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button onClick={saveTeacher} disabled={saving} className="btn-gradient px-4 py-2 text-sm flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            ) : (
              <div className="text-sm">
                {teacher ? (
                  <div>
                    <div className="font-medium" style={{ color: 'var(--ink)' }}>{teacher.name}</div>
                    <div style={{ color: 'var(--ink-4)' }}>{teacher.email}</div>
                  </div>
                ) : <span className="text-amber-500">No teacher assigned yet.</span>}
              </div>
            )}
          </div>

          {/* Enroll students */}
          <div className="card-glass p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--ink)' }}><UserPlus className="w-4 h-4 text-green-500" /> Add Students</h2>
            {allStudents.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ink-4)' }}>All registered students are already enrolled.</p>
            ) : (
              <div className="space-y-3">
                <div className="max-h-48 overflow-y-auto rounded-xl divide-y" style={{ border: '1px solid var(--border)', borderColor: 'var(--border)' }}>
                  {allStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition hover:bg-violet-50/50 dark:hover:bg-violet-900/10" style={{ borderColor: 'var(--border)' }}>
                      <input type="checkbox" checked={enrollIds.includes(s.id)}
                        onChange={e => setEnrollIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                        className="rounded" />
                      <div>
                        <div className="text-sm" style={{ color: 'var(--ink)' }}>{s.name}</div>
                        <div className="text-xs" style={{ color: 'var(--ink-4)' }}>{s.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <button onClick={enrollStudents} disabled={enrollIds.length === 0 || saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Enroll {enrollIds.length > 0 ? enrollIds.length : ''} Student{enrollIds.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>

          {/* Enrolled students list */}
          <div className="card-glass overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <GraduationCap className="w-4 h-4" style={{ color: 'var(--blue)' }} /> Enrolled Students
                <span style={{ color: 'var(--ink-4)' }} className="font-normal">({students.length})</span>
              </h2>
            </div>
            {students.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--ink-4)' }}>No students enrolled yet.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{s.name}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-4)' }}>{s.email}</div>
                    </div>
                    <button onClick={() => unenroll(s.id)}
                      className="p-1.5 rounded-lg transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400" style={{ color: 'var(--ink-4)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
