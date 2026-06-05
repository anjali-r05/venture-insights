ALTER TABLE public.startup_reports
  ADD COLUMN IF NOT EXISTS executive_summary text,
  ADD COLUMN IF NOT EXISTS verdict jsonb,
  ADD COLUMN IF NOT EXISTS readiness jsonb,
  ADD COLUMN IF NOT EXISTS top_priorities jsonb,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;