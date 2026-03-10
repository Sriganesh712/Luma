import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/** Redirects to the correct role-based dashboard after login */
export default function DashboardRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  const routes: Record<string, string> = { admin: '/admin', teacher: '/teacher', student: '/student' };
  return <Navigate to={routes[profile.role]} replace />;
}
