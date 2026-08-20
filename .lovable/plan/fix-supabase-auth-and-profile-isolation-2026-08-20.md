# Fix Supabase auth and profile isolation

## Scope
- Keep the current Foundora UI and theme unchanged.
- Make Supabase Auth and `public.profiles` the only sources of truth for authentication and founder profiles.
- Preserve the existing discovery RPC and its private-field projection.

## Implementation
1. **Authentication correctness**
   - Require `signInWithPassword` to return both a valid user and session before navigating.
   - Keep failed logins on the login page with the Supabase error.
   - Require signup to return a created user; continue immediately only when a session exists, otherwise retain the confirmation-email state.
   - Remove or neutralize remaining mock auth/profile actions so they cannot conflict with Supabase.

2. **Session and cache isolation**
   - Add one root Supabase auth-state listener for identity changes.
   - Cancel and clear protected React Query data when the signed-in user changes or signs out, then invalidate the router/current-user queries.
   - Scope profile query keys by authenticated user ID so Account A data can never satisfy Account B's query.
   - Ensure logout clears protected cache before Supabase sign-out and replaces navigation history.

3. **Profile persistence**
   - Derive profile ownership from the currently validated Supabase user inside profile reads and writes; do not trust a caller-supplied ID.
   - Upsert all required profile fields with `id = auth.uid()`, return the stored row, and surface database/RLS errors clearly.
   - Reset the form when there is no row for the current account and refetch the account-scoped row after save.

4. **RLS and discovery verification**
   - Inspect live grants and policies; migrate only if owner SELECT/INSERT/UPDATE or grants are missing.
   - Confirm discovery returns no real name, email, private idea, or auth UUID.

## Validation
- Run focused checks and the project build.
- Verify random/nonexistent email and wrong password do not authenticate.
- Verify Account A and Account B create distinct rows, refresh correctly, and never display each other's profile data.
- Because this project uses externally managed Supabase auth, use available test accounts/session support; report any authenticated browser path that cannot be executed rather than claiming it passed.
