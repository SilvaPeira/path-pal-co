import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";
import {
  generateOTP,
  isValidCEP,
  isValidCPF,
  isValidPhoneBR,
  maskCEP,
  maskCPF,
  maskPhone,
  onlyDigits,
} from "@/lib/validators";

export const Route = createFileRoute("/cadastro-motorista")({
  head: () => ({
    meta: [
      { title: "Cadastro de Motorista — ÀgioTec" },
      { name: "description", content: "Crie sua conta de motorista na ÀgioTec." },
    ],
  }),
  component: CadastroMotoristaPage,
});

type FormState = {
  // Etapa 1 — pessoais
  full_name: string;
  social_name: string;
  cpf: string;
  rg: string;
  phone: string;
  email: string;
  // Etapa 2 — endereço residencial
  res_cep: string;
  res_city: string;
  res_neighborhood: string;
  res_street: string;
  res_number: string;
  res_complement: string;
  res_lat: string;
  res_lng: string;
  // Carona fixa
  carona_fixa: boolean;
  work_cep: string;
  work_city: string;
  work_neighborhood: string;
  work_street: string;
  work_number: string;
  work_complement: string;
  work_lat: string;
  work_lng: string;
  work_departure_time: string;
  work_return_time: string;
  // Etapa 3 — foto + acesso
  avatar_file: File | null;
  login: string;
  password: string;
  password_confirm: string;
};

const initialState: FormState = {
  full_name: "",
  social_name: "",
  cpf: "",
  rg: "",
  phone: "",
  email: "",
  res_cep: "",
  res_city: "",
  res_neighborhood: "",
  res_street: "",
  res_number: "",
  res_complement: "",
  res_lat: "",
  res_lng: "",
  carona_fixa: false,
  work_cep: "",
  work_city: "",
  work_neighborhood: "",
  work_street: "",
  work_number: "",
  work_complement: "",
  work_lat: "",
  work_lng: "",
  work_departure_time: "",
  work_return_time: "",
  avatar_file: null,
  login: "",
  password: "",
  password_confirm: "",
};

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter ao menos 8 caracteres")
  .regex(/[A-Za-z]/, "Senha deve conter letras")
  .regex(/\d/, "Senha deve conter números");

const loginSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Login muito curto")
  .max(60)
  .regex(/^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+$/, "Use o padrão nome.sobrenome.identificador");

function CadastroMotoristaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const verificationIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const driverIdRef = useRef<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validateStep1(): string | null {
    if (form.full_name.trim().length < 2) return "Informe o nome completo";
    if (!isValidCPF(form.cpf)) return "CPF inválido";
    if (!isValidPhoneBR(form.phone)) return "Telefone inválido";
    if (!z.string().email().safeParse(form.email).success) return "E-mail inválido";
    return null;
  }

  function validateStep2(): string | null {
    if (!isValidCEP(form.res_cep)) return "CEP residencial inválido";
    if (!form.res_city || !form.res_neighborhood || !form.res_street || !form.res_number)
      return "Preencha todos os campos do endereço residencial";
    if (form.carona_fixa) {
      if (!isValidCEP(form.work_cep)) return "CEP do trabalho inválido";
      if (!form.work_city || !form.work_neighborhood || !form.work_street || !form.work_number)
        return "Preencha o endereço do trabalho";
      if (!form.work_departure_time || !form.work_return_time)
        return "Informe os horários de ida e volta";
    }
    return null;
  }

  function validateStep3(): string | null {
    if (!form.avatar_file) return "Adicione uma foto de perfil";
    const lp = loginSchema.safeParse(form.login);
    if (!lp.success) return lp.error.issues[0].message;
    const pp = passwordSchema.safeParse(form.password);
    if (!pp.success) return pp.error.issues[0].message;
    if (form.password !== form.password_confirm) return "As senhas não coincidem";
    return null;
  }

  function nextStep() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleCreateAccountAndSendOTP() {
    const err = validateStep3();
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      // 1. Cria usuário no auth
      const { data: signUp, error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: form.full_name, display_name: form.social_name || form.full_name },
        },
      });
      if (signErr) throw signErr;
      const user = signUp.user;
      if (!user) throw new Error("Não foi possível criar a conta");
      userIdRef.current = user.id;

      // 2. Garante sessão (auto-confirm ligado, mas alguns fluxos pedem login)
      if (!signUp.session) {
        const { error: siErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (siErr) throw siErr;
      }

      // 3. Upload da foto de perfil
      let avatar_url: string | null = null;
      if (form.avatar_file) {
        const ext = form.avatar_file.name.split(".").pop() || "jpg";
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("driver-uploads")
          .upload(path, form.avatar_file, { upsert: true, contentType: form.avatar_file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("driver-uploads").getPublicUrl(path);
        avatar_url = pub.publicUrl;
      }

      // 4. Cria driver com status aguardando_aprovacao
      const { data: driver, error: drvErr } = await supabase
        .from("drivers")
        .insert({
          user_id: user.id,
          full_name: form.full_name.trim(),
          social_name: form.social_name.trim() || null,
          cpf: onlyDigits(form.cpf),
          rg: form.rg.trim() || null,
          phone: onlyDigits(form.phone),
          email: form.email.trim().toLowerCase(),
          login: form.login.trim().toLowerCase(),
          avatar_url,
          carona_fixa: form.carona_fixa,
          work_departure_time: form.carona_fixa ? form.work_departure_time : null,
          work_return_time: form.carona_fixa ? form.work_return_time : null,
        })
        .select("id")
        .single();
      if (drvErr) throw drvErr;
      driverIdRef.current = driver.id;

      // 5. Endereços
      const addresses = [
        {
          driver_id: driver.id,
          address_type: "residencial" as const,
          cep: onlyDigits(form.res_cep),
          city: form.res_city,
          neighborhood: form.res_neighborhood,
          street: form.res_street,
          number: form.res_number,
          complement: form.res_complement || null,
          latitude: form.res_lat ? Number(form.res_lat) : null,
          longitude: form.res_lng ? Number(form.res_lng) : null,
        },
      ];
      if (form.carona_fixa) {
        addresses.push({
          driver_id: driver.id,
          address_type: "trabalho" as const,
          cep: onlyDigits(form.work_cep),
          city: form.work_city,
          neighborhood: form.work_neighborhood,
          street: form.work_street,
          number: form.work_number,
          complement: form.work_complement || null,
          latitude: form.work_lat ? Number(form.work_lat) : null,
          longitude: form.work_lng ? Number(form.work_lng) : null,
        });
      }
      const { error: addrErr } = await supabase.from("driver_addresses").insert(addresses);
      if (addrErr) throw addrErr;

      // 6. Gera e "envia" OTP via WhatsApp (simulado)
      await sendOTP();
      setStep(4);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar cadastro";
      if (msg.toLowerCase().includes("duplicate") && msg.toLowerCase().includes("cpf")) {
        toast.error("Este CPF já está cadastrado");
      } else if (msg.toLowerCase().includes("duplicate") && msg.toLowerCase().includes("login")) {
        toast.error("Este login já está em uso");
      } else if (msg.toLowerCase().includes("already")) {
        toast.error("Este e-mail já está cadastrado");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendOTP() {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const { data, error } = await supabase
      .from("whatsapp_verifications")
      .insert({
        user_id: userIdRef.current!,
        phone: onlyDigits(form.phone),
        code,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      toast.error("Falha ao enviar código");
      return;
    }
    verificationIdRef.current = data.id;
    setOtpSent(true);
    setOtpExpiresAt(expiresAt.getTime());
    // Simulação: mostra o código (em produção iria por WhatsApp)
    toast.success(`Código enviado por WhatsApp: ${code}`, {
      description: `Simulação — válido por 10 min.`,
      duration: 15000,
    });
    console.log("[WhatsApp simulado] Código:", code);
  }

  async function verifyOTP() {
    if (!verificationIdRef.current || !driverIdRef.current) return;
    if (otpCode.length !== 6) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("whatsapp_verifications")
      .select("code, expires_at, attempts")
      .eq("id", verificationIdRef.current)
      .single();
    if (error || !data) {
      setLoading(false);
      toast.error("Verificação não encontrada");
      return;
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      setLoading(false);
      toast.error("Código expirado. Solicite um novo.");
      return;
    }
    if (data.code !== otpCode) {
      await supabase
        .from("whatsapp_verifications")
        .update({ attempts: (data.attempts || 0) + 1 })
        .eq("id", verificationIdRef.current);
      setLoading(false);
      toast.error("Código incorreto");
      return;
    }
    await supabase
      .from("whatsapp_verifications")
      .update({ verified: true })
      .eq("id", verificationIdRef.current);
    await supabase
      .from("drivers")
      .update({ whatsapp_verified: true, whatsapp_verified_at: new Date().toISOString() })
      .eq("id", driverIdRef.current);
    setLoading(false);
    toast.success("Cadastro realizado com sucesso!");
    navigate({ to: "/cadastro-veiculo", search: { driver: driverIdRef.current } });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AgioHeader />
      <main className="flex-1 flex items-start justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-2xl p-6 md:p-8 shadow-[var(--shadow-elegant)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Cadastro de Motorista</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Etapa {Math.min(step, 4)} de 4 — preencha os dados para se cadastrar.
            </p>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full ${
                    n <= step ? "bg-[image:var(--gradient-hero)]" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Nome completo *">
                <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
              </Field>
              <Field label="Nome social (opcional)">
                <Input value={form.social_name} onChange={(e) => update("social_name", e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="CPF *">
                  <Input
                    value={form.cpf}
                    onChange={(e) => update("cpf", maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                  />
                </Field>
                <Field label="RG (opcional)">
                  <Input value={form.rg} onChange={(e) => update("rg", e.target.value)} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Telefone / WhatsApp *">
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                  />
                </Field>
                <Field label="E-mail *">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold mb-3">Endereço residencial</h2>
                <AddressFields
                  prefix="res"
                  values={form}
                  onChange={(k, v) => update(k as keyof FormState, v as never)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-semibold">Quero oferecer Carona Fixa</p>
                  <p className="text-xs text-muted-foreground">
                    Habilita endereço e horários do trabalho.
                  </p>
                </div>
                <Switch
                  checked={form.carona_fixa}
                  onCheckedChange={(v) => update("carona_fixa", v)}
                />
              </div>

              {form.carona_fixa && (
                <div className="space-y-4">
                  <h2 className="font-semibold">Endereço do trabalho</h2>
                  <AddressFields
                    prefix="work"
                    values={form}
                    onChange={(k, v) => update(k as keyof FormState, v as never)}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Horário de ida">
                      <Input
                        type="time"
                        value={form.work_departure_time}
                        onChange={(e) => update("work_departure_time", e.target.value)}
                      />
                    </Field>
                    <Field label="Horário de volta">
                      <Input
                        type="time"
                        value={form.work_return_time}
                        onChange={(e) => update("work_return_time", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Foto de perfil *">
                <label className="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {form.avatar_file ? (
                      <img
                        src={URL.createObjectURL(form.avatar_file)}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">
                      {form.avatar_file ? form.avatar_file.name : "Clique para enviar"}
                    </p>
                    <p className="text-xs text-muted-foreground">JPG ou PNG até 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && f.size > 5 * 1024 * 1024) {
                        toast.error("Arquivo muito grande (máx 5MB)");
                        return;
                      }
                      update("avatar_file", f);
                    }}
                  />
                </label>
              </Field>

              <Field label="Login de acesso *">
                <Input
                  value={form.login}
                  onChange={(e) => update("login", e.target.value.toLowerCase())}
                  placeholder="nome.sobrenome.identificador"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Senha *">
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Mín. 8, letras + números"
                  />
                </Field>
                <Field label="Confirmar senha *">
                  <Input
                    type="password"
                    value={form.password_confirm}
                    onChange={(e) => update("password_confirm", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-semibold">Verificação por WhatsApp</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos um código de 6 dígitos para {form.phone}. Digite abaixo para confirmar.
              </p>
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(onlyDigits(e.target.value).slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest max-w-xs mx-auto"
                inputMode="numeric"
              />
              <OtpCountdown expiresAt={otpExpiresAt} />
              <Button onClick={verifyOTP} disabled={loading} className="w-full max-w-xs mx-auto bg-[image:var(--gradient-hero)] font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar código"}
              </Button>
              <button
                type="button"
                onClick={sendOTP}
                className="text-sm text-primary hover:underline font-medium"
                disabled={loading || !otpSent}
              >
                Reenviar código
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
            {step > 1 && step < 4 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            ) : (
              <Link to="/auth" className="text-sm text-muted-foreground hover:underline">
                Já tem conta? Entrar
              </Link>
            )}

            {step < 3 && (
              <Button onClick={nextStep} className="bg-[image:var(--gradient-hero)] font-semibold">
                Avançar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={handleCreateAccountAndSendOTP}
                disabled={loading}
                className="bg-[image:var(--gradient-hero)] font-semibold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar código WhatsApp"}
              </Button>
            )}
          </div>
        </Card>
      </main>
      <AgioFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function AddressFields({
  prefix,
  values,
  onChange,
}: {
  prefix: "res" | "work";
  values: FormState;
  onChange: (k: string, v: string) => void;
}) {
  const get = (k: string) => (values as unknown as Record<string, string>)[`${prefix}_${k}`] || "";
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="CEP *">
          <Input
            value={get("cep")}
            onChange={(e) => onChange(`${prefix}_cep`, maskCEP(e.target.value))}
            placeholder="00000-000"
          />
        </Field>
        <Field label="Cidade *">
          <Input value={get("city")} onChange={(e) => onChange(`${prefix}_city`, e.target.value)} />
        </Field>
        <Field label="Bairro *">
          <Input
            value={get("neighborhood")}
            onChange={(e) => onChange(`${prefix}_neighborhood`, e.target.value)}
          />
        </Field>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Field label="Rua *">
            <Input
              value={get("street")}
              onChange={(e) => onChange(`${prefix}_street`, e.target.value)}
            />
          </Field>
        </div>
        <Field label="Número *">
          <Input
            value={get("number")}
            onChange={(e) => onChange(`${prefix}_number`, e.target.value)}
          />
        </Field>
      </div>
      <Field label="Complemento">
        <Input
          value={get("complement")}
          onChange={(e) => onChange(`${prefix}_complement`, e.target.value)}
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Latitude (opcional)">
          <Input value={get("lat")} onChange={(e) => onChange(`${prefix}_lat`, e.target.value)} />
        </Field>
        <Field label="Longitude (opcional)">
          <Input value={get("lng")} onChange={(e) => onChange(`${prefix}_lng`, e.target.value)} />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        Dica: o ajuste no mapa será habilitado em breve. Por enquanto, informe a latitude/longitude
        manualmente se desejar.
      </p>
    </div>
  );
}

function OtpCountdown({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, expiresAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const min = Math.floor(remaining / 60000);
  const sec = Math.floor((remaining % 60000) / 1000);
  return (
    <p className="text-xs text-muted-foreground">
      Código expira em {min}:{String(sec).padStart(2, "0")}
    </p>
  );
}
