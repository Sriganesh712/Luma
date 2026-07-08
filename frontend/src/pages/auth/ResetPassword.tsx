import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) toast.error(error.message);
    else {
      toast.success('Password updated successfully!');
      navigate('/dashboard');
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
            Set new password
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>New password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="form-input" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Confirm new password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" className="form-input" />
          </div>

          <button type="submit" disabled={loading} className="btn-gradient w-full py-3 justify-center text-sm font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <>Update password <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
