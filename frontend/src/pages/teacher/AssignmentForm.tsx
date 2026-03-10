import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { apiFetch } from '../../lib/api';
import Breadcrumb from '../../components/Breadcrumb';
import { ArrowLeft, Plus, Trash2, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
  question_text: string;
  type: 'mcq' | 'written';
  options: { label: string; text: string }[];
  correct_answer: string;
  points: number;
}

const DEFAULT_QUESTION: Question = {
  question_text: '', type: 'mcq',
  options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }],
  correct_answer: 'A', points: 10,
};

export default function AssignmentForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const classId = params.get('class_id') ?? '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignmentType, setAssignmentType] = useState<'mcq' | 'written' | 'mixed'>('mcq');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ ...DEFAULT_QUESTION }]);
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // AI Generator state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiNumQ, setAiNumQ] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    if (classId) loadStudents();
  }, [classId]);

  async function loadStudents() {
    const { data } = await supabase.from('enrollments')
      .select('student:student_id(id, name)').eq('class_id', classId);
    setStudents((data ?? []).map((e: any) => Array.isArray(e.student) ? e.student[0] : e.student).filter(Boolean));
  }

  function addQuestion() {
    setQuestions(prev => [...prev, { ...DEFAULT_QUESTION, type: assignmentType === 'written' ? 'written' : 'mcq' }]);
  }

  function removeQuestion(i: number) {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateQuestion(i: number, updates: Partial<Question>) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, ...updates } : q));
  }

  function updateOption(qi: number, oi: number, text: string) {
    setQuestions(prev => prev.map((q, idx) => idx === qi
      ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? { ...o, text } : o) }
      : q));
  }

  async function generateWithAI() {
    if (!aiTopic.trim()) return toast.error('Enter a topic for AI to generate questions.');
    setAiGenerating(true);
    try {
      const data = await apiFetch<{ questions: Question[] }>('/api/ai/generate-assignment', {
        method: 'POST',
        body: JSON.stringify({
          classId,
          topic: aiTopic.trim(),
          type: assignmentType,
          numQuestions: aiNumQ,
          difficulty: aiDifficulty,
        }),
      });
      if (!data.questions?.length) return toast.error('AI returned no questions. Try a different topic.');

      const generated: Question[] = data.questions.map((q: any) => ({
        question_text: q.question_text || '',
        type: q.type || (assignmentType === 'mixed' ? 'mcq' : assignmentType),
        options: q.options ?? [
          { label: 'A', text: '' }, { label: 'B', text: '' },
          { label: 'C', text: '' }, { label: 'D', text: '' },
        ],
        correct_answer: q.correct_answer || 'A',
        points: q.points || 10,
      }));

      setQuestions(prev => [...prev.filter(q => q.question_text.trim() !== ''), ...generated]);
      toast.success(`${generated.length} questions generated!`);
      setAiPanelOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent, publish = false) {
    e.preventDefault();
    if (!classId) return toast.error('No class selected.');
    if (!title.trim()) return toast.error('Title required.');
    if (questions.length === 0) return toast.error('Add at least one question.');

    setSaving(true);

    const { data: assignment, error: aErr } = await supabase.from('assignments').insert({
      class_id: classId, teacher_id: profile!.id, title: title.trim(),
      description: description.trim() || null, type: assignmentType,
      total_points: questions.reduce((s, q) => s + q.points, 0),
      deadline: deadline || null,
      status: publish ? 'published' : 'draft',
    }).select().single();

    if (aErr) { toast.error(aErr.message); setSaving(false); return; }

    const qRows = questions.map((q, i) => ({
      assignment_id: assignment.id, question_text: q.question_text, type: q.type,
      options: q.type === 'mcq' ? q.options : null,
      correct_answer: q.type === 'mcq' ? q.correct_answer : null,
      points: q.points, order_index: i,
    }));
    await supabase.from('questions').insert(qRows);

    // Insert targets
    const tIds = targetType === 'class' ? [classId] : targetIds;
    if (tIds.length) {
      await supabase.from('assignment_targets').insert(
        tIds.map(tid => ({ assignment_id: assignment.id, target_type: targetType, target_id: tid }))
      );
    }

    setSaving(false);
    toast.success(publish ? 'Assignment published!' : 'Assignment saved as draft!');
    navigate(`/teacher/assignments/${assignment.id}`);
  }

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={classId ? `/teacher/classes/${classId}` : '/teacher'} className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-white text-xl font-bold">New Assignment</h1>
          <span className="ml-auto text-slate-400 text-sm">{totalPoints} pts total</span>
        </div>
        <Breadcrumb items={[
          { label: 'Dashboard', to: '/teacher' },
          { label: 'Assignments', to: '/teacher/assignments' },
          { label: 'New Assignment' },
        ]} />

        <form onSubmit={e => handleSubmit(e, false)} className="space-y-6">
          {/* Basic info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Chapter 5 Quiz"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Instructions or overview..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
                <select value={assignmentType} onChange={e => setAssignmentType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition">
                  <option value="mcq">MCQ</option>
                  <option value="written">Written</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Deadline</label>
                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition" />
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3">Assign To</h3>
            <div className="flex gap-2 mb-3">
              {(['class', 'student'] as const).map(t => (
                <button key={t} type="button" onClick={() => setTargetType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${targetType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                  {t === 'class' ? 'Entire Class' : 'Specific Students'}
                </button>
              ))}
            </div>
            {targetType === 'student' && (
              <div className="max-h-40 overflow-y-auto border border-slate-700 rounded-xl divide-y divide-slate-700">
                {students.map(s => (
                  <label key={s.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800/50 cursor-pointer">
                    <input type="checkbox" checked={targetIds.includes(s.id)}
                      onChange={e => setTargetIds(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                      className="rounded border-slate-600 text-indigo-600" />
                    <span className="text-white text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {/* AI Generator Panel */}
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl overflow-hidden">
              <button type="button" onClick={() => setAiPanelOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-white text-sm font-semibold">Generate Questions with AI</span>
                  <span className="text-slate-500 text-xs">— describe a topic and let AI create questions</span>
                </div>
                {aiPanelOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {aiPanelOpen && (
                <div className="px-5 pb-5 border-t border-slate-800 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic / Prompt *</label>
                    <input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                      placeholder="e.g. Newton's Laws of Motion, Chapter 5 photosynthesis..."
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Questions</label>
                      <input type="number" min={1} max={15} value={aiNumQ} onChange={e => setAiNumQ(+e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Difficulty</label>
                      <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={generateWithAI} disabled={aiGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                    {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
                  </button>
                </div>
              )}
            </div>
            {questions.map((q, qi) => (
              <div key={qi} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm font-medium">Question {qi + 1}</span>
                  <div className="flex items-center gap-3">
                    {assignmentType === 'mixed' && (
                      <select value={q.type} onChange={e => updateQuestion(qi, { type: e.target.value as any })}
                        className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none">
                        <option value="mcq">MCQ</option><option value="written">Written</option>
                      </select>
                    )}
                    <input type="number" value={q.points} onChange={e => updateQuestion(qi, { points: +e.target.value })}
                      min={1} className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none text-center" />
                    <span className="text-slate-500 text-xs">pts</span>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} className="text-slate-500 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea value={q.question_text} onChange={e => updateQuestion(qi, { question_text: e.target.value })}
                  rows={2} placeholder="Enter question text..." required
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none mb-3" />

                {q.type === 'mcq' && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={opt.label} className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuestion(qi, { correct_answer: opt.label })}
                          className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center shrink-0 transition ${q.correct_answer === opt.label ? 'border-green-500 bg-green-500 text-white' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                          {opt.label}
                        </button>
                        <input value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${opt.label}`}
                          className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition" />
                      </div>
                    ))}
                    <p className="text-slate-500 text-xs mt-1">Click a letter to mark it as the correct answer.</p>
                  </div>
                )}
              </div>
            ))}

            <button type="button" onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-2xl text-slate-400 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save as Draft'}
            </button>
            <button type="button" onClick={e => handleSubmit(e as any, true)} disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
