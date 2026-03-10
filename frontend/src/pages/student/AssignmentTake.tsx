import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
  id: string; question_text: string; type: 'mcq' | 'written';
  options: { label: string; text: string }[] | null;
  correct_answer: string | null;
  points: number; order_index: number;
}
interface Assignment {
  id: string; title: string; type: string; description: string | null;
  deadline: string | null; total_points: number; status: string;
}

export default function AssignmentTake() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadData(); }, [id]);

  async function loadData() {
    const [aRes, qRes, subRes] = await Promise.all([
      supabase.from('assignments').select('*').eq('id', id!).single(),
      supabase.from('questions').select('*').eq('assignment_id', id!).order('order_index'),
      supabase.from('submissions').select('id, total_score').eq('assignment_id', id!).eq('student_id', profile!.id).single(),
    ]);
    setAssignment(aRes.data);
    setQuestions(qRes.data ?? []);
    if (subRes.data) {
      setSubmitted(true);
      setScore(subRes.data.total_score);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const unanswered = questions.filter(q => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast.error(`Please answer all ${unanswered.length} remaining question(s).`);
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.from('submissions').insert({
      assignment_id: id!, student_id: profile!.id,
    }).select().single();

    if (error) { toast.error(error.message); setSubmitting(false); return; }

    const answerRows = questions.map(q => {
      const studentAns = answers[q.id] ?? '';
      const qScore = q.type === 'mcq' && q.correct_answer
        ? (studentAns.toUpperCase() === q.correct_answer.toUpperCase() ? q.points : 0)
        : null;
      return { submission_id: data.id, question_id: q.id, student_answer: studentAns, score: qScore };
    });
    await supabase.from('answers').insert(answerRows);

    const { data: sub } = await supabase.from('submissions').select('total_score').eq('id', data.id).single();
    setScore(sub?.total_score ?? 0);
    setSubmitted(true);
    setSubmitting(false);
    toast.success('Assignment submitted!');
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
  if (!assignment) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-red-400">
      Assignment not found.
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">Submitted!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2">{assignment.title}</p>
          {score !== null && (
            <div className="text-4xl font-bold text-indigo-400 mt-4 mb-1">{score}</div>
          )}
          <div className="text-slate-400 dark:text-slate-500 text-sm mb-6">out of {assignment.total_points} points</div>
          <Link to="/student" className="btn-gradient px-6 py-2.5 font-medium rounded-xl transition inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => answers[q.id]?.trim()).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/student" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-slate-900 dark:text-white text-xl font-bold">{assignment.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{assignment.type.toUpperCase()}</span>
              <span>· {assignment.total_points} pts</span>
              {assignment.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due {new Date(assignment.deadline).toLocaleString()}</span>}
            </div>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">{answeredCount} / {questions.length}</div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>{answeredCount} of {questions.length} answered</span>
            <span>{questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : '0%' }} />
          </div>
        </div>

        {assignment.description && (
          <div className="card-glass p-4 mb-6 text-slate-700 dark:text-slate-300 text-sm">
            {assignment.description}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="card-glass p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Question {i + 1} · {q.points} pts</div>
                  <div className="text-slate-900 dark:text-white text-sm font-medium">{q.question_text}</div>
                </div>
                {answers[q.id] && <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-1" />}
              </div>

              {q.type === 'mcq' && q.options ? (
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt.label}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${answers[q.id] === opt.label ? 'border-indigo-500 bg-indigo-600/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                      <input type="radio" name={q.id} value={opt.label} checked={answers[q.id] === opt.label}
                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))} className="sr-only" />
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition ${answers[q.id] === opt.label ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>
                        {opt.label}
                      </div>
                      <span className="text-slate-900 dark:text-white text-sm">{opt.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea value={answers[q.id] ?? ''} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  rows={4} placeholder="Write your answer here..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none text-sm" />
              )}
            </div>
          ))}

          <button type="submit" disabled={submitting}
            className="btn-gradient w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : `Submit Assignment (${answeredCount}/${questions.length} answered)`}
          </button>
        </form>
      </div>
    </div>
  );
}
