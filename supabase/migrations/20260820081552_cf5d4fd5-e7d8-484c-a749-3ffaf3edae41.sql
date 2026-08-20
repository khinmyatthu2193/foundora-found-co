REVOKE ALL ON FUNCTION public.discover_founders() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.discover_founders() TO authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;