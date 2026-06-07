import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pagamentos")({
  component: PagamentosPage,
});

function PagamentosPage() {
  const [cards, setCards] = useState([
    { id: 1, last4: "4422", provider: "Visa", holder: "JOSE DA SILVA" }
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AgioHeader />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold mb-6 uppercase">Formas de Pagamento</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-bold uppercase text-sm text-muted-foreground">Meus Cartões</h2>
            {cards.map(card => (
              <Card key={card.id} className="p-4 flex items-center justify-between border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <CreditCard />
                  </div>
                  <div>
                    <p className="font-bold">**** **** **** {card.last4}</p>
                    <p className="text-xs text-muted-foreground uppercase">{card.provider} - {card.holder}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
            <Button variant="outline" className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Novo Cartão
            </Button>
          </div>

          <Card className="p-6">
            <h2 className="font-bold uppercase mb-4">Novo Cartão</h2>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs">Nome do Titular</Label>
                <Input placeholder="Como impresso no cartão" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase text-xs">Número do Cartão</Label>
                <Input placeholder="0000 0000 0000 0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">Validade</Label>
                  <Input placeholder="MM/AA" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-xs">CVV</Label>
                  <Input placeholder="123" />
                </div>
              </div>
              <Button className="w-full bg-[image:var(--gradient-hero)]">Salvar Cartão</Button>
            </form>
          </Card>
        </div>
      </main>
      <AgioFooter />
    </div>
  );
}
