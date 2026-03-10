import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** GET /api/materials?class_id=... */
export async function listMaterials(req, res) {
  const { class_id } = req.query;
  if (!class_id) return res.status(400).json({ error: 'class_id required' });

  const { data, error } = await supabase
    .from('study_materials')
    .select('*, teacher:teacher_id(name)')
    .eq('class_id', class_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

/** POST /api/materials — create a material record (URL already uploaded by client) */
export async function createMaterial(req, res) {
  const { class_id, title, type, file_url, external_url, description, file_size_bytes } = req.body;
  if (!class_id || !title || !type) {
    return res.status(400).json({ error: 'class_id, title, and type are required.' });
  }
  const { data, error } = await supabase
    .from('study_materials')
    .insert({ class_id, title, type, file_url, external_url, description, file_size_bytes, teacher_id: req.profile.id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

/** DELETE /api/materials/:id */
export async function deleteMaterial(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('study_materials')
    .delete()
    .eq('id', id)
    .eq('teacher_id', req.profile.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}
