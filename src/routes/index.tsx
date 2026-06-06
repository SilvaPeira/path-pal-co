import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  UserPlus,
  MapPin,
  Users,
  Wallet,
  Leaf,
  ShieldCheck,
  Navigation,
  Apple,
  Play,
} from "lucide-react";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";
import heroImg from "@/assets/hero-carona.jpg";
import appMockup from "@/assets/app-mockup.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ÀgioTec — Compartilhe o caminho. Economize e ajude o planeta." },
      {
        name: "description",
        content:
          "Conecte-se com motoristas e passageiros que vão para o mesmo destino. Caronas, corridas, entregas e viagens com a ÀgioTec.",
      },
      { property: "og:title", content: "ÀgioTec — Mobilidade compartilhada" },
      {
        property: "og:description",
        content: "Compartilhe o caminho, economize e ajude o planeta com a ÀgioTec.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <AgioHeader />

      {/* HERO */}
      <section className="relative pt-16">
        <div className="relative overflow-hidden">
          <img
            src={heroImg}
            alt="Pessoas compartilhando carona em uma cidade arborizada"
            width={1600}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/55 to-primary/60" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-24 md:py-36 text-background">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/15 backdrop-blur px-4 py-1.5 text-sm font-medium border border-background/20">
              <Leaf size={14} /> Mobilidade urbana sustentável
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl">
              Compartilhe o caminho.
              <br />
              <span className="text-primary-glow">Economize</span> e ajude o planeta.
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl text-background/90">
              Conecte-se com motoristas e passageiros que vão para o mesmo destino.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" className="bg-[image:var(--gradient-hero)] hover:opacity-90 font-semibold text-base h-12 px-6 shadow-[var(--shadow-elegant)]">
                Quero ser passageiro 🚗
              </Button>
              <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90 border-0 font-semibold text-base h-12 px-6">
                Quero oferecer carona 🚙
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">Como funciona</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Três passos para começar</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Cadastre-se, encontre sua rota e viaje junto. Simples assim.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { icon: UserPlus, title: "Cadastre-se", desc: "Crie sua conta como motorista ou passageiro em minutos." },
              { icon: MapPin, title: "Encontre sua rota", desc: "Veja pessoas indo na mesma direção que você." },
              { icon: Users, title: "Viaje junto", desc: "Combine o ponto de encontro e divida os custos." },
            ].map((step, i) => (
              <Card key={step.title} className="p-8 border-border hover:shadow-[var(--shadow-elegant)] transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-[image:var(--gradient-hero)] flex items-center justify-center text-primary-foreground">
                    <step.icon size={26} />
                  </div>
                  <span className="text-5xl font-bold text-accent">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUE ESCOLHER */}
      <section className="py-24 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">Vantagens</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
              Por que escolher o <span className="text-primary">ÀgioTec?</span>
            </h2>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Wallet, emoji: "💰", title: "Mais economia", desc: "Divida custos de combustível e estacionamento." },
              { icon: Leaf, emoji: "🌱", title: "Sustentável", desc: "Menos carros nas ruas e menos emissão de CO₂." },
              { icon: ShieldCheck, emoji: "🕒", title: "Rápido e seguro", desc: "Sistema com verificação e avaliação de usuários." },
              { icon: Navigation, emoji: "📍", title: "Conveniência", desc: "Encontre caronas próximas em tempo real." },
            ].map((b) => (
              <Card key={b.title} className="p-7 bg-card border-border hover:-translate-y-1 transition-transform">
                <div className="h-12 w-12 rounded-xl bg-accent/60 flex items-center justify-center text-2xl">
                  {b.emoji}
                </div>
                <h3 className="mt-5 text-lg font-bold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BAIXAR APP */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">Aplicativo</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
              Baixe o aplicativo
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Leve a ÀgioTec com você e compartilhe o caminho a qualquer hora.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background h-14 px-6 gap-3">
                <Apple size={22} />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-80">Baixar na</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>
              <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background h-14 px-6 gap-3">
                <Play size={22} />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-80">Disponível no</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[image:var(--gradient-hero)] rounded-[3rem] blur-3xl opacity-30" />
            <img
              src={appMockup}
              alt="Aplicativo ÀgioTec em smartphones"
              width={1200}
              height={1200}
              loading="lazy"
              className="relative w-full h-auto"
            />
          </div>
        </div>
      </section>

      <AgioFooter />
    </div>
  );
}
