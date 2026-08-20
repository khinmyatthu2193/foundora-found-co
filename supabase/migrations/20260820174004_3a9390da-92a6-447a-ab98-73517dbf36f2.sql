CREATE TABLE public.compatibility_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE UNIQUE,
  score integer NOT NULL,
  strengths text[] NOT NULL DEFAULT '{}'::text[],
  challenges text[] NOT NULL DEFAULT '{}'::text[],
  discussion_topics text[] NOT NULL DEFAULT '{}'::text[],
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.compatibility_reports TO authenticated;
GRANT ALL ON public.compatibility_reports TO service_role;

ALTER TABLE public.compatibility_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match members read their report"
ON public.compatibility_reports FOR SELECT TO authenticated
USING (public.is_match_member(match_id, auth.uid()));

CREATE POLICY "Match members create their report"
ON public.compatibility_reports FOR INSERT TO authenticated
WITH CHECK (public.is_match_member(match_id, auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Match members refresh their report"
ON public.compatibility_reports FOR UPDATE TO authenticated
USING (public.is_match_member(match_id, auth.uid()))
WITH CHECK (public.is_match_member(match_id, auth.uid()));

CREATE TRIGGER update_compatibility_reports_updated_at
BEFORE UPDATE ON public.compatibility_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.match_compatibility_inputs(p_match_id uuid)
RETURNS TABLE(
  is_member boolean,
  me_premium boolean,
  a_skills text[], a_industries text[], a_experience text, a_hours integer,
  a_working_style text, a_commitment text, a_traits text[],
  b_skills text[], b_industries text[], b_experience text, b_hours integer,
  b_working_style text, b_commitment text, b_traits text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT true,
    me.subscription_status = 'premium',
    me.skills, me.industry_interests, me.experience_level, me.available_hours,
    me.working_style, me.commitment_level, me.desired_partner_traits,
    other.skills, other.industry_interests, other.experience_level, other.available_hours,
    other.working_style, other.commitment_level, other.desired_partner_traits
  FROM public.matches m
  JOIN public.profiles me ON me.id = auth.uid()
  JOIN public.profiles other ON other.id = CASE WHEN m.user_a = auth.uid() THEN m.user_b ELSE m.user_a END
  WHERE m.id = p_match_id
    AND auth.uid() IS NOT NULL
    AND (m.user_a = auth.uid() OR m.user_b = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.match_compatibility_inputs(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_compatibility_inputs(uuid) TO authenticated;