import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import {
  FileText, ClipboardList, Users, Plus,
  Trash2, ExternalLink, FileIcon, Play,
  BookOpen, MessageSquare, Settings,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

type Tab = 'materials' | 'assignments' | 'students';

interface Material { id: string; title: string; type: string; file_url: string | null; external_url: string | null; created_at: string; }
interface Assignment { id: string; title: string; type: string; status: string; deadline: string | null; }
interface Student { id: string; name: string; email: string; }

const TYPE_ICONS: Record<string, typeof FileIcon> = {
  pdf: FileText, pptx: FileText, docx: FileText, video: Play, link: ExternalLink, other: FileIcon,
};

export default function TeacherClassDetail() {
  const { id } = useParams<{ id: string }>();
  useAuth();
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

  const statusBadge: Record<string, string> = {
    draft: 'badge-gray',
    published: 'badge-green',
    closed: 'badge-red',
  };

  const navItems = [
    { icon: BookOpen,      label: 'Overview',      to: '/teacher' },
    { icon: Users,         label: 'My Classes',    to: '/teacher/classes' },
    { icon: FileText,      label: 'Materials',     to: '/teacher/materials' },
    { icon: ClipboardList, label: 'Assignments',   to: '/teacher/assignments' },
    { icon: MessageSquare, label: 'Student Chats', to: '/teacher/chats' },
    { icon: Settings,      label: 'Settings',      to: '/teacher/settings' },
  ];

  return (
    <DashboardLayout navItems={navItems} role="teacher" pageTitle={className || 'Class Detail'}>
      <Breadcrumb items={[{ label: 'Dashboard', to: '/teacher' }, { label: className || 'Class' }]} />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 mb-6 w-fit" style={{ background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
        {([
          { key: 'materials', label: 'Materials', icon: FileText },
          { key: 'assignments', label: 'Assignments', icon: ClipboardList },
          { key: 'students', label: 'Students', icon: Users },
        ] as { key: Tab; label: string; icon: typeof FileText }[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={tab === key
              ? { background: 'var(--bg-card)', color: 'var(--blue)', boxShadow: 'var(--shadow-xs)' }
              : { color: 'var(--ink-3)' }
            }>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Materials Tab */}
      {tab === 'materials' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link to={`/teacher/materials/upload?class_id=${id}`} className="btn-gradient flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Upload Material
            </Link>
          </div>
          <div className="card-glass overflow-hidden">
            {loading ? <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
              : materials.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-3)' }}>
                  No materials yet. <Link to={`/teacher/materials/upload?class_id=${id}`} className="font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Upload one →</Link>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {materials.map(m => {
                    const Icon = TYPE_ICONS[m.type] ?? FileIcon;
                    return (
                      <div key={m.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-section)' }}>
                            <Icon className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{m.title}</div>
                            <div className="text-xs uppercase mt-0.5" style={{ color: 'var(--ink-4)' }}>{m.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(m.file_url || m.external_url) && (
                            <a href={m.file_url ?? m.external_url ?? '#'} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 transition hover:opacity-70" style={{ color: 'var(--blue)' }}><ExternalLink className="w-4 h-4" /></a>
                          )}
                          <button onClick={() => deleteMaterial(m.id)} className="p-1.5 transition hover:text-red-500" style={{ color: 'var(--ink-4)' }}>
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
            <Link to={`/teacher/assignments/new?class_id=${id}`} className="btn-gradient flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Assignment
            </Link>
          </div>
          <div className="card-glass overflow-hidden">
            {loading ? <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
              : assignments.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-3)' }}>
                  No assignments yet. <Link to={`/teacher/assignments/new?class_id=${id}`} className="font-semibold hover:underline" style={{ color: 'var(--blue)' }}>Create one →</Link>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {assignments.map(a => (
                    <Link key={a.id} to={`/teacher/assignments/${a.id}`}
                      className="flex items-center justify-between px-6 py-4 transition hover:bg-violet-50/50 dark:hover:bg-violet-900/10">
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{a.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--ink-4)' }}>{a.type.toUpperCase()}{a.deadline ? ` · Due ${new Date(a.deadline).toLocaleDateString()}` : ''}</div>
                      </div>
                      <span className={`badge ${statusBadge[a.status] ?? 'badge-gray'}`}>{a.status}</span>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {tab === 'students' && (
        <div className="card-glass overflow-hidden">
          {loading ? <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
            : students.length === 0 ? <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-3)' }}>No students enrolled.</div>
            : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {students.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{s.name[0]?.toUpperCase()}</div>
                    <div><div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{s.name}</div><div className="text-xs" style={{ color: 'var(--ink-4)' }}>{s.email}</div></div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </DashboardLayout>
  );
}
