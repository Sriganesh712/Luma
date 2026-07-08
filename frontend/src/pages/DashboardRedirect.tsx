import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--blue)' }} />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  switch (profile.role) {
    case 'admin':   return <Navigate to="/admin" replace />;
    case 'teacher': return <Navigate to="/teacher" replace />;
    default:        return <Navigate to="/student" replace />;
  }
}
