-- =============================================
-- Luma LMS — Seed Data
-- Run after schema.sql to populate demo data
-- =============================================

-- Note: In production, users are created through auth.users
-- This seed file is for local development with Supabase CLI

-- Seed institutions
INSERT INTO public.institutions (id, name, code)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo University',
  'DEMO01'
) ON CONFLICT (id) DO NOTHING;
