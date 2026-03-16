import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Plus, MessageSquare, Trash2, Send, Paperclip, X, FileText, Loader2, Sparkles, Bot } from "lucide-react";
import { useChat } from "./hooks/useChat";
import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-white border shadow-sm w-fit animate-pulse border-zinc-200"
      style={{}}>
      {[0, 150, 300].map(delay => (
        <div key={delay} className="w-2 h-2 rounded-full animate-bounce bg-violet-600"
          style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const formatted = (message.content || "")
    .replace(/\\\[/g, "$$").replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$").replace(/\\\)/g, "$");

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-xs sm:max-w-md lg:max-w-xl px-4 py-3 rounded-2xl rounded-br-md text-white shadow-md bg-violet-600">
          {message.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}
          {message.file && (
            <div className="mt-2 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl text-xs">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium truncate">{message.file.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm bg-gradient-to-br from-violet-600 to-indigo-600">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 bg-white rounded-2xl rounded-tl-md px-5 py-4 shadow-sm border border-zinc-200">
        <div className="prose prose-sm max-w-none leading-relaxed space-y-2 text-zinc-600">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({children}) => <p style={{ color: '#52525b', margin: '0.25em 0' }}>{children}</p>,
              strong: ({children}) => <strong style={{ color: '#18181b', fontWeight: 700 }}>{children}</strong>,
              code: ({children}) => <code style={{ background: '#f3e8ff', color: '#7c3aed', padding: '0.1em 0.4em', borderRadius: 4, fontSize: '0.85em' }}>{children}</code>,
              pre: ({children}) => <pre style={{ background: '#f2f2f7', border: '1px solid #d4d4d8', borderRadius: 8, padding: '0.75rem 1rem', overflow: 'auto' }}>{children}</pre>,
              a: ({children, href}) => <a href={href} style={{ color: '#7c3aed' }} target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {formatted}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPromptClick }) {
  const suggestions = [
    "Explain Newton's Laws in simple terms",
    "Help me structure a research paper",
    "Explain recursion with a real-world example",
    "How do I improve my study habits?",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-zinc-950">
        Luma
      </h2>
      <p className="text-sm max-w-sm mb-8 leading-relaxed text-zinc-600">
        Ask me anything about your studies — concepts, assignments, research, or just to understand better.
      </p>
      <div className="grid gap-2 w-full max-w-sm">
        {suggestions.map((text, i) => (
          <button key={i} onClick={() => onPromptClick(text)}
            className="px-4 py-3 rounded-xl text-sm text-left transition hover:shadow-sm bg-white border border-zinc-300 text-zinc-600 font-medium hover:border-violet-600"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class") || null;
  const [chatMode, setChatMode] = useState("study");
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const { messages, setMessages, inputValue, setInputValue, isLoading, isTyping, sendMessage, uploadPDF } =
    useChat({ mode: chatMode, classId });

  useEffect(() => { if (profile?.id) loadSessions(); }, [profile?.id]);

  async function loadSessions() {
    setSessionsLoading(true);
    const { data } = await supabase.from("chat_sessions")
      .select("id, title, created_at").eq("student_id", profile.id)
      .order("updated_at", { ascending: false }).limit(30);
    setChatSessions(data ?? []);
    setSessionsLoading(false);
  }

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages]);

  useEffect(() => {
    if (!profile?.id || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === "assistant" && last.content && !isTyping) persistLastExchange();
  }, [isTyping, messages.length]);

  async function persistLastExchange() {
    const userMsg = messages[messages.length - 2];
    const asstMsg = messages[messages.length - 1];
    if (!userMsg || userMsg.role !== "user" || !asstMsg || asstMsg.role !== "assistant") return;
    let sessionId = currentSessionId;
    if (!sessionId) {
      const title = (userMsg.content || "Chat").substring(0, 50);
      const { data: session, error } = await supabase.from("chat_sessions")
        .insert({ student_id: profile.id, class_id: classId || null, title })
        .select("id").single();
      if (error || !session) return;
      sessionId = session.id;
      setCurrentSessionId(sessionId);
      await loadSessions();
    } else {
      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
    }
    await supabase.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: userMsg.content || "" },
      { session_id: sessionId, role: "assistant", content: asstMsg.content || "" },
    ]);
  }

  async function loadSession(sessionId) {
    const { data } = await supabase.from("chat_messages").select("*")
      .eq("session_id", sessionId).order("created_at", { ascending: true });
    setMessages((data ?? []).map((m, i) => ({ id: m.id || String(i), role: m.role, content: m.content, timestamp: new Date(m.created_at) })));
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
  }

  function handleNewChat() { setMessages([]); setCurrentSessionId(null); setSidebarOpen(false); }

  async function deleteSession(e, sessionId) {
    e.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) handleNewChat();
  }

  async function handleFileUpload(file) {
    if (!file) return;
    setFileUploading(true);
    setSelectedFile(file);
    setFileMeta({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB", uploading: true });
    try {
      await uploadPDF(file);
      setFileMeta((prev) => ({ ...prev, uploading: false }));
    } catch {
      setSelectedFile(null);
      setFileMeta(null);
    } finally {
      setFileUploading(false);
    }
  }

  function handleSend() {
    if (!inputValue.trim() && !selectedFile) return;
    if (fileUploading || isLoading) return;
    const text = inputValue.trim();
    const file = selectedFile;
    setInputValue(""); setSelectedFile(null); setFileMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    sendMessage(text, file);
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 glass-surface shrink-0">
        <button onClick={() => setSidebarOpen(o => !o)}
          className="p-1.5 rounded-lg transition lg:hidden hover:bg-gray-100 text-zinc-600">
          <MessageSquare className="w-4 h-4" />
        </button>
          <Link to="/student" className="flex items-center gap-1.5 text-sm font-medium transition hover:underline text-violet-600">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        {/* Mode toggle */}
        <div className="flex items-center gap-0.5 ml-3 rounded-lg p-0.5 border bg-zinc-100 border-zinc-200">
          <button onClick={() => setChatMode("study")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${chatMode === "study" ? "bg-white shadow-sm text-violet-700" : "text-zinc-600"}`}>
            <BookOpen className="w-3.5 h-3.5" /> Study
          </button>
          <button onClick={() => setChatMode("support")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${chatMode === "support" ? "bg-white shadow-sm text-rose-600" : "text-zinc-600"}`}>
            <Heart className="w-3.5 h-3.5" /> Support
          </button>
        </div>
        {chatMode === "support" && (
          <span className="text-rose-500 text-xs hidden sm:block font-medium">Mental health support mode</span>
        )}
        {profile && (
          <span className="ml-auto text-xs font-medium hidden sm:block text-zinc-500">{profile.name}</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white flex flex-col pt-[53px] transform transition-transform lg:relative lg:translate-x-0 lg:pt-0 lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} border-r border-zinc-200 shadow-md`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
            <span className="text-sm font-bold text-zinc-950">Chat History</span>
            <button onClick={handleNewChat} className="btn-gradient flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sessionsLoading ? (
              <div className="py-4 text-center text-xs text-zinc-500">Loading...</div>
            ) : chatSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">No chats yet.</div>
            ) : (
              chatSessions.map(session => (
                <div key={session.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${currentSessionId === session.id ? "border border-violet-600 bg-violet-50" : "hover:bg-zinc-50"}`}
                  onClick={() => loadSession(session.id)}>
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span className="text-xs truncate flex-1 text-zinc-600">
                    {session.title || "Untitled"}
                  </span>
                  <button onClick={e => deleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 transition hover:text-red-600 text-zinc-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Chat Area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 scroll-smooth bg-zinc-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState onPromptClick={text => setInputValue(text)} />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-5 pb-4">
                {messages.map((msg, i) => (
                  <MessageBubble key={msg.id || i} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input Dock ── */}
          <div className="glass-surface p-4 shrink-0">
            <div className="max-w-3xl mx-auto space-y-2">
              {fileMeta && (
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-zinc-200">
                  <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <FileText className="w-4 h-4 text-violet-600" />
                    <span className="truncate max-w-xs">{(fileMeta).name}</span>
                    <span className="text-xs text-zinc-500">({(fileMeta).size})</span>
                    {(fileMeta).uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
                  </div>
                  {!(fileMeta).uploading && (
                    <button onClick={() => { setSelectedFile(null); setFileMeta(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="ml-2 transition hover:text-red-600 text-zinc-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={fileUploading || isLoading}
                  className="p-2 rounded-xl transition disabled:opacity-50 hover:bg-violet-50 text-zinc-600">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input type="file" accept="application/pdf" ref={fileInputRef} hidden
                  onChange={e => handleFileUpload(e.target.files?.[0])} />
                <input
                  type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                  placeholder={chatMode === "support" ? "Talk to Luma for support..." : "Ask Luma anything..."}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition bg-white border-zinc-300 text-zinc-950 focus:border-violet-600"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  disabled={fileUploading}
                />
                <button onClick={handleSend} disabled={isLoading || fileUploading}
                  className="p-2.5 rounded-xl text-white transition disabled:opacity-50 bg-violet-600 hover:bg-violet-700">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



