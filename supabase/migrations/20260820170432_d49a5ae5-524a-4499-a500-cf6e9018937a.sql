CREATE TABLE public.notification_reads (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  matches_seen_at timestamptz NOT NULL DEFAULT to_timestamp(0),
  chats jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_reads TO authenticated;
GRANT ALL ON public.notification_reads TO service_role;

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own notification state"
  ON public.notification_reads FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create their own notification state"
  ON public.notification_reads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own notification state"
  ON public.notification_reads FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_notification_reads_updated_at
  BEFORE UPDATE ON public.notification_reads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
