'use client';

import React, { useState } from 'react';
import { Cliente } from '../lib/types';
import { getHojeString, formatarMoeda } from '../lib/finance';
import { X, Plus, UserPlus, Check, DollarSign } from 'lucide-react';

interface NewLoanModalProps {
  clientesExistentes: Cliente[];
  onCriar: (dados: {
    clienteId?: string;
    novoCliente?: {
      nome: string;
      apelido?: string;
      telefone?: string;
    };
    valorOriginal: number;
    taxaMensal: number;
    dataInicio: string;
    dataVencimento: string;
    observacao?: string;
  }) => void;
  onFechar: () => void;
}

export function NewLoanModal({
  clientesExistentes,
  onCriar,
  onFechar,
}: NewLoanModalProps) {
  // Clientes
  const [modoNovoCliente, setModoNovoCliente] = useState(clientesExistentes.length === 0);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState(
    clientesExistentes[0]?.id || ''
  );
  const [nomeCliente, setNomeCliente] = useState('');
  const [apelidoCliente, setApelidoCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');

  // Dados do Empréstimo
  const [valorStr, setValorStr] = useState('');
  const [taxaStr, setTaxaStr] = useState('25'); // 25% padrão como na planilha do Silvio
  const [dataInicio, setDataInicio] = useState(getHojeString());

  // Calcula data de vencimento padrão (+30 dias)
  const dataHojeObj = new Date();
  const data30dias = new Date(dataHojeObj.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formatStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [dataVencimento, setDataVencimento] = useState(formatStr(data30dias));
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const valorNum = parseFloat(valorStr.replace(',', '.')) || 0;
  const taxaNum = parseFloat(taxaStr.replace(',', '.')) || 0;
  const juroPrevisto = valorNum * (taxaNum / 100);
  const totalPrevisto = valorNum + juroPrevisto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modoNovoCliente && !nomeCliente.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }
    if (!modoNovoCliente && !clienteSelecionadoId) {
      alert('Selecione um cliente cadastrado.');
      return;
    }
    if (valorNum <= 0) {
      alert('Informe um valor de empréstimo válido maior que zero.');
      return;
    }
    if (!dataInicio || !dataVencimento) {
      alert('Preencha as datas de início e vencimento.');
      return;
    }

    setSalvando(true);
    try {
      await onCriar({
        clienteId: modoNovoCliente ? undefined : clienteSelecionadoId,
        novoCliente: modoNovoCliente
          ? {
              nome: nomeCliente.trim(),
              apelido: apelidoCliente.trim(),
              telefone: telefoneCliente.trim(),
            }
          : undefined,
        valorOriginal: valorNum,
        taxaMensal: taxaNum,
        dataInicio,
        dataVencimento,
        observacao,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onFechar}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 tracking-tight">
            Novo Empréstimo
          </h3>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SELEÇÃO OU CADASTRO DE CLIENTE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Cliente
              </label>
              {clientesExistentes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModoNovoCliente(!modoNovoCliente)}
                  className="text-xs text-emerald-400 font-medium hover:underline"
                >
                  {modoNovoCliente ? 'Selecionar existente' : '+ Cadastrar novo'}
                </button>
              )}
            </div>

            {modoNovoCliente ? (
              <div className="space-y-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <input
                  type="text"
                  required
                  placeholder="Nome Completo *"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="w-full h-11 bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Apelido (opcional)"
                    value={apelidoCliente}
                    onChange={(e) => setApelidoCliente(e.target.value)}
                    className="w-full h-10 bg-slate-800 border border-slate-700/80 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Telefone (opcional)"
                    value={telefoneCliente}
                    onChange={(e) => setTelefoneCliente(e.target.value)}
                    className="w-full h-10 bg-slate-800 border border-slate-700/80 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <select
                value={clienteSelecionadoId}
                onChange={(e) => setClienteSelecionadoId(e.target.value)}
                className="w-full h-12 bg-slate-800 border border-slate-700/80 rounded-xl px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {clientesExistentes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} {c.apelido ? `(${c.apelido})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* VALOR E TAXA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Valor Original (R$)
              </label>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                placeholder="10000"
                value={valorStr}
                onChange={(e) => setValorStr(e.target.value)}
                className="w-full h-12 bg-slate-800 border border-slate-700/80 rounded-xl px-3 text-base font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Taxa Mensal (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  placeholder="25"
                  value={taxaStr}
                  onChange={(e) => setTaxaStr(e.target.value)}
                  className="w-full h-12 bg-slate-800 border border-slate-700/80 rounded-xl pl-3 pr-8 text-base font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* DATAS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Data Entrega
              </label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full h-11 bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Data Vencimento
              </label>
              <input
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full h-11 bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* OBSERVAÇÃO */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Observação (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Empréstimo inicial / Nota"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full h-10 bg-slate-800 border border-slate-700/80 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* RESUMO SIMULADO */}
          {valorNum > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Juros em 30 dias ({taxaNum}%):</span>
                <span className="font-mono text-emerald-400 font-bold">
                  + {formatarMoeda(juroPrevisto)}
                </span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800/80 pt-1">
                <span>Total previsto no vencimento:</span>
                <span className="font-mono text-slate-100">
                  {formatarMoeda(totalPrevisto)}
                </span>
              </div>
            </div>
          )}

          {/* BOTÃO SUBMIT */}
          <button
            type="submit"
            disabled={salvando}
            className="w-full h-13 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm tracking-wide">
              {salvando ? 'CADASTRANDO...' : 'CADASTRAR EMPRÉSTIMO'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
