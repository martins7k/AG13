-- ==========================================================
-- SCHEMA DO SUPABASE: PLATAFORMA DE GESTÃO DE EMPRÉSTIMOS
-- ==========================================================
-- Como usar:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. Vá na aba "SQL Editor" (ícone com símbolo de terminal / código na barra lateral esquerda)
-- 3. Clique em "+ New query", cole todo este código e clique no botão verde "Run".
-- ==========================================================

-- Habilita extensão de UUID se ainda não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    apelido TEXT,
    telefone TEXT,
    chave_pix TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE EMPRÉSTIMOS
CREATE TABLE IF NOT EXISTS public.emprestimos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    valor_original NUMERIC(12, 2) NOT NULL,
    taxa_mensal NUMERIC(6, 2) NOT NULL DEFAULT 25.00,
    data_inicio DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Quitado')),
    observacao TEXT,
    criado_em TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE AMORTIZAÇÕES (MÚLTIPLOS PAGAMENTOS COM DATAS)
CREATE TABLE IF NOT EXISTS public.amortizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emprestimo_id UUID NOT NULL REFERENCES public.emprestimos(id) ON DELETE CASCADE,
    valor NUMERIC(12, 2) NOT NULL,
    data_pagamento DATE NOT NULL,
    forma_pagamento TEXT DEFAULT 'PIX',
    observacao TEXT,
    criado_em TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ÍNDICES PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_emprestimos_cliente_id ON public.emprestimos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_amortizacoes_emprestimo_id ON public.amortizacoes(emprestimo_id);
CREATE INDEX IF NOT EXISTS idx_amortizacoes_data ON public.amortizacoes(data_pagamento);

-- HABILITA ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amortizacoes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO PARA A CHAVE PÚBLICA (ANON KEY)
-- Permite leitura e escrita pelo aplicativo autenticado pelo PIN
CREATE POLICY "Acesso completo clientes anon" ON public.clientes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso completo emprestimos anon" ON public.emprestimos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso completo amortizacoes anon" ON public.amortizacoes
    FOR ALL USING (true) WITH CHECK (true);

-- HABILITA WEBSOCKETS TEMPO REAL (SUPABASE REALTIME)
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes, public.emprestimos, public.amortizacoes;

