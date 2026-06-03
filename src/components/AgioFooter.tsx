import { Instagram, Linkedin, Twitter } from "lucide-react";

const links = ["Sobre nós", "Contato", "Termos de uso", "Política de privacidade", "Ajuda"];

export function AgioFooter() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] font-bold">
              À
            </span>
            <span className="font-bold text-lg tracking-tight">ÀgioTec</span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map((l) => (
              <a key={l} href="#" className="font-bold text-sm hover:text-primary-glow transition-colors">
                {l}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram" className="hover:text-primary-glow transition-colors"><Instagram size={20} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-primary-glow transition-colors"><Linkedin size={20} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary-glow transition-colors"><Twitter size={20} /></a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/15 text-center text-sm opacity-80">
          Copyright © 2025 AgioTec
        </div>
      </div>
    </footer>
  );
}
