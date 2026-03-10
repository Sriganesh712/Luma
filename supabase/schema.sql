-- =============================================
-- AI-Mentor LMS — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- ─── INSTITUTIONS ───────────────────────────
create table public.institutions (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  code         text unique not null,  -- 6-char join code for teachers/students
  logo_url     text,
  created_at   timestamptz default now()
);

-- ─── USERS (extends auth.users) ─────────────
create table public.users (
  id             uuid references auth.users(id) on delete cascade primary key,
  institution_id uuid references public.institutions(id) on delete cascade,
  name           text not null,
  email          text not null,
  role           text not null check (role in ('admin', 'teacher', 'student')),
  avatar_url     text,
  created_at     timestamptz default now()
);

-- ─── CLASSES ────────────────────────────────
create table public.classes (
  id             uuid default gen_random_uuid() primary key,
  institution_id uuid references public.institutions(id) on delete cascade not null,
  name           text not null,
  subject        text,
  teacher_id     uuid references public.users(id) on delete set null,
  created_at     timestamptz default now()
);

-- ─── ENROLLMENTS (students ↔ classes) ───────
create table public.enrollments (
  id         uuid default gen_random_uuid() primary key,
  class_id   uuid references public.classes(id) on delete cascade not null,
  student_id uuid references public.users(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  unique(class_id, student_id)
);

-- ─── STUDY MATERIALS ────────────────────────
create table public.study_materials (
  id                uuid default gen_random_uuid() primary key,
  class_id          uuid references public.classes(id) on delete cascade not null,
  teacher_id        uuid references public.users(id) on delete set null,
  title             text not null,
  type              text not null check (type in ('pdf', 'pptx', 'docx', 'video', 'link', 'other')),
  file_url          text,
  external_url      text,
  file_size_bytes   bigint,
  description       text,
  created_at        timestamptz default now()
);

-- ─── ASSIGNMENTS ────────────────────────────
create table public.assignments (
  id           uuid default gen_random_uuid() primary key,
  class_id     uuid references public.classes(id) on delete cascade not null,
  teacher_id   uuid references public.users(id) on delete set null,
  title        text not null,
  description  text,
  type         text not null check (type in ('mcq', 'written', 'mixed')),
  total_points integer default 100,
  deadline     timestamptz,
  status       text default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at   timestamptz default now()
);

-- ─── ASSIGNMENT TARGETS ──────────────────────
-- Specifies who an assignment is published to (whole class OR specific students)
create table public.assignment_targets (
  id            uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  target_type   text not null check (target_type in ('class', 'student')),
  target_id     uuid not null  -- class_id or student_id
);

-- ─── QUESTIONS ──────────────────────────────
create table public.questions (
  id              uuid default gen_random_uuid() primary key,
  assignment_id   uuid references public.assignments(id) on delete cascade not null,
  question_text   text not null,
  type            text not null check (type in ('mcq', 'written')),
  options         jsonb,         -- MCQ: [{"label":"A","text":"..."},...]
  correct_answer  text,          -- MCQ: "A", "B", etc.
  points          integer default 10,
  order_index     integer default 0
);

-- ─── SUBMISSIONS ────────────────────────────
create table public.submissions (
  id            uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id    uuid references public.users(id) on delete cascade not null,
  submitted_at  timestamptz default now(),
  total_score   integer,
  status        text default 'submitted' check (status in ('submitted', 'graded')),
  unique(assignment_id, student_id)
);

-- ─── ANSWERS ────────────────────────────────
create table public.answers (
  id               uuid default gen_random_uuid() primary key,
  submission_id    uuid references public.submissions(id) on delete cascade not null,
  question_id      uuid references public.questions(id) on delete cascade not null,
  student_answer   text,
  score            integer,
  ai_feedback      text,
  teacher_feedback text
);

-- ─── CHAT SESSIONS ──────────────────────────
create table public.chat_sessions (
  id         uuid default gen_random_uuid() primary key,
  student_id uuid references public.users(id) on delete cascade not null,
  class_id   uuid references public.classes(id) on delete set null,
  title      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── CHAT MESSAGES ──────────────────────────
create table public.chat_messages (
  id         uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

alter table public.institutions    enable row level security;
alter table public.users           enable row level security;
alter table public.classes         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.study_materials enable row level security;
alter table public.assignments     enable row level security;
alter table public.assignment_targets enable row level security;
alter table public.questions       enable row level security;
alter table public.submissions     enable row level security;
alter table public.answers         enable row level security;
alter table public.chat_sessions   enable row level security;
alter table public.chat_messages   enable row level security;

-- Helper: get the current user's institution_id
create or replace function public.my_institution_id()
returns uuid language sql stable security definer as $$
  select institution_id from public.users where id = auth.uid();
$$;

-- Helper: get the current user's role
create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;

-- ─── INSTITUTIONS ───────────────────────────
create policy "institution members can view their institution"
  on public.institutions for select
  using (id = public.my_institution_id());

create policy "admins can update their institution"
  on public.institutions for update
  using (id = public.my_institution_id() and public.my_role() = 'admin');

-- ─── USERS ──────────────────────────────────
create policy "users can view members of same institution"
  on public.users for select
  using (institution_id = public.my_institution_id());

create policy "users can update their own profile"
  on public.users for update
  using (id = auth.uid());

create policy "admins can insert users in their institution"
  on public.users for insert
  with check (institution_id = public.my_institution_id() and public.my_role() = 'admin');

create policy "service role can insert any user"
  on public.users for insert
  with check (true);  -- used by backend registration handler

-- ─── CLASSES ────────────────────────────────
create policy "institution members can view classes"
  on public.classes for select
  using (institution_id = public.my_institution_id());

create policy "admins can manage classes"
  on public.classes for all
  using (institution_id = public.my_institution_id() and public.my_role() = 'admin');

-- ─── ENROLLMENTS ────────────────────────────
create policy "students can view their own enrollments"
  on public.enrollments for select
  using (student_id = auth.uid());

create policy "teachers can view enrollments for their classes"
  on public.enrollments for select
  using (
    class_id in (select id from public.classes where teacher_id = auth.uid())
  );

create policy "admins can manage enrollments"
  on public.enrollments for all
  using (
    class_id in (select id from public.classes where institution_id = public.my_institution_id())
    and public.my_role() = 'admin'
  );

-- ─── STUDY MATERIALS ────────────────────────
create policy "class members can view study materials"
  on public.study_materials for select
  using (
    class_id in (
      select class_id from public.enrollments where student_id = auth.uid()
      union
      select id from public.classes where teacher_id = auth.uid()
    )
  );

create policy "teachers can manage their class materials"
  on public.study_materials for all
  using (teacher_id = auth.uid());

-- ─── ASSIGNMENTS ────────────────────────────
create policy "teachers can manage their assignments"
  on public.assignments for all
  using (teacher_id = auth.uid());

create policy "students can view published assignments for their classes"
  on public.assignments for select
  using (
    status = 'published'
    and class_id in (select class_id from public.enrollments where student_id = auth.uid())
  );

-- ─── QUESTIONS ──────────────────────────────
create policy "class members can view questions for published assignments"
  on public.questions for select
  using (
    assignment_id in (
      select id from public.assignments
      where status = 'published'
        and class_id in (select class_id from public.enrollments where student_id = auth.uid())
      union
      select id from public.assignments where teacher_id = auth.uid()
    )
  );

create policy "teachers can manage questions for their assignments"
  on public.questions for all
  using (
    assignment_id in (select id from public.assignments where teacher_id = auth.uid())
  );

-- ─── SUBMISSIONS ────────────────────────────
create policy "students can view and insert their own submissions"
  on public.submissions for all
  using (student_id = auth.uid());

create policy "teachers can view submissions for their assignments"
  on public.submissions for select
  using (
    assignment_id in (select id from public.assignments where teacher_id = auth.uid())
  );

create policy "teachers can update grades"
  on public.submissions for update
  using (
    assignment_id in (select id from public.assignments where teacher_id = auth.uid())
  );

-- ─── ANSWERS ────────────────────────────────
create policy "students can manage their own answers"
  on public.answers for all
  using (
    submission_id in (select id from public.submissions where student_id = auth.uid())
  );

create policy "teachers can view and grade answers"
  on public.answers for all
  using (
    submission_id in (
      select s.id from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      where a.teacher_id = auth.uid()
    )
  );

-- ─── CHAT SESSIONS ──────────────────────────
create policy "students can manage their own chat sessions"
  on public.chat_sessions for all
  using (student_id = auth.uid());

-- ─── CHAT MESSAGES ──────────────────────────
create policy "students can manage messages in their sessions"
  on public.chat_messages for all
  using (
    session_id in (select id from public.chat_sessions where student_id = auth.uid())
  );

-- =============================================
-- INDEXES for performance
-- =============================================

create index on public.users(institution_id);
create index on public.classes(institution_id);
create index on public.classes(teacher_id);
create index on public.enrollments(class_id);
create index on public.enrollments(student_id);
create index on public.study_materials(class_id);
create index on public.assignments(class_id);
create index on public.assignments(teacher_id);
create index on public.submissions(assignment_id);
create index on public.submissions(student_id);
create index on public.chat_sessions(student_id);
create index on public.chat_messages(session_id);


-- =============================================
-- STORAGE BUCKET
-- =============================================

-- Create the study-materials storage bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'study-materials',
  'study-materials',
  true,
  52428800, -- 50MB limit
  array['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'video/webm', 'application/octet-stream']
)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "teachers can upload study materials"
  on storage.objects for insert
  with check (
    bucket_id = 'study-materials'
    and auth.role() = 'authenticated'
  );

create policy "anyone can view study materials"
  on storage.objects for select
  using (bucket_id = 'study-materials');

create policy "teachers can delete their own materials"
  on storage.objects for delete
  using (
    bucket_id = 'study-materials'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
