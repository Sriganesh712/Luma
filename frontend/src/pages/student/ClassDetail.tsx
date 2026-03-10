import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Breadcrumb from '../../components/Breadcrumb';
import {
  ArrowLeft, FileText, ClipboardList, ExternalLink,
  FileIcon, Play, Clock, CheckCircle, MessageCircle, BookOpen,
} from 'lucide-react';

type Tab = 'materials' | 'assignments';
interface Material   { id: string; title: string; type: string; file_url: string | null; external_url: string | null; }
interface Assignment { id: string; title: string; type: string; deadline: string | null; total_points: number; submitted: boolean; }

const TYPE_ICONS: Record<string, any> = { pdf: FileText, pptx: FileText, docx: FileText, video: Play, link: ExternalLink, other: FileIcon };

export default function StudentClassDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [tab,         setTab]         = useState<Tab>('materials');
  const [className,   setClassName]   = useState('');
  const [subject,     setSubject]     = useState('');
  const [materials,   setMaterials]   = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { if (id) loadData(); }, [id, tab]);

  async function loadData() {
    setLoading(true);
    const { data: cls } = await supabase.from('classes').select('name, subject').eq('id', id!).single();
    if (cls) { setClassName(cls.name); setSubject(cls.subject ?? ''); }
    if (tab === 'materials') {
      const { data } = await supabase.from('study_materials')
        .select('id, title, type, file_url, external_url')
        .eq('class_id', id!).order('created_at', { ascending: false });
      setMaterials(data ?? []);
    } else {
      const [aRes, sRes] = await Promise.all([
        supabase.from('assignments').select('id, title, type, deadline, total_points')
          .eq('class_id', id!).eq('status', 'published').order('deadline', { ascending: true }),
        supabase.from('submissions').select('assignment_id').eq('student_id', profile!.id),
      ]);
      const submittedIds = new Set((sRes.data ?? []).map((s: any) => s.assignment_id));
      setAssignments((aRes.data ?? []).map((a: any) => ({ ...a, submitted: submittedIds.has(a.id) })));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--grad-primary)', minHeight: 140 }}>
        <div className="hero-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <Link to="/student" className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-sm font-medium mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>{className}</h1>
              {subject && <p className="text-blue-200 text-sm mt-1">{subject}</p>}
            </div>
            <Link to={`/student/chat?class=${id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0"
              style={{ background: 'rgba(255,255,255,0.20)', color: 'white', border: '1.5px solid rgba(255,255,255,0.30)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.30)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.20)')}>
              <MessageCircle className="w-4 h-4" />
              Chat with AI
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/student' }, { label: className || 'Class' }]} />

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 w-fit mt-4 mb-6"
          style={{ background: 'var(--bg-section)', border: '1px solid var(--ink-5)' }}>
          {([
            { key: 'materials',   label: 'Materials',   icon: FileText    },
            { key: 'assignments', label: 'Assignments', icon: ClipboardList },
          ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition`}
              style={tab === key
                ? { background: 'white', color: 'var(--blue)', boxShadow: 'var(--shadow-xs)' }
                : { color: 'var(--ink-3)' }
              }>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Materials tab */}
        {tab === 'materials' && (
          <div className="card-glass overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
            ) : materials.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--bg-section)' }}>
                  <BookOpen className="w-6 h-6" style={{ color: 'var(--ink-4)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink-3)' }}>No materials uploaded yet.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--ink-5)' }}>
                {materials.map(m => {
                  const Icon = TYPE_ICONS[m.type] ?? FileIcon;
                  const url = m.file_url ?? m.external_url;
                  return (
                    <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'var(--blue-light)' }}>
                          <Icon className="w-5 h-5" style={{ color: 'var(--blue)' }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{m.title}</div>
                          <div className="text-xs mt-0.5 uppercase font-medium tracking-wide" style={{ color: 'var(--ink-4)' }}>{m.type}</div>
                        </div>
                      </div>
                      {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                          style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-mid)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue-light)')}>
                          Open <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assignments tab */}
        {tab === 'assignments' && (
          <div className="card-glass overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--ink-4)' }}>Loading...</div>
            ) : assignments.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--bg-section)' }}>
                  <ClipboardList className="w-6 h-6" style={{ color: 'var(--ink-4)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink-3)' }}>No assignments yet.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--ink-5)' }}>
                {assignments.map(a => (
                  <Link key={a.id} to={`/student/assignments/${a.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{a.title}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap" style={{ color: 'var(--ink-4)' }}>
                        <span className="uppercase font-medium tracking-wide">{a.type}</span>
                        <span>·</span>
                        <span>{a.total_points} pts</span>
                        {a.deadline && (
                          <><span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(a.deadline).toLocaleDateString()}
                          </span></>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${a.submitted ? 'badge-green' : 'badge-amber'}`}>
                      {a.submitted ? <><CheckCircle className="w-3 h-3" /> Submitted</> : 'Pending'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
