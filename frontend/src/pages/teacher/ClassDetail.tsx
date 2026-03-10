import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import {
  ArrowLeft, FileText, ClipboardList, Users, Plus,
  Trash2, ExternalLink, FileIcon, Play,
} from 'lucide-react';

type Tab = 'materials' | 'assignments' | 'students';

interface Material { id: string; title: string; type: string; file_url: string | null; external_url: string | null; created_at: string; }
interface Assignment { id: string; title: string; type: string; status: string; deadline: string | null; }
interface Student { id: string; name: string; email: string; }

const TYPE_ICONS: Record<string, typeof FileIcon> = {
  pdf: FileText, pptx: FileText, docx: FileText, video: Play, link: ExternalLink, other: FileIcon,
};

export default function TeacherClassDetail() {
  const { id } = useParams<{ id: string }>();
  useAuth(); // ensures auth context is available
  const [tab, setTab] = useState<Tab>('materials');
  const [className, setClassName] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadData(); }, [id, tab]);

  async function loadData() {
    setLoading(true);
    const { data: cls } = await supabase.from('classes').select('name').eq('id', id!).single();
    if (cls) setClassName(cls.name);

    if (tab === 'materials') {
      const { data } = await supabase.from('study_materials').select('*').eq('class_id', id!).order('created_at', { ascending: false });
      setMaterials(data ?? []);
    } else if (tab === 'assignments') {
      const { data } = await supabase.from('assignments').select('*').eq('class_id', id!).order('created_at', { ascending: false });
      setAssignments(data ?? []);
    } else if (tab === 'students') {
      const { data } = await supabase.from('enrollments').select('student:student_id(id, name, email)').eq('class_id', id!);
      setStudents((data ?? []).map((e: any) => Array.isArray(e.student) ? e.student[0] : e.student).filter(Boolean));
    }
    setLoading(false);
  }

  async function deleteMaterial(materialId: string) {
    await supabase.from('study_materials').delete().eq('id', materialId);
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-700 text-slate-300',
    published: 'bg-green-500/20 text-green-400',
    closed: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/teacher" className="text-slate-400 hover:text-white transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-white text-xl font-bold">{className}</h1>
        </div>

        <Breadcrumb items={[{ label: 'Dashboard', to: '/teacher' }, { label: className || 'Class' }]} />

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {([
            { key: 'materials', label: 'Materials', icon: FileText },
            { key: 'assignments', label: 'Assignments', icon: ClipboardList },
            { key: 'students', label: 'Students', icon: Users },
          ] as { key: Tab; label: string; icon: typeof FileText }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Materials Tab */}
        {tab === 'materials' && (
          <div>
            <div className="flex justify-end mb-4">
              <Link to={`/teacher/materials/upload?class_id=${id}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition">
                <Plus className="w-4 h-4" /> Upload Material
              </Link>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {loading ? <div className="py-12 text-center text-slate-500">Loading...</div>
                : materials.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No materials yet. <Link to={`/teacher/materials/upload?class_id=${id}`} className="text-indigo-400 hover:text-indigo-300 transition">Upload one →</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {materials.map(m => {
                      const Icon = TYPE_ICONS[m.type] ?? FileIcon;
                      return (
                        <div key={m.id} className="flex items-center justify-between px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                              <Icon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{m.title}</div>
                              <div className="text-slate-400 text-xs uppercase mt-0.5">{m.type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(m.file_url || m.external_url) && (
                              <a href={m.file_url ?? m.external_url ?? '#'} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-indigo-400 transition"><ExternalLink className="w-4 h-4" /></a>
                            )}
                            <button onClick={() => deleteMaterial(m.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {tab === 'assignments' && (
          <div>
            <div className="flex justify-end mb-4">
              <Link to={`/teacher/assignments/new?class_id=${id}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition">
                <Plus className="w-4 h-4" /> New Assignment
              </Link>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {loading ? <div className="py-12 text-center text-slate-500">Loading...</div>
                : assignments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No assignments yet. <Link to={`/teacher/assignments/new?class_id=${id}`} className="text-indigo-400 hover:text-indigo-300 transition">Create one →</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {assignments.map(a => (
                      <Link key={a.id} to={`/teacher/assignments/${a.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition">
                        <div>
                          <div className="text-white text-sm font-medium">{a.title}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{a.type.toUpperCase()}{a.deadline ? ` · Due ${new Date(a.deadline).toLocaleDateString()}` : ''}</div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[a.status]}`}>{a.status}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {tab === 'students' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? <div className="py-12 text-center text-slate-500">Loading...</div>
              : students.length === 0 ? <div className="py-12 text-center text-slate-400 text-sm">No students enrolled.</div>
              : (
                <div className="divide-y divide-slate-800">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">{s.name[0]?.toUpperCase()}</div>
                      <div><div className="text-white text-sm font-medium">{s.name}</div><div className="text-slate-400 text-xs">{s.email}</div></div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
