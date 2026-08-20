REVOKE ALL ON FUNCTION public.create_match_on_mutual_interest() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_match_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.discover_founders() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.incoming_interests() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_matches() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.match_header(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.send_interest(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.discover_founders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.incoming_interests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_matches() TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_header(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_interest(text) TO authenticated;