import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, PrivacyBadge } from "@/components/foundora/ui-bits";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Foundora account" },
      {
        name: "description",
        content:
          "Sign up for Foundora and start discovering compatible co-founders privately and anonymously.",
      },
      { property: "og:title", content: "Create your Foundora account" },
      {
        property: "og:description",
        content: "Your identity stays private while you explore potential co-founders.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 6;
  const matches = confirm.length > 0 && password === confirm;
  const canSubmit = emailValid && passwordValid && matches && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) return setError("Enter a valid email address.");
    if (!passwordValid) return setError("Password must be at least 6 characters.");
    if (!matches) return setError("Passwords do not match.");
    setError(null);
    setNotice(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      setNotice("Check your email to confirm your account, then log in to create your profile.");
      return;
    }
    // New account: always head to founder profile creation.
    navigate({ to: "/app/profile" });
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
            <h1 className="text-2xl font-semibold">Create your Foundora account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your identity stays private while you explore potential co-founders.
            </p>
            <div className="mt-4">
              <PrivacyBadge label="Anonymous by default" />
            </div>

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
                    placeholder="At least 6 characters"
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
                {password.length > 0 && !passwordValid && (
                  <p className="text-xs text-muted-foreground">Use at least 6 characters.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {confirm.length > 0 && (
                  <p
                    className={`flex items-center gap-1.5 text-xs ${
                      matches ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {matches ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                    {matches ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {notice && (
                <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{notice}</p>
              )}


              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
