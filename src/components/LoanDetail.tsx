'use client';

import React from 'react';
import { CalculoEmprestimo } from '../lib/types';
import { formatarMoeda, formatarDataBR } from '../lib/finance';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Clock, 
  DollarSign, 
  Receipt,
  Phone,
  User
} from 'lucide-react';

interface LoanDetailProps {
  calculo: CalculoEmprestimo;
  onVoltar: () => void;
  onAbrirAmortizacao: () => void;
  onAlternarStatus: (novoStatus: 'Ativo' | 'Quitado') => void;
  onExcluirAmortizacao: (id: string) => void;
  onExcluirEmprestimo: (id: string) => void;
}

export function LoanDetail({
  calculo,
  onVoltar,
  onAbrirAmortizacao,
  onAlternarStatus,
  onExcluirAmortizacao,
  onExcluirEmprestimo,
}: LoanDetailProps) {
  const {
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
  } = calculo;

  return (
    <div className="space-y-5 pb-32">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          {emprestimo.status === 'Quitado' ? (
            <button
              onClick={() => onAlternarStatus('Ativo')}
              className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl"
            >
              Reabrir Empréstimo
            </button>
          ) : (
            <button
              onClick={() => onAlternarStatus('Quitado')}
              className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
            >
              Marcar como Quitado
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este empréstimo e seus lançamentos?')) {
                onExcluirEmprestimo(emprestimo.id);
              }
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 flex items-center justify-center active:scale-95 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CABEÇALHO DO CLIENTE & STATUS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                {cliente?.nome || 'Cliente'}
              </h2>
              {cliente?.apelido && (
                <span className="text-xs text-slate-400 font-medium">
                  ({cliente.apelido})
                </span>
              )}
            </div>
            {cliente?.telefone && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{cliente.telefone}</span>
              </p>
            )}
          </div>

          <div>
            {emprestimo.status === 'Quitado' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Quitado
              </span>
            ) : estaAtrasado ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                Atrasado ({diasAtraso}d)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Em dia
              </span>
            )}
          </div>
        </div>

        {/* Linha de Datas e Prazos */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Início</span>
            <span className="font-semibold text-slate-200">
              {formatarDataBR(emprestimo.dataInicio)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Vencimento</span>
            <span className="font-semibold text-slate-200">
              {formatarDataBR(emprestimo.dataVencimento)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Decorrido</span>
            <span className="font-semibold text-emerald-400">
              {diasDecorridos} dias
            </span>
          </div>
        </div>
      </div>

      {/* CARD PRINCIPAL EM DESTAQUE: VALOR ATUALIZADO FINAL */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
          5. Saldo Atualizado a Receber
        </span>
        <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1 tracking-tight">
          {formatarMoeda(v5_valorAtualizado)}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Calculado com juros simples diários de {emprestimo.taxaMensal}% a cada 30 dias menos as amortizações pagas.
        </p>
      </div>

      {/* DETALHAMENTO RIGOROSO DOS 5 VALORES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Detalhamento dos 5 Valores
        </h3>

        <div className="space-y-2.5 text-sm">
          {/* 1. Empréstimo Original */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-slate-300">Empréstimo Original</span>
            </div>
            <span className="font-mono font-bold text-slate-100">
              {formatarMoeda(v1_emprestimoOriginal)}
            </span>
          </div>

          {/* 2. Juros Calculados */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div>
                <span className="text-slate-300 block leading-tight">Juros Simples ({emprestimo.taxaMensal}% a.m.)</span>
                <span className="text-[10px] text-slate-500">
                  {diasDecorridos} dias × R$ {((v1_emprestimoOriginal * (emprestimo.taxaMensal / 100)) / 30).toFixed(2)}/dia
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              + {formatarMoeda(v2_jurosCalculado)}
            </span>
          </div>

          {/* 3. Empréstimo + Juros */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-slate-300">Empréstimo + Juros</span>
            </div>
            <span className="font-mono font-bold text-slate-200">
              {formatarMoeda(v3_emprestimoComJuros)}
            </span>
          </div>

          {/* 4. Amortizações Realizadas */}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <div>
                <span className="text-slate-300 block leading-tight">Amortizações Totais</span>
                <span className="text-[10px] text-slate-500">
                  {amortizacoes.length} pagamento(s) registrado(s)
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-400">
              - {formatarMoeda(v4_amortizacaoTotal)}
            </span>
          </div>

          {/* 5. Valor Atualizado Final */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-extrabold flex items-center justify-center">
                5
              </span>
              <span className="font-bold text-slate-100">Valor Atualizado Final</span>
            </div>
            <span className="font-mono text-base font-extrabold text-emerald-400">
              {formatarMoeda(v5_valorAtualizado)}
            </span>
          </div>
        </div>
      </div>

      {/* BOTÃO DE AÇÃO PRIMÁRIA: LANÇAR AMORTIZAÇÃO */}
      <button
        onClick={onAbrirAmortizacao}
        className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-sm tracking-wide">LANÇAR AMORTIZAÇÃO</span>
      </button>

      {/* HISTÓRICO DE AMORTIZAÇÕES COM DATAS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Histórico de Amortizações ({amortizacoes.length})</span>
          </h3>
        </div>

        {amortizacoes.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-400">
              Nenhuma amortização lançada ainda. Quando o cliente fizer um pagamento, clique no botão acima para registrar a data e o valor.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {amortizacoes.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      - {formatarMoeda(item.valor)}
                    </span>
                    {item.formaPagamento && (
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                        {item.formaPagamento}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Pago em: {formatarDataBR(item.dataPagamento)}</span>
                    {item.observacao && (
                      <span className="text-slate-500 italic">• {item.observacao}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Excluir esta amortização de ${formatarMoeda(item.valor)}?`)) {
                      onExcluirAmortizacao(item.id);
                    }
                  }}
                  className="w-8 h-8 rounded-xl text-slate-600 hover:text-rose-400 flex items-center justify-center active:scale-95 transition-colors"
                  title="Remover pagamento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
