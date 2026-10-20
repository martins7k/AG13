export interface Cliente {
  id: string;
  nome: string;
  apelido?: string;
  telefone?: string;
  chavePix?: string;
  observacoes?: string;
  criadoEm: string;
}

export interface Amortizacao {
  id: string;
  emprestimoId: string;
  valor: number;
  dataPagamento: string; // YYYY-MM-DD
  formaPagamento?: string; // PIX, Dinheiro, etc.
  observacao?: string;
  criadoEm: string;
}

export interface Emprestimo {
  id: string;
  clienteId: string;
  valorOriginal: number; // 1. Empréstimo
  taxaMensal: number; // % a cada 30 dias (ex: 25 para 25%)
  dataInicio: string; // YYYY-MM-DD
  dataVencimento: string; // YYYY-MM-DD
  status: 'Ativo' | 'Quitado';
  observacao?: string;
  criadoEm: string;
}

export interface CalculoEmprestimo {
  emprestimo: Emprestimo;
  cliente?: Cliente;
  amortizacoes: Amortizacao[];
  diasDecorridos: number;
  diasAtraso: number;
  estaAtrasado: boolean;
  
  // OS 5 VALORES FUNDAMENTAIS
  v1_emprestimoOriginal: number;
  v2_jurosCalculado: number;
  v3_emprestimoComJuros: number;
  v4_amortizacaoTotal: number;
  v5_valorAtualizado: number;
}
