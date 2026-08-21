CREATE OR REPLACE FUNCTION public.is_premium_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id AND p.subscription_status = 'premium'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_premium_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_premium_user(uuid) TO authenticated;

CREATE TABLE public.franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  logo_url text,
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  investment_min_mmk bigint NOT NULL DEFAULT 0,
  investment_max_mmk bigint NOT NULL DEFAULT 0,
  available_locations text[] NOT NULL DEFAULT '{}'::text[],
  support_details text[] NOT NULL DEFAULT '{}'::text[],
  contact_information text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.franchises TO authenticated;
GRANT ALL ON public.franchises TO service_role;

ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Premium founders view franchises"
  ON public.franchises FOR SELECT TO authenticated
  USING (is_active AND public.is_premium_user(auth.uid()));

CREATE TRIGGER update_franchises_updated_at
  BEFORE UPDATE ON public.franchises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.franchise_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  location text NOT NULL DEFAULT '',
  budget text NOT NULL DEFAULT '',
  preferred_location text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX franchise_applications_user_idx ON public.franchise_applications (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.franchise_applications TO authenticated;
GRANT ALL ON public.franchise_applications TO service_role;

ALTER TABLE public.franchise_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own franchise applications"
  ON public.franchise_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Premium users create their own franchise applications"
  ON public.franchise_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_premium_user(auth.uid()));

CREATE TRIGGER update_franchise_applications_updated_at
  BEFORE UPDATE ON public.franchise_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.franchises
  (company_name, category, description, investment_min_mmk, investment_max_mmk, available_locations, support_details, contact_information)
VALUES
  ('Sample Coffee Franchise', 'Food & Beverage',
   'A placeholder coffee shop franchise listing used to demonstrate the marketplace structure. Includes a compact store format, standard menu and supplier network.',
   10000000, 25000000, ARRAY['Yangon','Mandalay'],
   ARRAY['Training','Branding','Marketing','Supplier support','Operation guidance'],
   'Sample contact — details provided after your request is reviewed.'),
  ('Sample Mini Mart Franchise', 'Retail',
   'A placeholder convenience-store franchise listing used to demonstrate the marketplace structure. Neighbourhood format with inventory and POS systems included.',
   30000000, 60000000, ARRAY['Yangon','Naypyidaw'],
   ARRAY['Training','Supplier support','Operation guidance'],
   'Sample contact — details provided after your request is reviewed.'),
  ('Sample Learning Centre Franchise', 'Education',
   'A placeholder tutoring-centre franchise listing used to demonstrate the marketplace structure. Curriculum, teacher training and enrolment playbooks included.',
   15000000, 35000000, ARRAY['Yangon','Mandalay','Taunggyi'],
   ARRAY['Training','Branding','Marketing','Operation guidance'],
   'Sample contact — details provided after your request is reviewed.');