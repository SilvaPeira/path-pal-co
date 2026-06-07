
-- Extensão para empresas
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  razao_social TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  phone TEXT,
  email TEXT,
  cep TEXT,
  city TEXT,
  neighborhood TEXT,
  street TEXT,
  number TEXT,
  latitude FLOAT,
  longitude FLOAT,
  opening_time TIME,
  closing_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de funcionários vinculados às empresas
CREATE TABLE public.company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT,
  cpf TEXT,
  cargo TEXT,
  status TEXT DEFAULT 'ativo', -- ativo/inativo
  linked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, cpf)
);

-- Tabela de recargas de vale
CREATE TABLE public.employee_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.company_employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'carona' ou 'corrida'
  amount DECIMAL(10,2),
  quantity_per_day INTEGER DEFAULT 4,
  days_per_month INTEGER DEFAULT 22,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extensão para passageiros (detalhes adicionais)
CREATE TABLE public.passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf TEXT UNIQUE NOT NULL,
  rg TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Endereços de passageiros (múltiplos endereços de trabalho)
CREATE TABLE public.passenger_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES public.passengers(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL, -- 'residencial', 'trabalho'
  cep TEXT,
  city TEXT,
  neighborhood TEXT,
  street TEXT,
  number TEXT,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Horários de trabalho/viagem do passageiro
CREATE TABLE public.passenger_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES public.passengers(id) ON DELETE CASCADE,
  work_start TIME,
  work_end TIME,
  departure_time TIME,
  return_time TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cartões de pagamento
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  holder_name TEXT,
  card_number_masked TEXT,
  expiry_date TEXT,
  provider TEXT, -- 'visa', 'mastercard', etc.
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para as novas tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passenger_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY "Empresas veem seus próprios dados" ON public.companies FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Passageiros veem seus próprios dados" ON public.passengers FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuários veem seus cartões" ON public.payment_methods FOR ALL TO authenticated USING (auth.uid() = user_id);

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
