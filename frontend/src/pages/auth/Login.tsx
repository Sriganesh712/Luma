import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Brain, TrendingUp, Sparkles, ArrowRight, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BG = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80';

const stats = [
  { icon: GraduationCap, value: '50K+', label: 'Students' },
  { icon: Users,         value: '1,200+', label: 'Educators' },
  { icon: Brain,         value: '98%',    label: 'Satisfaction' },
];

const features = [
  { icon: Brain,      title: 'AI-Powered Mentoring',  desc: 'Personalized guidance 24/7, adapting to every learner.' },
  { icon: TrendingUp, title: 'Real-time Analytics',   desc: 'Track progress and identify gaps instantly.' },
  { icon: Sparkles,   title: 'Instant Smart Feedback', desc: 'Get AI-generated feedback on assignments.' },
];

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else navigate('/dashboard');
  }

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img src={BG} alt="Students learning together" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,56,120,0.92) 0%, rgba(0,86,210,0.80) 50%, rgba(0,153,204,0.75) 100%)'
        }} />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Luma</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span className="text-blue-100 text-xs font-semibold tracking-wide uppercase">AI-Powered Education Platform</span>
            </div>

            <h2 className="font-bold text-5xl text-white leading-[1.08] tracking-tight mb-5">
              The future of<br />
              <span className="text-blue-200">intelligent</span><br />
              learning
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-10 max-w-md">
              Empowering students and educators with AI-driven insights, instant feedback, and deeply personalized guidance.
            </p>

            <div className="space-y-3 mb-10">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/15">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{title}</div>
                    <div className="text-blue-200 text-xs mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-white font-bold text-2xl leading-none">{value}</div>
                  <div className="text-blue-200 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-6 overflow-y-auto" style={{ background: 'var(--bg-card)' }}>
        <div className="w-full max-w-[380px] my-auto">
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-violet-600">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--ink)' }}>Luma</span>
          </div>

          <div className="mb-6">
            <h1 className="font-bold text-3xl mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              Welcome back
            </h1>
            <p className="text-base" style={{ color: 'var(--ink-3)' }}>
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@institution.com" className="form-input" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: 'var(--blue)' }}>
                  Forgot password?
                </Link>
              </div>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="form-input" />
            </div>

            <button type="submit" disabled={loading} className="btn-gradient w-full py-3 justify-center text-base font-bold">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px" style={{ background: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-medium" style={{ background: 'var(--bg-card)', color: 'var(--ink-4)' }}>OR</span>
            </div>
          </div>

          <button onClick={signInWithGoogle} className="btn-secondary w-full py-3 justify-center text-sm font-bold mb-4">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 mr-2" />
            Sign in with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px" style={{ background: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs" style={{ background: 'var(--bg-card)', color: 'var(--ink-4)' }}>New to Luma?</span>
            </div>
          </div>

          <Link to="/register" className="btn-secondary w-full py-3 justify-center text-sm">
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}