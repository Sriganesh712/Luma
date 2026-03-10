import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** GET /api/admin/stats — institution-wide stats */
export async function getStats(req, res) {
  const instId = req.profile.institution_id;
  try {
    const [teachers, students, classes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('institution_id', instId).eq('role', 'teacher'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('institution_id', instId).eq('role', 'student'),
      supabase.from('classes').select('id', { count: 'exact', head: true }).eq('institution_id', instId),
    ]);
    res.json({ teachers: teachers.count, students: students.count, classes: classes.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** GET /api/admin/users — list all users in institution */
export async function listUsers(req, res) {
  const instId = req.profile.institution_id;
  const { role } = req.query;
  let query = supabase.from('users').select('id, name, email, role, created_at').eq('institution_id', instId);
  if (role) query = query.eq('role', role);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** GET /api/admin/classes — list all classes in institution */
export async function listClasses(req, res) {
  const instId = req.profile.institution_id;
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, subject, teacher:teacher_id(id, name), enrollments(count)')
    .eq('institution_id', instId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** POST /api/admin/classes — create a class */
export async function createClass(req, res) {
  const { name, subject, teacher_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Class name is required.' });
  const { data, error } = await supabase
    .from('classes')
    .insert({ name, subject, teacher_id, institution_id: req.profile.institution_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

/** PATCH /api/admin/classes/:id — update a class */
export async function updateClass(req, res) {
  const { id } = req.params;
  const { name, subject, teacher_id } = req.body;
  const { data, error } = await supabase
    .from('classes')
    .update({ name, subject, teacher_id })
    .eq('id', id)
    .eq('institution_id', req.profile.institution_id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** DELETE /api/admin/classes/:id */
export async function deleteClass(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id)
    .eq('institution_id', req.profile.institution_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}

/** POST /api/admin/classes/:id/enroll — enroll students into a class */
export async function enrollStudents(req, res) {
  const { id: class_id } = req.params;
  const { student_ids } = req.body;
  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ error: 'student_ids array is required.' });
  }
  const rows = student_ids.map(student_id => ({ class_id, student_id }));
  const { data, error } = await supabase.from('enrollments').upsert(rows).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

/** DELETE /api/admin/classes/:id/enroll/:studentId */
export async function unenrollStudent(req, res) {
  const { id: class_id, studentId: student_id } = req.params;
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('class_id', class_id)
    .eq('student_id', student_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}
