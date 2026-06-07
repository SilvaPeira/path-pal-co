import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AgioHeader } from "@/components/AgioHeader";
import { AgioFooter } from "@/components/AgioFooter";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, RefreshCw, FileSpreadsheet, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/empresa-dashboard")({
  component: EmpresaDashboard,
});

function EmpresaDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchEmployees() {
    setLoading(true);
    const { data, error } = await supabase.from("company_employees").select("*");
    if (!error) setEmployees(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e => 
    e.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.cpf?.includes(search)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AgioHeader />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase">Painel da Empresa</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchEmployees}><RefreshCw className="h-4 w-4 mr-2" /> Atualizar</Button>
            <Button size="sm" className="bg-[image:var(--gradient-hero)]"><Plus className="h-4 w-4 mr-2" /> Vincular Funcionário</Button>
          </div>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <Input 
              placeholder="Filtrar por nome ou CPF..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2" /> Exportar Excel</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold uppercase">Nome</TableHead>
                  <TableHead className="font-bold uppercase">CPF</TableHead>
                  <TableHead className="font-bold uppercase">Cargo</TableHead>
                  <TableHead className="font-bold uppercase">Situação</TableHead>
                  <TableHead className="font-bold uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.full_name}</TableCell>
                    <TableCell>{emp.cpf}</TableCell>
                    <TableCell>{emp.cargo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {emp.status?.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
      <AgioFooter />
    </div>
  );
}
