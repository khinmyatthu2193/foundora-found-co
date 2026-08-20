CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL,
  real_name TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  what_to_build TEXT,
  industry_interests TEXT[] NOT NULL DEFAULT '{}',
  available_hours INTEGER NOT NULL DEFAULT 20,
  experience_level TEXT,
  looking_for TEXT,
  working_style TEXT,
  commitment_level TEXT,
  desired_partner_traits TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Secure discovery: only approved anonymous fields, other founders, completed profiles.
CREATE OR REPLACE FUNCTION public.discover_founders()
RETURNS TABLE (
  discovery_id TEXT,
  anonymous_name TEXT,
  skills TEXT[],
  industry_interests TEXT[],
  available_hours INTEGER,
  experience_level TEXT,
  looking_for TEXT,
  working_style TEXT,
  commitment_level TEXT,
  desired_partner_traits TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    md5(p.id::text || 'foundora-discovery') AS discovery_id,
    p.anonymous_name,
    p.skills,
    p.industry_interests,
    p.available_hours,
    p.experience_level,
    p.looking_for,
    p.working_style,
    p.commitment_level,
    p.desired_partner_traits
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND coalesce(p.anonymous_name, '') <> ''
    AND array_length(p.skills, 1) > 0
    AND array_length(p.industry_interests, 1) > 0
  ORDER BY p.updated_at DESC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.discover_founders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.discover_founders() TO authenticated;