/**
 * Maps raw Supabase auth errors to friendly, non-technical copy.
 * Never surface raw provider errors to users.
 */
export function friendlyAuthError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message ?? "")
        : "";
  const msg = raw.toLowerCase();

  if (!msg) return fallback;

  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "Email or password is incorrect. Please check and try again.";
  }
  if (
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("user already exists")
  ) {
    return "This email already has an account. Please log in.";
  }
  if (msg.includes("email not confirmed") || msg.includes("confirm your email") || msg.includes("not confirmed")) {
    return "Please verify your email before logging in.";
  }
  if (msg.includes("too many") || msg.includes("rate limit") || msg.includes("try again in")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("password")) {
    return "Password must meet the minimum requirement.";
  }
  if (msg.includes("email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (msg.includes("session")) {
    return "Your session expired. Please log in again.";
  }
  return fallback;
}
