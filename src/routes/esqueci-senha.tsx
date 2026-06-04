import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — ÀgioTec" },
      { name: "description", content: "Recupere o acesso à sua conta ÀgioTec." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("E-mail de recuperação enviado!");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AgioHeader />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-md p-6 md:p-8 shadow-[var(--shadow-elegant)]">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para login
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Esqueci minha senha</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Informe seu e-mail cadastrado e enviaremos um link para você redefinir a senha.
          </p>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-sm text-foreground">
                Se houver uma conta para <strong>{email}</strong>, você receberá um e-mail com
                instruções para criar uma nova senha.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-mail</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[image:var(--gradient-hero)] font-semibold shadow-[var(--shadow-elegant)] hover:opacity-90"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link de recuperação"}
              </Button>
            </form>
          )}
        </Card>
      </main>
      <AgioFooter />
    </div>
  );
}
