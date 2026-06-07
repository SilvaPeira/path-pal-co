import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";


const navItems = [
  "Como funciona",
  "Corrida",
  "Carona Fixa",
  "Entrega",
  "Viagem",
  "Motoristas",
  "Passageiros",
  "Empresas",
];

export function AgioHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground font-bold">
            À
          </span>
          <span className="font-bold text-lg tracking-tight text-foreground">ÀgioTec</span>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors uppercase"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="ghost" className="font-semibold">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild className="bg-[image:var(--gradient-hero)] hover:opacity-90 font-semibold shadow-[var(--shadow-elegant)]">
            <Link to="/auth">Baixar App</Link>
          </Button>
        </div>

        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-foreground/80"
                onClick={() => setOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="ghost" className="flex-1">
                <Link to="/auth" onClick={() => setOpen(false)}>Entrar</Link>
              </Button>
              <Button asChild className="flex-1 bg-[image:var(--gradient-hero)]">
                <Link to="/auth" onClick={() => setOpen(false)}>Baixar App</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
