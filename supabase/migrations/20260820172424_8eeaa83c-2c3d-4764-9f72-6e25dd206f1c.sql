ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

CREATE OR REPLACE FUNCTION public.profile_strength(p public.profiles)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT round(100.0 * (
      (coalesce(p.avatar_url,'') <> '')::int
    + (coalesce(p.anonymous_name,'') <> '')::int
    + (coalesce(array_length(p.skills,1),0) > 0)::int
    + (coalesce(array_length(p.industry_interests,1),0) > 0)::int
    + (coalesce(p.experience_level,'') <> '')::int
    + (coalesce(p.working_style,'') <> '')::int
    + (coalesce(p.commitment_level,'') <> '')::int
    + (coalesce(array_length(p.desired_partner_traits,1),0) > 0)::int
    + (coalesce(p.bio,'') <> '')::int
    + (coalesce(p.linkedin_url,'') <> '')::int
    + ((coalesce(p.github_url,'') <> '') OR (coalesce(p.portfolio_url,'') <> '') OR (coalesce(p.website_url,'') <> ''))::int
    + EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL)::int
  ) / 12.0)::int;
$$;

REVOKE ALL ON FUNCTION public.profile_strength(public.profiles) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.discover_founders();
CREATE FUNCTION public.discover_founders()
 RETURNS TABLE(discovery_id text, anonymous_name text, avatar_url text, bio text, skills text[], industry_interests text[], available_hours integer, experience_level text, looking_for text, working_style text, commitment_level text, desired_partner_traits text[], has_linkedin boolean, has_github boolean, has_portfolio boolean, email_verified boolean, profile_strength integer, interest_sent boolean, is_matched boolean, is_premium boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    md5(p.id::text || 'foundora-discovery'),
    p.anonymous_name, p.avatar_url, p.bio, p.skills, p.industry_interests, p.available_hours,
    p.experience_level, p.looking_for, p.working_style, p.commitment_level,
    p.desired_partner_traits,
    coalesce(p.linkedin_url, '') <> '',
    coalesce(p.github_url, '') <> '',
    coalesce(p.portfolio_url, '') <> '' OR coalesce(p.website_url, '') <> '',
    EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL),
    public.profile_strength(p),
    EXISTS (SELECT 1 FROM public.interests i WHERE i.sender_id = auth.uid() AND i.receiver_id = p.id),
    EXISTS (SELECT 1 FROM public.matches m WHERE (m.user_a = auth.uid() AND m.user_b = p.id) OR (m.user_b = auth.uid() AND m.user_a = p.id)),
    p.subscription_status = 'premium'
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND coalesce(p.anonymous_name, '') <> ''
    AND array_length(p.skills, 1) > 0
    AND array_length(p.industry_interests, 1) > 0
    AND NOT EXISTS (
      SELECT 1 FROM public.interests d
      WHERE d.sender_id = auth.uid() AND d.receiver_id = p.id AND d.status = 'rejected'
    )
  ORDER BY (p.subscription_status = 'premium') DESC, p.updated_at DESC
  LIMIT 200;
$function$;
REVOKE ALL ON FUNCTION public.discover_founders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.discover_founders() TO authenticated;

DROP FUNCTION IF EXISTS public.my_matches();
CREATE FUNCTION public.my_matches()
 RETURNS TABLE(match_id uuid, created_at timestamp with time zone, anonymous_name text, avatar_url text, skills text[], industry_interests text[], commitment_level text, available_hours integer, has_linkedin boolean, has_github boolean, has_portfolio boolean, email_verified boolean, profile_strength integer, is_premium boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT m.id, m.created_at, p.anonymous_name, p.avatar_url, p.skills, p.industry_interests,
         p.commitment_level, p.available_hours,
         coalesce(p.linkedin_url, '') <> '',
         coalesce(p.github_url, '') <> '',
         coalesce(p.portfolio_url, '') <> '' OR coalesce(p.website_url, '') <> '',
         EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL),
         public.profile_strength(p),
         p.subscription_status = 'premium'
  FROM public.matches m
  JOIN public.profiles p ON p.id = CASE WHEN m.user_a = auth.uid() THEN m.user_b ELSE m.user_a END
  WHERE auth.uid() IS NOT NULL AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
  ORDER BY m.created_at DESC;
$function$;
REVOKE ALL ON FUNCTION public.my_matches() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_matches() TO authenticated;

DROP FUNCTION IF EXISTS public.incoming_interests();
CREATE FUNCTION public.incoming_interests()
 RETURNS TABLE(discovery_id text, anonymous_name text, avatar_url text, skills text[], industry_interests text[], experience_level text, available_hours integer, has_linkedin boolean, has_github boolean, has_portfolio boolean, email_verified boolean, profile_strength integer, status text, created_at timestamp with time zone, interest_sent boolean, is_premium boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    md5(p.id::text || 'foundora-discovery'), p.anonymous_name, p.avatar_url, p.skills,
    p.industry_interests, p.experience_level, p.available_hours,
    coalesce(p.linkedin_url, '') <> '',
    coalesce(p.github_url, '') <> '',
    coalesce(p.portfolio_url, '') <> '' OR coalesce(p.website_url, '') <> '',
    EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL),
    public.profile_strength(p),
    i.status, i.created_at,
    EXISTS (SELECT 1 FROM public.interests o WHERE o.sender_id = auth.uid() AND o.receiver_id = i.sender_id),
    p.subscription_status = 'premium'
  FROM public.interests i
  JOIN public.profiles p ON p.id = i.sender_id
  WHERE auth.uid() IS NOT NULL AND i.receiver_id = auth.uid() AND i.status <> 'rejected'
  ORDER BY i.created_at DESC;
$function$;
REVOKE ALL ON FUNCTION public.incoming_interests() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.incoming_interests() TO authenticated;