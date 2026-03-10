import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Users, UserPlus, Trash2, Loader2, GraduationCap, Pencil } from 'lucide-react';
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;

  const teacher = allTeachers.find(t => t.id === cls?.teacher_id);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/classes" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-white text-xl font-bold">{cls?.name}</h1>
            {cls?.subject && <p className="text-slate-400 text-sm">{cls.subject}</p>}
          </div>
        </div>

        {/* Teacher assignment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> Class Teacher</h2>
            <button onClick={() => setEditTeacher(!editTeacher)} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition">
              <Pencil className="w-3.5 h-3.5" /> {editTeacher ? 'Cancel' : 'Change'}
            </button>
          </div>
          {editTeacher ? (
            <div className="flex gap-3">
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="">— No teacher —</option>
                {allTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={saveTeacher} disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-xl transition flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          ) : (
            <div className="text-sm">
              {teacher ? (
                <div>
                  <div className="text-white font-medium">{teacher.name}</div>
                  <div className="text-slate-400">{teacher.email}</div>
                </div>
              ) : <span className="text-amber-500">No teacher assigned yet.</span>}
            </div>
          )}
        </div>

        {/* Enroll students */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold flex items-center gap-2 mb-4"><UserPlus className="w-4 h-4 text-green-400" /> Add Students</h2>
          {allStudents.length === 0 ? (
            <p className="text-slate-400 text-sm">All registered students are already enrolled.</p>
          ) : (
            <div className="space-y-3">
              <div className="max-h-48 overflow-y-auto border border-slate-700 rounded-xl divide-y divide-slate-700">
                {allStudents.map(s => (
                  <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 cursor-pointer">
                    <input type="checkbox" checked={enrollIds.includes(s.id)}
                      onChange={e => setEnrollIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                      className="rounded border-slate-600 text-indigo-600" />
                    <div>
                      <div className="text-white text-sm">{s.name}</div>
                      <div className="text-slate-400 text-xs">{s.email}</div>
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" /> Enrolled Students
              <span className="text-slate-400 font-normal">({students.length})</span>
            </h2>
          </div>
          {students.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No students enrolled yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <div className="text-white text-sm font-medium">{s.name}</div>
                    <div className="text-slate-400 text-xs">{s.email}</div>
                  </div>
                  <button onClick={() => unenroll(s.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
