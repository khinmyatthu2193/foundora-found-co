import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/foundora/ui-bits";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Account settings — Foundora" },
      {
        name: "description",
        content: "Manage your Foundora account security, including changing your password.",
      },
      { property: "og:title", content: "Account settings — Foundora" },
      { property: "og:description", content: "Manage your Foundora account security." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Section
      className="pt-8"
      title="Settings"
      description="Manage your account security."
    >
      <div className="max-w-xl">
        <PasswordCard />
      </div>
    </Section>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("no-session");

      // Re-authenticate so a wrong current password is rejected.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (signInError) throw signInError;

      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) throw updateError;

      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated successfully.");
    } catch {
      setError("Unable to update password. Please check your current password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-4" />
          </span>
          <div>
            <h2 className="font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">Change your password</p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={submit}>
          <Field
            id="current-password"
            label="Current password"
            value={current}
            onChange={setCurrent}
            show={show}
          />
          <Field
            id="new-password"
            label="New password"
            value={next}
            onChange={setNext}
            show={show}
          />
          <Field
            id="confirm-password"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            show={show}
          />

          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {show ? "Hide passwords" : "Show passwords"}
          </button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  show,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={id === "current-password" ? "current-password" : "new-password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
