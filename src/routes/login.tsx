import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/foundora/ui-bits";
import { useFoundora } from "@/lib/foundora";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to Foundora" },
      {
        name: "description",
        content: "Log in to Foundora to continue discovering founders, matches and projects.",
      },
      { property: "og:title", content: "Log in to Foundora" },
      {
        property: "og:description",
        content: "Continue your co-founder journey on Foundora.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useFoundora();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 6;
  const canSubmit = emailValid && passwordValid && !loading;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) return setError("Enter a valid email address.");
    if (!passwordValid) return setError("Password must be at least 6 characters.");
    setError(null);
    setLoading(true);
    setTimeout(() => {
      login(email);
      navigate({ to: "/app" });
    }, 700);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <Card className="w-full max-w-md border-border shadow-card">
          <CardContent className="p-6 sm:p-7">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in to continue building with Foundora.
            </p>

            <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onBlur={() => setTouched(true)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={touched && !emailValid}
                />
                {touched && email.length > 0 && !emailValid && (
                  <p className="text-xs text-muted-foreground">Enter a valid email address.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Logging in…" : "Log in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to Foundora?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
