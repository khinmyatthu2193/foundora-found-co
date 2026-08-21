GRANT EXECUTE ON FUNCTION public.is_premium_user(uuid) TO authenticated;

GRANT SELECT ON public.franchises TO authenticated;
GRANT ALL ON public.franchises TO service_role;

GRANT SELECT, INSERT ON public.franchise_applications TO authenticated;
GRANT ALL ON public.franchise_applications TO service_role;

ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;