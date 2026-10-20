'use client';

import React, { useState } from 'react';
import { getHojeString, formatarMoeda } from '../lib/finance';
import { X, Check, DollarSign, Calendar, Tag } from 'lucide-react';

interface AmortizationDrawerProps {
  saldoAtual: number;
  clienteNome: string;
  onSalvar: (dados: {
    valor: number;
    dataPagamento: string;
    formaPagamento: string;
    observacao: string;
  }) => void;
  onFechar: () => void;
}

export function AmortizationDrawer({
  saldoAtual,
  clienteNome,
  onSalvar,
  onFechar,
}: AmortizationDrawerProps) {
  const [valorStr, setValorStr] = useState('');
  const [dataPagamento, setDataPagamento] = useState(getHojeString());
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [observacao, setObservacao] = useState('');

  const valorNum = parseFloat(valorStr.replace(',', '.')) || 0;
  const novoSaldoPrevisto = Math.max(0, saldoAtual - valorNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valorNum <= 0) {
      alert('Informe um valor de amortização válido maior que zero.');
      return;
    }
    if (!dataPagamento) {
      alert('Selecione a data do pagamento.');
      return;
    }

    onSalvar({
      valor: valorNum,
      dataPagamento,
      formaPagamento,
      observacao,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onFechar}
      />

      {/* Sheet Content (Slide from bottom) */}
      <div className="relative w-full max-w-md bg-slate-900 border-t border-x border-slate-800 rounded-t-3xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 space-y-5 pb-10">
        {/* Handle visual do iOS */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto -mt-2 mb-2" />

        {/* Topo do Drawer */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">
              Lançar Amortização
            </h3>
            <p className="text-xs text-slate-400">
              Cliente: <span className="text-emerald-400 font-semibold">{clienteNome}</span>
            </p>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Valor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Valor do Pagamento (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                R$
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="0,00"
                value={valorStr}
                onChange={(e) => setValorStr(e.target.value)}
                className="w-full h-14 bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl pl-12 pr-4 text-2xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Campo de Data do Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Data do Pagamento
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full h-12 bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl px-4 text-sm font-medium text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['PIX', 'Dinheiro', 'Transferência'].map((forma) => (
                <button
                  type="button"
                  key={forma}
                  onClick={() => setFormaPagamento(forma)}
                  className={`h-10 rounded-xl text-xs font-semibold transition-all ${
                    formaPagamento === forma
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {forma}
                </button>
              ))}
            </div>
          </div>

          {/* Observação rápida */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Observação (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Pagou metade / PIX Inter"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full h-11 bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 rounded-2xl px-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Simulação em tempo real do novo saldo */}
          {valorNum > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Novo saldo após pagamento:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatarMoeda(novoSaldoPrevisto)}
              </span>
            </div>
          )}

          {/* Botão de Salvar */}
          <button
            type="submit"
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm tracking-wide">CONFIRMAR AMORTIZAÇÃO</span>
          </button>
        </form>
      </div>
    </div>
  );
}
