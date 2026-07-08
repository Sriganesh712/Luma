import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowRight, Check } from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ROLES: { value: UserRole; label: string; description: string; color: string }[] = [
  { value: 'admin',   label: 'Administrator', description: 'Manage institution, classes, and users', color: '#7c3aed' },
  { value: 'teacher', label: 'Teacher',        description: 'Share materials, create assignments',   color: '#057642' },
  { value: 'student', label: 'Student',        description: 'Learn, submit assignments, chat with AI', color: '#0056D2' },
];

export default function CompleteProfile() {
  const { user, profile, completeProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    role: 'student' as UserRole, institutionCode: '', institutionName: '',
  });

  useEffect(() => {
    if (!user) navigate('/login');
    if (profile) navigate('/dashboard');
  }, [user, profile, navigate]);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await completeProfile({
      id: user!.id,
      email: user!.email!,
      name: user!.user_metadata?.full_name || user!.email!.split('@')[0],
      password: '', // Unused here, Google manages auth
      role: form.role,
      institutionCode: form.institutionCode,
      institutionName: form.institutionName,
    });
    setLoading(false);

    if (error) toast.error(error);
    else {
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-[400px] p-8 rounded-3xl card-glass">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-violet-600">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--ink)' }}>Luma</span>
        </div>

        <div className="mb-8">
          <h1 className="font-bold text-2xl mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Complete your profile
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
            You signed in successfully! We just need a few more details to set up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink-2)' }}>I am a...</label>
            <div className="space-y-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: form.role === r.value ? r.color : 'var(--border)',
                    background: form.role === r.value ? `${r.color}08` : 'var(--bg-card)',
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{r.label}</div>
                    {form.role === r.value && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: r.color }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>{r.description}</div>
                </button>
              ))}
            </div>
          </div>

          {form.role === 'admin' ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Institution Name</label>
              <input type="text" required value={form.institutionName} onChange={e => update('institutionName', e.target.value)}
                placeholder="e.g. Springfield High School" className="form-input" />
              <p className="text-xs mt-1" style={{ color: 'var(--ink-4)' }}>A unique institution code will be generated for you.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Institution Code</label>
              <input type="text" required value={form.institutionCode}
                onChange={e => update('institutionCode', e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3" maxLength={6} className="form-input font-mono tracking-widest" />
              <p className="text-xs mt-1" style={{ color: 'var(--ink-4)' }}>Ask your institution admin for the 6-character code.</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gradient w-full py-3 justify-center text-sm font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Complete Profile <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button onClick={signOut} className="text-sm font-medium hover:underline" style={{ color: 'var(--ink-4)' }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
