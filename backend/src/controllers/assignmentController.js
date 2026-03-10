import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** GET /api/assignments?class_id=... */
export async function listAssignments(req, res) {
  const { class_id } = req.query;
  let query = supabase
    .from('assignments')
    .select('*, questions(count)')
    .order('created_at', { ascending: false });

  if (class_id) query = query.eq('class_id', class_id);
  else query = query.eq('teacher_id', req.profile.id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** GET /api/assignments/:id — full assignment with questions */
export async function getAssignment(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('assignments')
    .select('*, questions(*)')
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** POST /api/assignments — create assignment with questions */
export async function createAssignment(req, res) {
  const { class_id, title, description, type, total_points, deadline, questions, target_type, target_ids } = req.body;
  if (!class_id || !title || !type) {
    return res.status(400).json({ error: 'class_id, title, and type required.' });
  }

  // Create assignment
  const { data: assignment, error: assignErr } = await supabase
    .from('assignments')
    .insert({ class_id, title, description, type, total_points, deadline, teacher_id: req.profile.id })
    .select()
    .single();
  if (assignErr) return res.status(500).json({ error: assignErr.message });

  // Insert questions
  if (questions?.length) {
    const qRows = questions.map((q, i) => ({
      assignment_id: assignment.id,
      question_text: q.question_text,
      type: q.type,
      options: q.options ?? null,
      correct_answer: q.correct_answer ?? null,
      points: q.points ?? 10,
      order_index: i,
    }));
    const { error: qErr } = await supabase.from('questions').insert(qRows);
    if (qErr) return res.status(500).json({ error: qErr.message });
  }

  // Insert targets
  if (target_type && target_ids?.length) {
    const targets = target_ids.map(tid => ({ assignment_id: assignment.id, target_type, target_id: tid }));
    await supabase.from('assignment_targets').insert(targets);
  }

  res.status(201).json(assignment);
}

/** PATCH /api/assignments/:id/publish */
export async function publishAssignment(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('assignments')
    .update({ status: 'published' })
    .eq('id', id)
    .eq('teacher_id', req.profile.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** GET /api/assignments/:id/submissions — teacher views submissions */
export async function listSubmissions(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('submissions')
    .select('*, student:student_id(name, email), answers(*)')
    .eq('assignment_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** POST /api/assignments/:id/submit — student submits answers */
export async function submitAssignment(req, res) {
  const { id: assignment_id } = req.params;
  const { answers } = req.body; // [{question_id, student_answer}]
  const student_id = req.profile.id;

  // Get questions to auto-grade MCQ
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('assignment_id', assignment_id);

  const qMap = Object.fromEntries((questions ?? []).map(q => [q.id, q]));

  let total_score = 0;
  const answerRows = (answers ?? []).map(a => {
    const q = qMap[a.question_id];
    let score = null;
    if (q?.type === 'mcq' && q.correct_answer) {
      score = a.student_answer?.trim().toUpperCase() === q.correct_answer.trim().toUpperCase() ? q.points : 0;
      total_score += score;
    }
    return { submission_id: null, question_id: a.question_id, student_answer: a.student_answer, score };
  });

  // Create submission
  const { data: submission, error: subErr } = await supabase
    .from('submissions')
    .insert({ assignment_id, student_id, total_score })
    .select()
    .single();
  if (subErr) return res.status(500).json({ error: subErr.message });

  // Insert answers
  const rowsWithId = answerRows.map(r => ({ ...r, submission_id: submission.id }));
  await supabase.from('answers').insert(rowsWithId);

  res.status(201).json({ submission_id: submission.id, total_score });
}

/** DELETE /api/assignments/:id */
export async function deleteAssignment(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id)
    .eq('teacher_id', req.profile.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}

/** PATCH /api/assignments/:id/status — close or reopen */
export async function updateAssignmentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!['draft', 'published', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const { data, error } = await supabase
    .from('assignments')
    .update({ status })
    .eq('id', id)
    .eq('teacher_id', req.profile.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}
export async function gradeSubmission(req, res) {
  const { id: submission_id } = req.params;
  const { grades } = req.body; // [{answer_id, score, teacher_feedback}]

  let total = 0;
  for (const g of grades) {
    await supabase.from('answers').update({ score: g.score, teacher_feedback: g.teacher_feedback })
      .eq('id', g.answer_id).eq('submission_id', submission_id);
    total += g.score ?? 0;
  }

  await supabase.from('submissions').update({ total_score: total, status: 'graded' }).eq('id', submission_id);
  res.json({ success: true, total_score: total });
}
