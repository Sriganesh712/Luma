import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import { ArrowLeft, BarChart2, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface GradeItem {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: string;
  classId: string;
  className: string;
  totalScore: number | null;
  totalPoints: number;
  submittedAt: string;
  status: string;
}

interface ClassSummary {
  classId: string;
  className: string;
  items: GradeItem[];
  average: number | null;
}

function ScoreBar({ score, max }: { score: number | null; max: number }) {
  const pct = score != null && max > 0 ? Math.round((score / max) * 100) : null;
  const color = pct == null ? '' : pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-section)' }}>
        <div className={`h-full rounded-full transition-all ${color}`}
          style={{ width: pct != null ? `${pct}%` : '0%', background: pct == null ? 'var(--ink-5)' : undefined }} />
      </div>
      <span className="text-xs font-medium shrink-0 w-12 text-right"
        style={{ color: pct == null ? 'var(--ink-4)' : pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>
        {pct != null ? `${pct}%` : '—'}
      </span>
    </div>
  );
}

export default function StudentGrades() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallAvg, setOverallAvg] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.id) loadGrades();
  }, [profile]);

  async function loadGrades() {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id, total_score, submitted_at, status,
        assignment:assignment_id(id, title, type, total_points, class:class_id(id, name))
      `)
      .eq('student_id', profile!.id)
      .order('submitted_at', { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const items: GradeItem[] = (data ?? []).map((s: any) => {
      const a = Array.isArray(s.assignment) ? s.assignment[0] : s.assignment;
      const cls = a ? (Array.isArray(a.class) ? a.class[0] : a.class) : null;
      return {
        submissionId: s.id,
        assignmentId: a?.id ?? '',
        assignmentTitle: a?.title ?? 'Unknown',
        assignmentType: a?.type ?? '',
        classId: cls?.id ?? 'unknown',
        className: cls?.name ?? 'Unknown Class',
        totalScore: s.total_score,
        totalPoints: a?.total_points ?? 0,
        submittedAt: s.submitted_at,
        status: s.status,
      };
    });

    const grouped = items.reduce<Record<string, ClassSummary>>((acc, item) => {
      if (!acc[item.classId]) {
        acc[item.classId] = { classId: item.classId, className: item.className, items: [], average: null };
      }
      acc[item.classId].items.push(item);
      return acc;
    }, {});

    const summaries = Object.values(grouped).map(summary => {
      const graded = summary.items.filter(i => i.totalScore != null && i.totalPoints > 0);
      const avg = graded.length
        ? Math.round(graded.reduce((s, i) => s + (i.totalScore! / i.totalPoints) * 100, 0) / graded.length)
        : null;
      return { ...summary, average: avg };
    });

    const allGraded = items.filter(i => i.totalScore != null && i.totalPoints > 0);
    const overall = allGraded.length
      ? Math.round(allGraded.reduce((s, i) => s + (i.totalScore! / i.totalPoints) * 100, 0) / allGraded.length)
      : null;

    setClassSummaries(summaries);
    setOverallAvg(overall);
    setLoading(false);
  }

  const totalSubmissions = classSummaries.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/student')} className="transition hover:opacity-70" style={{ color: 'var(--ink-3)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>My Grades</h1>
        </div>

        <Breadcrumb items={[{ label: 'Dashboard', to: '/student' }, { label: 'Grades' }]} />

        {/* Overall summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="card-glass p-4">
            <div className="text-xs mb-1" style={{ color: 'var(--ink-4)' }}>Submissions</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{totalSubmissions}</div>
          </div>
          <div className="card-glass p-4">
            <div className="text-xs mb-1" style={{ color: 'var(--ink-4)' }}>Classes</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{classSummaries.length}</div>
          </div>
          <div className="card-glass p-4 col-span-2 sm:col-span-1">
            <div className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--ink-4)' }}>
              <TrendingUp className="w-3 h-3" /> Overall Avg
            </div>
            <div className="text-2xl font-bold" style={{
              color: overallAvg == null ? 'var(--ink-4)' : overallAvg >= 80 ? '#059669' : overallAvg >= 50 ? '#d97706' : '#dc2626'
            }}>
              {overallAvg != null ? `${overallAvg}%` : '—'}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading grades...</div>
        ) : classSummaries.length === 0 ? (
          <div className="py-20 text-center">
            <BarChart2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--ink-5)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>No submitted assignments yet.</p>
            <Link to="/student" className="text-sm font-semibold mt-2 block hover:underline" style={{ color: 'var(--blue)' }}>
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {classSummaries.map(summary => (
              <div key={summary.classId} className="card-glass overflow-hidden">
                {/* Class header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--ink-5)' }}>
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--ink)' }}>{summary.className}</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>
                      {summary.items.length} assignment{summary.items.length !== 1 ? 's' : ''} submitted
                    </p>
                  </div>
                  {summary.average != null && (
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" style={{ color: 'var(--ink-4)' }} />
                      <span className="text-lg font-bold" style={{
                        color: summary.average >= 80 ? '#059669' : summary.average >= 50 ? '#d97706' : '#dc2626'
                      }}>
                        {summary.average}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Assignment rows */}
                <div className="divide-y" style={{ borderColor: 'var(--ink-5)' }}>
                  {summary.items.map(item => (
                    <Link key={item.submissionId} to={`/student/assignments/${item.assignmentId}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/50 transition group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--bg-section)' }}>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{item.assignmentTitle}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs uppercase font-medium" style={{ color: 'var(--ink-4)' }}>{item.assignmentType}</span>
                          <span style={{ color: 'var(--ink-5)' }}>·</span>
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-4)' }}>
                            <Clock className="w-3 h-3" />{new Date(item.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <ScoreBar score={item.totalScore} max={item.totalPoints} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                          {item.totalScore ?? <span className="text-xs font-normal" style={{ color: 'var(--ink-4)' }}>Pending</span>}
                          {item.totalScore != null && <span className="font-normal" style={{ color: 'var(--ink-4)' }}> / {item.totalPoints}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
