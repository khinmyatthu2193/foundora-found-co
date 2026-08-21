-- de-duplicate any existing clashing names before enforcing uniqueness
WITH d AS (
  SELECT id, anonymous_name,
         row_number() OVER (PARTITION BY lower(anonymous_name) ORDER BY created_at) AS rn
  FROM public.profiles
)
UPDATE public.profiles p
SET anonymous_name = p.anonymous_name || substr(md5(random()::text), 1, 4)
FROM d
WHERE d.id = p.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_anonymous_name_lower_key
  ON public.profiles (lower(anonymous_name));

CREATE OR REPLACE FUNCTION public.anonymous_name_available(p_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
     AND length(btrim(p_name)) >= 3
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles p
       WHERE lower(p.anonymous_name) = lower(btrim(p_name))
         AND p.id <> auth.uid()
     );
$$;

REVOKE ALL ON FUNCTION public.anonymous_name_available(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anonymous_name_available(text) TO authenticated;