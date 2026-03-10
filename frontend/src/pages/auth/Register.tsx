import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Brain, TrendingUp, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BG = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=80';

const ROLES: { value: UserRole; label: string; description: string; color: string }[] = [
  { value: 'admin',   label: 'Administrator', description: 'Manage institution, classes, and users', color: '#7c3aed' },
  { value: 'teacher', label: 'Teacher',        description: 'Share materials, create assignments',   color: '#057642' },
  { value: 'student', label: 'Student',        description: 'Learn, submit assignments, chat with AI', color: '#0056D2' },
];

const features = [
  { icon: Brain,      text: 'AI-Powered Learning'  },
  { icon: TrendingUp, text: 'Real-time Analytics'  },
  { icon: Sparkles,   text: 'Smart Feedback'        },
];

export default function Register() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student' as UserRole, institutionCode: '', institutionName: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp({
      email: form.email, password: form.password, name: form.name,
      role: form.role, institutionCode: form.institutionCode, institutionName: form.institutionName,
    });
    if (error) { setLoading(false); toast.error(error); return; }
    const { error: signInError } = await signIn(form.email, form.password);
    setLoading(false);
    if (signInError) { toast.success('Account created! Please sign in.'); navigate('/login'); }
    else { toast.success('Welcome! Account created successfully.'); navigate('/dashboard'); }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img src={BG} alt="Education" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, rgba(0,56,120,0.90) 0%, rgba(0,86,210,0.85) 60%, rgba(99,102,241,0.80) 100%)'
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">AI-Mentor</span>
          </div>
          <div>
            <h2 className="font-bold text-4xl text-white leading-tight tracking-tight mb-4">
              Start your learning<br />journey today
            </h2>
            <p className="text-blue-200 text-base mb-10 leading-relaxed">
              Join thousands of students and educators already using AI-Mentor.
            </p>
            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15">
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium text-sm">{text}</span>
                  <Check className="w-4 h-4 text-blue-300 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--grad-primary)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--ink)' }}>AI-Mentor</span>
          </div>

          <h1 className="font-bold text-3xl mb-1" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Create account
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--ink-3)' }}>Step {step} of 2</p>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(n => (
              <div key={n} className="h-1.5 rounded-full flex-1 transition-all"
                style={{ background: step >= n ? 'var(--blue)' : 'var(--ink-5)' }} />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <h2 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>
                Personal Information
              </h2>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Full Name</label>
                <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="Your full name" className="form-input" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Email</label>
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="you@institution.com" className="form-input" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Password</label>
                <input type="password" required value={form.password} onChange={e => update('password', e.target.value)}
                  placeholder="Min. 6 characters" className="form-input" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Confirm Password</label>
                <input type="password" required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                  placeholder="Repeat password" className="form-input" />
              </div>
              <button type="submit" className="btn-gradient w-full py-3 justify-center text-sm font-bold mt-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>
                Role & Institution
              </h2>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink-2)' }}>I am a...</label>
                <div className="space-y-2">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                      className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: form.role === r.value ? r.color : 'var(--ink-5)',
                        background: form.role === r.value ? `${r.color}08` : 'white',
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

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="btn-ghost flex-1 py-3 justify-center text-sm">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-gradient flex-1 py-3 justify-center text-sm font-bold">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'var(--ink-4)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline transition" style={{ color: 'var(--blue)' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
