import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";

export const Route = createFileRoute("/cadastro-empresa")({
  head: () => ({
    meta: [
      { title: "Cadastro de Empresa — ÀgioTec" },
      { name: "description", content: "Crie sua conta de empresa na ÀgioTec." },
    ],
  }),
  component: CadastroEmpresaPage,
});

const companySchema = z.object({
  razao_social: z.string().min(2, "Razão Social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cep: z.string().min(8, "CEP inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

function CadastroEmpresaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    razao_social: "",
    cnpj: "",
    inscricao_estadual: "",
    inscricao_municipal: "",
    phone: "",
    email: "",
    cep: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    opening_time: "",
    closing_time: "",
    login: "",
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
            full_name: form.razao_social,
            user_type: 'empresa'
          }
        }
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from("companies").insert({
        user_id: authData.user?.id,
        razao_social: form.razao_social,
        cnpj: form.cnpj,
        inscricao_estadual: form.inscricao_estadual,
        inscricao_municipal: form.inscricao_municipal,
        phone: form.phone,
        email: form.email,
        cep: form.cep,
        city: form.city,
        neighborhood: form.neighborhood,
        street: form.street,
        number: form.number,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
      });

      if (dbError) throw dbError;

      toast.success("Cadastro realizado! Verifique seu WhatsApp para o código.");
      // Aqui entraria a lógica de OTP via WhatsApp descrita no documento
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
          <h1 className="text-2xl font-bold mb-6">Cadastro de Empresa</h1>
          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Razão Social *</Label>
              <Input value={form.razao_social} onChange={e => setForm({...form, razao_social: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">CNPJ *</Label>
              <Input value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">E-mail *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Telefone *</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">CEP *</Label>
              <Input value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Senha *</Label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <Button type="submit" className="md:col-span-2 mt-4 bg-[image:var(--gradient-hero)]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Cadastrar"}
            </Button>
          </form>
        </Card>
      </main>
      <AgioFooter />
    </div>
  );
}
