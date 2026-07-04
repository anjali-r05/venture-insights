CREATE TABLE public.product_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  startup_id uuid REFERENCES public.startups(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  industry text,
  stage text,
  description text,
  target_users text,
  current_features text,
  strategy jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_strategies TO authenticated;
GRANT ALL ON public.product_strategies TO service_role;

ALTER TABLE public.product_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_strategies_all_own ON public.product_strategies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX product_strategies_user_created_idx
  ON public.product_strategies (user_id, created_at DESC);