import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Teacher { id: string; name: string; email: string; }

export default function ClassForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', teacher_id: '' });

  useEffect(() => {
    if (profile?.institution_id) loadTeachers();
  }, [profile]);

  async function loadTeachers() {
    const { data } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('institution_id', profile!.institution_id!)
      .eq('role', 'teacher')
      .order('name');
    setTeachers(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Class name is required.');
    setLoading(true);
    const { data, error } = await supabase.from('classes').insert({
      name: form.name.trim(),
      subject: form.subject.trim() || null,
      teacher_id: form.teacher_id || null,
      institution_id: profile!.institution_id!,
    }).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Class created!');
    navigate(`/admin/classes/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/classes" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-white text-xl font-bold">New Class</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Class Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                placeholder="e.g. Grade 10 - Mathematics"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Mathematics, Physics"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                <option value="">— Select a teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
              </select>
              {teachers.length === 0 && (
                <p className="text-slate-500 text-xs mt-1.5">No teachers yet. Add teachers first from the Users page.</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Class'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
