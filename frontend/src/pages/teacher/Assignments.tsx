import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import {
  ArrowLeft, ClipboardList, Plus, Search, Clock, ChevronRight, Filter,
} from 'lucide-react';

interface AssignmentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  deadline: string | null;
  total_points: number;
  submissionCount: number;
  class: { id: string; name: string } | null;
}

type StatusFilter = 'all' | 'draft' | 'published' | 'closed';

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  closed:    'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export default function TeacherAssignments() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) loadAssignments();
  }, [profile]);

  async function loadAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select('id, title, type, status, deadline, total_points, class:class_id(id, name), submissions(count)')
      .eq('teacher_id', profile!.id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    setAssignments(
      (data ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        status: a.status,
        deadline: a.deadline,
        total_points: a.total_points,
        submissionCount: a.submissions?.[0]?.count ?? 0,
        class: Array.isArray(a.class) ? a.class[0] ?? null : a.class,
      }))
    );
    setLoading(false);
  }

  const filtered = assignments.filter(a => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.class?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = assignments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/teacher')} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold flex-1">All Assignments</h1>
          <Link
            to="/teacher/assignments/new"
            className="btn-gradient flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> New Assignment
          </Link>
        </div>

        <Breadcrumb items={[{ label: 'Dashboard', to: '/teacher' }, { label: 'Assignments' }]} />

        {/* Search + filter row */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or class..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-2" />
            {(['all', 'draft', 'published', 'closed'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                {s} {s !== 'all' && counts[s] ? `(${counts[s]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search || statusFilter !== 'all' ? 'No assignments match your filters.' : 'No assignments created yet.'}
            </p>
            <Link to="/teacher/assignments/new" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 block transition">
              Create your first assignment →
            </Link>
          </div>
        ) : (
          <div className="card-glass overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(a => (
                <Link key={a.id} to={`/teacher/assignments/${a.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="text-slate-900 dark:text-white text-sm font-semibold truncate">{a.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{a.class?.name ?? '—'}</span>
                      <span>·</span>
                      <span>{a.type.toUpperCase()}</span>
                      <span>·</span>
                      <span>{a.total_points} pts</span>
                      <span>·</span>
                      <span>{a.submissionCount} submission{a.submissionCount !== 1 ? 's' : ''}</span>
                      {a.deadline && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(a.deadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[a.status] ?? ''}`}>
                      {a.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
