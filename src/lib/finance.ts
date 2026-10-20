import { Emprestimo, Amortizacao, CalculoEmprestimo, Cliente } from './types';

/**
 * Converte string 'YYYY-MM-DD' para objeto Date local (evitando desvio de fuso horário)
 */
export function parseDataLocal(dataStr: string): Date {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  return new Date(ano, mes - 1, dia, 12, 0, 0);
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD
 */
export function getHojeString(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata número para moeda brasileira (R$ 1.250,00)
 */
export function formatarMoeda(valor: number): string {
  return (valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata data 'YYYY-MM-DD' para 'DD/MM/AAAA'
 */
export function formatarDataBR(dataStr: string): string {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  if (!ano || !mes || !dia) return dataStr;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Calcula a diferença em dias entre duas datas (Data2 - Data1)
 */
export function diferencaEmDias(dataInicioStr: string, dataFimStr: string): number {
  const d1 = parseDataLocal(dataInicioStr);
  const d2 = parseDataLocal(dataFimStr);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Realiza o cálculo exato dos 5 valores fundamentais do empréstimo:
 * 1. Empréstimo Original
 * 2. Juros Calculado (Juros simples a cada 30 dias em cima do original)
 * 3. Empréstimo + Juros
 * 4. Amortizações Realizadas (soma de todos os pagamentos parciais)
 * 5. Valor Atualizado Final: (Empréstimo + Juros) - Amortizações
 */
export function calcularValoresEmprestimo(
  emprestimo: Emprestimo,
  amortizacoes: Amortizacao[] = [],
  cliente?: Cliente,
  dataReferenciaStr: string = getHojeString()
): CalculoEmprestimo {
  const v1_emprestimoOriginal = Number(emprestimo.valorOriginal) || 0;
  const taxaMensal = Number(emprestimo.taxaMensal) || 0; // ex: 25 para 25%

  // Dias decorridos desde a liberação do dinheiro
  const diasDecorridos = diferencaEmDias(emprestimo.dataInicio, dataReferenciaStr);

  // Dias em atraso em relação à data limite de vencimento
  const refDate = parseDataLocal(dataReferenciaStr);
  const vencDate = parseDataLocal(emprestimo.dataVencimento);
  const diffAtrasoMs = refDate.getTime() - vencDate.getTime();
  const diasAtraso = Math.max(0, Math.floor(diffAtrasoMs / (1000 * 60 * 60 * 24)));
  const estaAtrasado = diasAtraso > 0;

  // 2. Juros Simples Calculado sobre o valor original
  // Taxa mensal convertida para diária linear (taxa / 100 / 30) * dias decorridos
  const taxaDiaria = (taxaMensal / 100) / 30;
  const v2_jurosCalculado = v1_emprestimoOriginal * taxaDiaria * diasDecorridos;

  // 3. Empréstimo + Juros
  const v3_emprestimoComJuros = v1_emprestimoOriginal + v2_jurosCalculado;

  // 4. Amortização Total (soma de todas as amortizações do histórico)
  const v4_amortizacaoTotal = amortizacoes.reduce(
    (acc, item) => acc + (Number(item.valor) || 0),
    0
  );

  // 5. Valor Atualizado Final (Saldo a Receber)
  const v5_valorAtualizado = Math.max(0, v3_emprestimoComJuros - v4_amortizacaoTotal);

  return {
    emprestimo,
    cliente,
    amortizacoes,
    diasDecorridos,
    diasAtraso,
    estaAtrasado,
    v1_emprestimoOriginal,
    v2_jurosCalculado,
    v3_emprestimoComJuros,
    v4_amortizacaoTotal,
    v5_valorAtualizado,
  };
}
