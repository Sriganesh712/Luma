import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Upload, Link2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MATERIAL_TYPES = ['pdf', 'pptx', 'docx', 'video', 'link', 'other'] as const;
type MaterialType = typeof MATERIAL_TYPES[number];

export default function MaterialUpload() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const classId = params.get('class_id') ?? '';

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('pdf');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isLinkType = type === 'video' || type === 'link';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) return toast.error('No class selected.');
    if (!title.trim()) return toast.error('Title is required.');
    if (!isLinkType && !file) return toast.error('Please select a file to upload.');
    if (isLinkType && !externalUrl.trim()) return toast.error('URL is required.');

    setUploading(true);

    let fileUrl: string | null = null;
    let fileSizeBytes: number | null = null;

    if (!isLinkType && file) {
      const ext = file.name.split('.').pop();
      const path = `${profile!.id}/${classId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('study-materials').upload(path, file);
      if (uploadErr) { toast.error(`Upload failed: ${uploadErr.message}`); setUploading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('study-materials').getPublicUrl(path);
      fileUrl = publicUrl;
      fileSizeBytes = file.size;
    }

    const { error } = await supabase.from('study_materials').insert({
      class_id: classId,
      teacher_id: profile!.id,
      title: title.trim(),
      type,
      description: description.trim() || null,
      file_url: fileUrl,
      external_url: isLinkType ? externalUrl.trim() : null,
      file_size_bytes: fileSizeBytes,
    });

    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Material uploaded!');
    navigate(`/teacher/classes/${classId}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={classId ? `/teacher/classes/${classId}` : '/teacher'} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold">Upload Material</h1>
        </div>

        <div className="card-glass p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Chapter 3 - Photosynthesis"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {MATERIAL_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`py-2 text-sm font-medium rounded-xl border transition uppercase ${type === t ? 'border-indigo-500 bg-indigo-600/10 text-indigo-400' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional description..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none" />
            </div>

            {isLinkType ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Link2 className="w-4 h-4" /> URL *</label>
                <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} type="url" placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Upload className="w-4 h-4" /> File *</label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-4 py-10 cursor-pointer transition ${file ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-600/5' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-600/5'}`}>
                  <input type="file" className="hidden" accept={type === 'pdf' ? '.pdf' : type === 'pptx' ? '.pptx,.ppt' : type === 'docx' ? '.docx,.doc' : '*'}
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file ? (
                    <><div className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{file.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</div></>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Click to browse or drag &amp; drop</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs mt-1 uppercase">{type} files accepted</div>
                    </>
                  )}
                </label>
              </div>
            )}

            <button type="submit" disabled={uploading}
              className="btn-gradient w-full py-2.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Material</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
