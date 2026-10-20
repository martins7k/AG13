import { Cliente, Emprestimo, Amortizacao } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import * as localStore from './storage';

export const estaUsandoNuvem = () => isSupabaseConfigured();

/**
 * Busca consolidada de todos os clientes, empréstimos e amortizações.
 */
export async function carregarDadosCompletos(): Promise<{
  clientes: Cliente[];
  emprestimos: Emprestimo[];
  amortizacoes: Amortizacao[];
}> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const [resCli, resEmp, resAmort] = await Promise.all([
        supabase.from('clientes').select('*').order('criado_em', { ascending: true }),
        supabase.from('emprestimos').select('*').order('criado_em', { ascending: false }),
        supabase.from('amortizacoes').select('*').order('data_pagamento', { ascending: false }),
      ]);

      if (resCli.error) throw resCli.error;
      if (resEmp.error) throw resEmp.error;
      if (resAmort.error) throw resAmort.error;

      const clientes: Cliente[] = (resCli.data || []).map((row: any) => ({
        id: row.id,
        nome: row.nome,
        apelido: row.apelido,
        telefone: row.telefone,
        chavePix: row.chave_pix,
        observacoes: row.observacoes,
        criadoEm: row.criado_em,
      }));

      const emprestimos: Emprestimo[] = (resEmp.data || []).map((row: any) => ({
        id: row.id,
        clienteId: row.cliente_id,
        valorOriginal: Number(row.valor_original),
        taxaMensal: Number(row.taxa_mensal),
        dataInicio: row.data_inicio,
        dataVencimento: row.data_vencimento,
        status: row.status,
        observacao: row.observacao,
        criadoEm: row.criado_em,
      }));

      const amortizacoes: Amortizacao[] = (resAmort.data || []).map((row: any) => ({
        id: row.id,
        emprestimoId: row.emprestimo_id,
        valor: Number(row.valor),
        dataPagamento: row.data_pagamento,
        formaPagamento: row.forma_pagamento,
        observacao: row.observacao,
        criadoEm: row.criado_em,
      }));

      return { clientes, emprestimos, amortizacoes };
    } catch (err) {
      console.error('Falha ao conectar no Supabase. Usando armazenamento local temporário:', err);
    }
  }

  // Fallback LocalStorage
  return {
    clientes: localStore.getClientes(),
    emprestimos: localStore.getEmprestimos(),
    amortizacoes: localStore.getAmortizacoes(),
  };
}

/**
 * Salva novo cliente
 */
export async function cadastrarCliente(
  cliente: Omit<Cliente, 'id' | 'criadoEm'>
): Promise<Cliente> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nome: cliente.nome,
        apelido: cliente.apelido,
        telefone: cliente.telefone,
        chave_pix: cliente.chavePix,
        observacoes: cliente.observacoes,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      nome: data.nome,
      apelido: data.apelido,
      telefone: data.telefone,
      chavePix: data.chave_pix,
      observacoes: data.observacoes,
      criadoEm: data.criado_em,
    };
  }

  return localStore.salvarCliente(cliente);
}

/**
 * Salva novo empréstimo
 */
export async function cadastrarEmprestimo(
  emprestimo: Omit<Emprestimo, 'id' | 'criadoEm'>
): Promise<Emprestimo> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('emprestimos')
      .insert({
        cliente_id: emprestimo.clienteId,
        valor_original: emprestimo.valorOriginal,
        taxa_mensal: emprestimo.taxaMensal,
        data_inicio: emprestimo.dataInicio,
        dataVencimento: emprestimo.dataVencimento,
        status: emprestimo.status,
        observacao: emprestimo.observacao,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      clienteId: data.cliente_id,
      valorOriginal: Number(data.valor_original),
      taxaMensal: Number(data.taxa_mensal),
      dataInicio: data.data_inicio,
      dataVencimento: data.data_vencimento,
      status: data.status,
      observacao: data.observacao,
      criadoEm: data.criado_em,
    };
  }

  return localStore.salvarEmprestimo(emprestimo);
}

/**
 * Atualiza status do empréstimo (Ativo / Quitado)
 */
export async function alterarStatusEmprestimo(
  id: string,
  status: 'Ativo' | 'Quitado'
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('emprestimos')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return;
  }

  localStore.atualizarStatusEmprestimo(id, status);
}

/**
 * Exclui empréstimo e suas amortizações
 */
export async function apagarEmprestimo(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('emprestimos').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  localStore.excluirEmprestimo(id);
}

/**
 * Salva nova amortização com data
 */
export async function cadastrarAmortizacao(
  amortizacao: Omit<Amortizacao, 'id' | 'criadoEm'>
): Promise<Amortizacao> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('amortizacoes')
      .insert({
        emprestimo_id: amortizacao.emprestimoId,
        valor: amortizacao.valor,
        data_pagamento: amortizacao.dataPagamento,
        forma_pagamento: amortizacao.formaPagamento,
        observacao: amortizacao.observacao,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      emprestimoId: data.emprestimo_id,
      valor: Number(data.valor),
      dataPagamento: data.data_pagamento,
      formaPagamento: data.forma_pagamento,
      observacao: data.observacao,
      criadoEm: data.criado_em,
    };
  }

  return localStore.salvarAmortizacao(amortizacao);
}

/**
 * Exclui amortização
 */
export async function apagarAmortizacao(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('amortizacoes').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  localStore.excluirAmortizacao(id);
}
