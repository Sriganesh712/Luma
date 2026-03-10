import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { apiFetch } from '../../lib/api';
import Breadcrumb from '../../components/Breadcrumb';
import { ArrowLeft, CheckCircle, Clock, Users, ChevronDown, ChevronUp, Sparkles, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Assignment {
  id: string; title: string; type: string; status: string;
  deadline: string | null; total_points: number; description: string | null;
  class_id: string;
}
interface Submission {
  id: string; submitted_at: string; total_score: number | null; status: string;
  student: { name: string; email: string } | null;
  answers: { id: string; question_id: string; student_answer: string; score: number | null; teacher_feedback: string | null; ai_feedback: string | null }[];
}
interface Question { id: string; question_text: string; type: string; correct_answer: string | null; points: number; options: any; }

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [closingStatus, setClosingStatus] = useState(false);

  useEffect(() => { if (id) loadData(); }, [id]);

  async function loadData() {
    const [aRes, sRes, qRes] = await Promise.all([
      supabase.from('assignments').select('*').eq('id', id!).single(),
      supabase.from('submissions').select('*, student:student_id(name, email), answers(*)').eq('assignment_id', id!),
      supabase.from('questions').select('*').eq('assignment_id', id!).order('order_index'),
    ]);
    setAssignment(aRes.data);
    setSubmissions(sRes.data ?? []);
    setQuestions(qRes.data ?? []);
    setLoading(false);
  }

  async function publish() {
    setPublishing(true);
    const { error } = await supabase.from('assignments').update({ status: 'published' }).eq('id', id!);
    setPublishing(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Assignment published!');
    setAssignment(prev => prev ? { ...prev, status: 'published' } : prev);
  }

  async function updateScore(submissionId: string, answerId: string, score: number) {
    await supabase.from('answers').update({ score }).eq('id', answerId);

    // Update local state first
    const updatedSubs = submissions.map(s => s.id === submissionId
      ? { ...s, answers: s.answers.map(a => a.id === answerId ? { ...a, score } : a) }
      : s);
    setSubmissions(updatedSubs);

    // Recalculate total_score for this submission
    const sub = updatedSubs.find(s => s.id === submissionId);
    if (sub) {
      const newTotal = sub.answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
      await supabase.from('submissions').update({ total_score: newTotal, status: 'graded' }).eq('id', submissionId);
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, total_score: newTotal } : s));
    }
  }

  async function deleteAssignment() {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/assignments/${id}`, { method: 'DELETE' });
      toast.success('Assignment deleted.');
      navigate('/teacher/assignments');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus() {
    const newStatus = assignment!.status === 'published' ? 'closed' : 'published';
    setClosingStatus(true);
    try {
      await apiFetch(`/api/assignments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setAssignment(prev => prev ? { ...prev, status: newStatus } : prev);
      toast.success(newStatus === 'closed' ? 'Assignment closed.' : 'Assignment reopened!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setClosingStatus(false);
    }
  }

  async function aiEvaluate(submissionId: string) {
    setEvaluating(submissionId);
    try {
      const result = await apiFetch<{ results: { answerId: string; score: number; feedback: string }[]; total_score: number }>(
        `/api/ai/evaluate-submission/${submissionId}`, { method: 'POST' }
      );
      if (!result.results?.length) { toast('All answers already graded or no written answers.'); return; }

      // Update local state with AI scores + feedback
      setSubmissions(prev => prev.map(s => {
        if (s.id !== submissionId) return s;
        const updatedAnswers = s.answers.map(a => {
          const r = result.results.find(r => r.answerId === a.id);
          return r ? { ...a, score: r.score, ai_feedback: r.feedback } : a;
        });
        return { ...s, answers: updatedAnswers, total_score: result.total_score };
      }));
      toast.success(`AI evaluated ${result.results.length} answer(s)!`);
    } catch (err: any) {
      toast.error(err.message || 'AI evaluation failed');
    } finally {
      setEvaluating(null);
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  if (!assignment) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">Assignment not found.</div>;

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-700 text-slate-300', published: 'bg-green-500/20 text-green-400', closed: 'bg-red-500/20 text-red-400',
  };
  const qMap = Object.fromEntries(questions.map(q => [q.id, q]));

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to={`/teacher/classes/${assignment.class_id}`} className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <Breadcrumb items={[
              { label: 'Dashboard', to: '/teacher' },
              { label: 'Assignments', to: '/teacher/assignments' },
              { label: assignment.title },
            ]} />
            <h1 className="text-white text-xl font-bold">{assignment.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[assignment.status]}`}>{assignment.status}</span>
              <span className="text-slate-400 text-xs">{assignment.type.toUpperCase()} · {assignment.total_points} pts</span>
              {assignment.deadline && <span className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Due {new Date(assignment.deadline).toLocaleDateString()}</span>}
            </div>
          </div>
          {assignment.status === 'draft' && (
            <button onClick={publish} disabled={publishing}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition">
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {(assignment.status === 'published' || assignment.status === 'closed') && (
            <button onClick={toggleStatus} disabled={closingStatus}
              className={`px-4 py-2 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 ${assignment.status === 'published' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'}`}>
              {closingStatus ? 'Updating...' : assignment.status === 'published' ? 'Close' : 'Reopen'}
            </button>
          )}
          <button onClick={deleteAssignment} disabled={deleting}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {/* Questions preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-white font-semibold">Questions ({questions.length})</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {questions.map((q, i) => (
              <div key={q.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Q{i + 1} · {q.type.toUpperCase()} · {q.points} pts</div>
                    <div className="text-white text-sm">{q.question_text}</div>
                    {q.type === 'mcq' && q.options && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((o: any) => (
                          <div key={o.label} className={`text-xs px-2 py-1 rounded ${o.label === q.correct_answer ? 'bg-green-500/10 text-green-400' : 'text-slate-400'}`}>
                            {o.label}. {o.text} {o.label === q.correct_answer ? '✓' : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <h2 className="text-white font-semibold">Submissions</h2>
            <span className="text-slate-400 text-sm flex items-center gap-1"><Users className="w-4 h-4" />{submissions.length}</span>
            {submissions.some(s => s.answers.some(a => a.score === null)) && (
              <button
                onClick={async () => {
                  const ungraded = submissions.filter(s => s.answers.some(a => a.score === null));
                  toast(`Grading ${ungraded.length} submission(s) with AI...`);
                  for (const sub of ungraded) {
                    await aiEvaluate(sub.id).catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs rounded-lg transition ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5" /> Grade All with AI
              </button>
            )}
          </div>
          {submissions.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No submissions yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {submissions.map(sub => (
                <div key={sub.id}>
                  <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition text-left">
                    <div>
                      <div className="text-white text-sm font-medium">{sub.student?.name}</div>
                      <div className="text-slate-400 text-xs">{sub.student?.email} · {new Date(sub.submitted_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {(assignment.type === 'written' || assignment.type === 'mixed') && sub.answers.some(a => a.score === null) && (
                        <button
                          onClick={e => { e.stopPropagation(); aiEvaluate(sub.id); }}
                          disabled={evaluating === sub.id}
                          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs rounded-lg transition disabled:opacity-50"
                        >
                          {evaluating === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          AI Grade
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white text-sm font-medium">{sub.total_score ?? '—'} / {assignment.total_points}</span>
                      </div>
                      {expanded === sub.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {expanded === sub.id && (
                    <div className="px-6 pb-4 space-y-4 border-t border-slate-800 pt-4">
                      {sub.answers.map(ans => {
                        const q = qMap[ans.question_id];
                        if (!q) return null;
                        return (
                          <div key={ans.id} className="bg-slate-800 rounded-xl p-4">
                            <div className="text-slate-400 text-xs mb-1">Q: {q.question_text}</div>
                            <div className="text-white text-sm mb-2">
                              A: <span className={q.type === 'mcq' && ans.student_answer === q.correct_answer ? 'text-green-400' : q.type === 'mcq' ? 'text-red-400' : ''}>
                                {ans.student_answer || <span className="italic text-slate-500">No answer</span>}
                              </span>
                            </div>
                            {q.type === 'written' && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-slate-400 text-xs">Score:</label>
                                  <input type="number" defaultValue={ans.score ?? ''} min={0} max={q.points}
                                    onBlur={e => updateScore(sub.id, ans.id, +e.target.value)}
                                    className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm text-center focus:outline-none" />
                                  <span className="text-slate-400 text-xs">/ {q.points}</span>
                                </div>
                                {ans.ai_feedback && (
                                  <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                    <p className="text-indigo-300 text-xs">{ans.ai_feedback}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
