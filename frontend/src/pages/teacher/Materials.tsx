import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import {
  ArrowLeft, FileText, ExternalLink, Trash2, Plus, Search, FileIcon, Play, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Material {
  id: string;
  title: string;
  type: string;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  class: { id: string; name: string } | null;
}

const TYPE_ICONS: Record<string, any> = {
  pdf: FileText, pptx: FileText, docx: FileText, video: Play, link: ExternalLink, other: FileIcon,
};

export default function TeacherMaterials() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) loadMaterials();
  }, [profile]);

  async function loadMaterials() {
    const { data, error } = await supabase
      .from('study_materials')
      .select('id, title, type, file_url, external_url, created_at, class:class_id(id, name)')
      .eq('teacher_id', profile!.id)
      .order('created_at', { ascending: false });

    if (error) toast.error(error.message);
    setMaterials(
      (data ?? []).map((m: any) => ({
        ...m,
        class: Array.isArray(m.class) ? m.class[0] ?? null : m.class,
      }))
    );
    setLoading(false);
  }

  async function deleteMaterial(id: string) {
    setDeleting(id);
    const { error } = await supabase.from('study_materials').delete().eq('id', id);
    setDeleting(null);
    if (error) { toast.error(error.message); return; }
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success('Material deleted.');
  }

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.class?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Group by class
  const grouped = filtered.reduce<Record<string, { className: string; items: Material[] }>>((acc, m) => {
    const key = m.class?.id ?? 'unassigned';
    const label = m.class?.name ?? 'Unassigned';
    if (!acc[key]) acc[key] = { className: label, items: [] };
    acc[key].items.push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/teacher')} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold flex-1">All Materials</h1>
          <Link
            to="/teacher/materials/upload"
            className="btn-gradient flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </Link>
        </div>

        <Breadcrumb items={[{ label: 'Dashboard', to: '/teacher' }, { label: 'Materials' }]} />

        {/* Upload banner */}
        {filtered.length > 0 && (
          <div className="card-glass p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-slate-900 dark:text-white font-semibold text-sm">Share learning materials</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Upload PDFs, slides, videos, and links for your students.</p>
            </div>
            <Link to="/teacher/materials/upload" className="btn-gradient flex items-center gap-2 text-sm shrink-0">
              <Plus className="w-4 h-4" /> Upload
            </Link>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search materials or class..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search ? 'No materials match your search.' : 'No materials uploaded yet.'}
            </p>
            <Link to="/teacher/materials/upload" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 block transition">
              Upload your first material →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([key, { className, items }]) => (
              <div key={key} className="card-glass overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-slate-900 dark:text-white font-semibold text-sm">{className}</h2>
                  <span className="text-slate-400 dark:text-slate-500 text-xs">{items.length} file{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map(m => {
                    const Icon = TYPE_ICONS[m.type] ?? FileIcon;
                    const url = m.file_url ?? m.external_url;
                    return (
                      <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 transition">
                          <Icon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-900 dark:text-white text-sm font-medium truncate">{m.title}</div>
                          <div className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 uppercase">{m.type} · {new Date(m.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {url && (
                            <a href={url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs rounded-lg transition">
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteMaterial(m.id)}
                            disabled={deleting === m.id}
                            className="p-1.5 text-slate-400 hover:text-red-400 transition disabled:opacity-50"
                          >
                            {deleting === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
