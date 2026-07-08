import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, School, Settings, BarChart2, Users, GraduationCap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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

  const navItems = [
    { icon: BarChart2,     label: 'Overview',  to: '/admin' },
    { icon: School,        label: 'Classes',   to: '/admin/classes' },
    { icon: Users,         label: 'Teachers',  to: '/admin/teachers' },
    { icon: GraduationCap, label: 'Students',  to: '/admin/students' },
    { icon: Settings,      label: 'Settings',  to: '/admin/settings' },
  ];

  return (
    <DashboardLayout navItems={navItems} role="admin" pageTitle="New Class" pageSubtitle="Create a new class">
      <div className="max-w-lg">
        <div className="card-glass p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-3)' }}>Class Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                placeholder="e.g. Grade 10 - Mathematics" className="form-input" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-3)' }}>Subject</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Mathematics, Physics" className="form-input" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-3)' }}>Assign Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))} className="form-input">
                <option value="">— Select a teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
              </select>
              {teachers.length === 0 && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--ink-4)' }}>No teachers yet. Add teachers first from the Users page.</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-gradient w-full py-2.5 justify-center mt-2 flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Class'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
