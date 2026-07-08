import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) toast.error(error);
    else {
      toast.success('Password reset email sent!');
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-[380px] p-8 rounded-3xl card-glass">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-r from-violet-500 to-violet-600">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--ink)' }}>Luma</span>
        </div>

        <div className="mb-8">
          <h1 className="font-bold text-2xl mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Forgot password
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
            {sent ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder." : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@institution.com" className="form-input" />
            </div>

            <button type="submit" disabled={loading} className="btn-gradient w-full py-3 justify-center text-sm font-bold">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send reset link <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-secondary w-full py-3 justify-center text-sm">
            Back to login
          </button>
        )}

        {!sent && (
          <div className="text-center mt-6">
            <Link to="/login" className="text-sm font-medium hover:underline" style={{ color: 'var(--ink-4)' }}>
              ← Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
