import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";
import { getBlockInfo, recordFailedAttempt, clearAttempts } from "@/lib/loginRateLimit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — ÀgioTec" },
      { name: "description", content: "Acesse sua conta ÀgioTec ou crie um novo cadastro." },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(128),
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .max(128, "Senha muito longa"),
});

function AuthPage() {
  const navigate = useNavigate();

  // Redireciona se já autenticado
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AgioHeader />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-md p-6 md:p-8 shadow-[var(--shadow-elegant)]">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground font-bold text-xl mb-3">
              À
            </div>
            <h1 className="text-2xl font-bold text-foreground">Bem-vindo à ÀgioTec</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entre na sua conta ou cadastre-se para começar.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar uma conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      <AgioFooter />
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockSec, setBlockSec] = useState(0);

  useEffect(() => {
    if (!email) return;
    const info = getBlockInfo(email);
    setBlockSec(info.blocked ? info.remainingSec : 0);
  }, [email]);

  useEffect(() => {
    if (blockSec <= 0) return;
    const t = setInterval(() => setBlockSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [blockSec]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const block = getBlockInfo(parsed.data.email);
    if (block.blocked) {
      setBlockSec(block.remainingSec);
      toast.error(
        `Muitas tentativas. Tente novamente em ${Math.ceil(block.remainingSec / 60)} min.`,
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        toast.error("Cadastro não validado. Verifique seu e-mail e confirme o registro.");
        return;
      }
      recordFailedAttempt(parsed.data.email);
      const info = getBlockInfo(parsed.data.email);
      if (info.blocked) {
        setBlockSec(info.remainingSec);
        toast.error(
          `Muitas tentativas. Acesso bloqueado por ${Math.ceil(info.remainingSec / 60)} min.`,
        );
      } else {
        toast.error("Usuário ou senha inválidos");
      }
      return;
    }

    clearAttempts(parsed.data.email);
    toast.success("Login realizado com sucesso!");
    navigate({ to: "/", replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-right">
          <Link
            to="/esqueci-senha"
            className="text-xs text-primary hover:underline font-medium"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>

      {blockSec > 0 && (
        <p className="text-sm text-destructive text-center">
          Acesso bloqueado. Aguarde {Math.floor(blockSec / 60)}:
          {String(blockSec % 60).padStart(2, "0")}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-[image:var(--gradient-hero)] font-semibold shadow-[var(--shadow-elegant)] hover:opacity-90"
        disabled={loading || blockSec > 0}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ full_name: fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          display_name: parsed.data.full_name,
        },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        toast.error("Este e-mail já está cadastrado. Tente entrar.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (data.session) {
      toast.success("Cadastro realizado com sucesso!");
      navigate({ to: "/", replace: true });
    } else {
      toast.success("Cadastro criado! Verifique seu e-mail para confirmar.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome completo</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">E-mail</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-[image:var(--gradient-hero)] font-semibold shadow-[var(--shadow-elegant)] hover:opacity-90"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar minha conta"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Ao se cadastrar você concorda com nossos Termos de uso e Política de privacidade.
      </p>
    </form>
  );
}
