import { Cliente, Emprestimo, Amortizacao } from './types';

const STORAGE_KEYS = {
  CLIENTES: 'silvio_gestao_clientes_v1',
  EMPRESTIMOS: 'silvio_gestao_emprestimos_v1',
  AMORTIZACOES: 'silvio_gestao_amortizacoes_v1',
  PIN: 'silvio_gestao_pin_v1',
};

// Funções auxiliares para leitura e escrita seguras no LocalStorage
function lerLocal<T>(chave: string, valorPadrao: T): T {
  if (typeof window === 'undefined') return valorPadrao;
  try {
    const item = localStorage.getItem(chave);
    return item ? JSON.parse(item) : valorPadrao;
  } catch (e) {
    console.error(`Erro ao ler ${chave}:`, e);
    return valorPadrao;
  }
}

function salvarLocal<T>(chave: string, valor: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    console.error(`Erro ao salvar ${chave}:`, e);
  }
}

// ================= GERENCIAMENTO DE CLIENTES =================
export function getClientes(): Cliente[] {
  return lerLocal<Cliente[]>(STORAGE_KEYS.CLIENTES, []);
}

export function salvarCliente(cliente: Omit<Cliente, 'id' | 'criadoEm'>): Cliente {
  const clientes = getClientes();
  const novoCliente: Cliente = {
    ...cliente,
    id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    criadoEm: new Date().toISOString(),
  };
  clientes.push(novoCliente);
  salvarLocal(STORAGE_KEYS.CLIENTES, clientes);
  return novoCliente;
}

// ================= GERENCIAMENTO DE EMPRÉSTIMOS =================
export function getEmprestimos(): Emprestimo[] {
  return lerLocal<Emprestimo[]>(STORAGE_KEYS.EMPRESTIMOS, []);
}

export function salvarEmprestimo(emprestimo: Omit<Emprestimo, 'id' | 'criadoEm'>): Emprestimo {
  const emprestimos = getEmprestimos();
  const novoEmprestimo: Emprestimo = {
    ...emprestimo,
    id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    criadoEm: new Date().toISOString(),
  };
  emprestimos.unshift(novoEmprestimo);
  salvarLocal(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
  return novoEmprestimo;
}

export function atualizarStatusEmprestimo(id: string, status: 'Ativo' | 'Quitado'): void {
  const emprestimos = getEmprestimos();
  const index = emprestimos.findIndex((e) => e.id === id);
  if (index !== -1) {
    emprestimos[index].status = status;
    salvarLocal(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
  }
}

export function excluirEmprestimo(id: string): void {
  const emprestimos = getEmprestimos().filter((e) => e.id !== id);
  salvarLocal(STORAGE_KEYS.EMPRESTIMOS, emprestimos);
  
  // Exclui também as amortizações vinculadas
  const amortizacoes = getAmortizacoes().filter((a) => a.emprestimoId !== id);
  salvarLocal(STORAGE_KEYS.AMORTIZACOES, amortizacoes);
}

// ================= GERENCIAMENTO DE AMORTIZAÇÕES =================
export function getAmortizacoes(emprestimoId?: string): Amortizacao[] {
  const todas = lerLocal<Amortizacao[]>(STORAGE_KEYS.AMORTIZACOES, []);
  if (emprestimoId) {
    return todas
      .filter((a) => a.emprestimoId === emprestimoId)
      .sort((a, b) => new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime());
  }
  return todas;
}

export function salvarAmortizacao(amortizacao: Omit<Amortizacao, 'id' | 'criadoEm'>): Amortizacao {
  const amortizacoes = getAmortizacoes();
  const nova: Amortizacao = {
    ...amortizacao,
    id: 'amort_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    criadoEm: new Date().toISOString(),
  };
  amortizacoes.unshift(nova);
  salvarLocal(STORAGE_KEYS.AMORTIZACOES, amortizacoes);
  return nova;
}

export function excluirAmortizacao(id: string): void {
  const amortizacoes = getAmortizacoes().filter((a) => a.id !== id);
  salvarLocal(STORAGE_KEYS.AMORTIZACOES, amortizacoes);
}

// ================= CONTROLE DE PIN =================
export function getPIN(): string {
  return lerLocal<string>(STORAGE_KEYS.PIN, '1234'); // PIN padrão 1234 para facilidade
}

export function salvarPIN(novoPin: string): void {
  salvarLocal(STORAGE_KEYS.PIN, novoPin);
}

// ================= LIMPEZA TOTAL (BASE VAZIA) =================
export function limparTodaBase(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CLIENTES);
  localStorage.removeItem(STORAGE_KEYS.EMPRESTIMOS);
  localStorage.removeItem(STORAGE_KEYS.AMORTIZACOES);
}

// ================= CARREGAR DADO DE DEMO (EX: JOSEFA DA PLANILHA) =================
export function carregarExemploJosefa(): void {
  limparTodaBase();
  const cli = salvarCliente({
    nome: 'Josefa Silva',
    apelido: 'Dona Josefa',
    telefone: '(11) 98765-4321',
    chavePix: 'josefa@email.com',
  });

  // Data de 51 dias atrás para bater com a planilha
  const dataHoje = new Date();
  const dataInicio = new Date(dataHoje.getTime() - 51 * 24 * 60 * 60 * 1000);
  const dataVenc = new Date(dataHoje.getTime() - 21 * 24 * 60 * 60 * 1000);

  const formatStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const emp = salvarEmprestimo({
    clienteId: cli.id,
    valorOriginal: 10000,
    taxaMensal: 25,
    dataInicio: formatStr(dataInicio),
    dataVencimento: formatStr(dataVenc),
    status: 'Ativo',
    observacao: 'Empréstimo original da planilha',
  });

  // Lança uma amortização de teste
  salvarAmortizacao({
    emprestimoId: emp.id,
    valor: 1500,
    dataPagamento: formatStr(new Date(dataHoje.getTime() - 5 * 24 * 60 * 60 * 1000)),
    formaPagamento: 'PIX',
    observacao: 'Abatimento parcial',
  });
}
