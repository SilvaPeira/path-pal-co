import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";

export const Route = createFileRoute("/cadastro-passageiro")({
  head: () => ({
    meta: [
      { title: "Cadastro de Passageiro — ÀgioTec" },
      { name: "description", content: "Crie sua conta de passageiro na ÀgioTec." },
    ],
  }),
  component: CadastroPassageiroPage,
});

function CadastroPassageiroPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    social_name: "",
    cpf: "",
    rg: "",
    phone: "",
    email: "",
    password: "",
  });

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            user_type: 'passageiro'
          }
        }
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from("passengers").insert({
        user_id: authData.user?.id,
        cpf: form.cpf,
        rg: form.rg,
        phone: form.phone,
        email: form.email,
      });

      if (dbError) throw dbError;

      toast.success("Cadastro realizado com sucesso!");
      navigate({ to: "/auth" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AgioHeader />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-2xl p-6 md:p-8 shadow-[var(--shadow-elegant)]">
          <h1 className="text-2xl font-bold mb-6">Cadastro de Passageiro</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Nome Completo *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">CPF *</Label>
                <Input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">E-mail *</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Telefone *</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-bold">Senha *</Label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4 bg-[image:var(--gradient-hero)]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Finalizar Cadastro"}
            </Button>
          </form>
        </Card>
      </main>
      <AgioFooter />
    </div>
  );
}
