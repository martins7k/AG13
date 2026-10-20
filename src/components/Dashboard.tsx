'use client';

import React, { useState } from 'react';
import { CalculoEmprestimo } from '../lib/types';
import { formatarMoeda, formatarDataBR } from '../lib/finance';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowDownCircle, 
  Wallet, 
  Plus, 
  Search, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  calculos: CalculoEmprestimo[];
  onSelecionarEmprestimo: (id: string) => void;
  onNovoEmprestimo: () => void;
  onCarregarExemplo: () => void;
}

export function Dashboard({
  calculos,
  onSelecionarEmprestimo,
  onNovoEmprestimo,
  onCarregarExemplo,
}: DashboardProps) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'Todos' | 'Atrasados' | 'EmDia' | 'Quitados'>('Todos');

  // Totais consolidados
  const totalOriginal = calculos.reduce((acc, c) => acc + c.v1_emprestimoOriginal, 0);
  const totalJuros = calculos.reduce((acc, c) => acc + c.v2_jurosCalculado, 0);
  const totalAmortizado = calculos.reduce((acc, c) => acc + c.v4_amortizacaoTotal, 0);
  const totalSaldoGeral = calculos.reduce(
    (acc, c) => (c.emprestimo.status === 'Ativo' ? acc + c.v5_valorAtualizado : acc),
    0
  );

  // Filtragem
  const calculosFiltrados = calculos.filter((item) => {
    const nomeCliente = item.cliente?.nome?.toLowerCase() || '';
    const apelidoCliente = item.cliente?.apelido?.toLowerCase() || '';
    const termo = busca.toLowerCase();
    const matchBusca = nomeCliente.includes(termo) || apelidoCliente.includes(termo);

    if (!matchBusca) return false;

    if (filtro === 'Atrasados') {
      return item.emprestimo.status === 'Ativo' && item.estaAtrasado;
    }
    if (filtro === 'EmDia') {
      return item.emprestimo.status === 'Ativo' && !item.estaAtrasado;
    }
    if (filtro === 'Quitados') {
      return item.emprestimo.status === 'Quitado';
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-28">
      {/* CARD HERO: SALDO GERAL A RECEBER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Wallet className="w-4 h-4" />
          <span>Saldo Geral a Receber</span>
        </div>
        
        <div className="text-3xl font-extrabold text-white tracking-tight font-mono mt-1">
          {formatarMoeda(totalSaldoGeral)}
        </div>
        
        <p className="text-xs text-slate-400 mt-2">
          {calculos.filter((c) => c.emprestimo.status === 'Ativo').length} empréstimos ativos em andamento
        </p>

        {/* 3 mini cards em linha */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Original</span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              {formatarMoeda(totalOriginal)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block uppercase">+ Juros</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatarMoeda(totalJuros)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-amber-400 block uppercase">- Amortizado</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {formatarMoeda(totalAmortizado)}
            </span>
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou apelido..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
          />
        </div>

        {/* Chips de filtro */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'Todos', label: 'Todos' },
            { id: 'Atrasados', label: 'Atrasados' },
            { id: 'EmDia', label: 'Em Dia' },
            { id: 'Quitados', label: 'Quitados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                filtro === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE EMPRÉSTIMOS OU ESTADO VAZIO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Empréstimos Cadastrados ({calculosFiltrados.length})
          </h2>
        </div>

        {calculosFiltrados.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
              <DollarSign className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Base de dados limpa</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              Nenhum empréstimo cadastrado ainda. Você pode adicionar um novo agora mesmo ou carregar o exemplo da planilha para testar.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mt-5 w-full max-w-xs">
              <button
                onClick={onNovoEmprestimo}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950"
              >
                <Plus className="w-4 h-4" />
                <span>+ Cadastrar Empréstimo</span>
              </button>
              
              <button
                onClick={onCarregarExemplo}
                className="w-full h-11 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Carregar Exemplo (Josefa)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {calculosFiltrados.map((item) => {
              const { emprestimo, cliente, v5_valorAtualizado, estaAtrasado, diasAtraso } = item;
              return (
                <div
                  key={emprestimo.id}
                  onClick={() => onSelecionarEmprestimo(emprestimo.id)}
                  className="bg-slate-900 border border-slate-800/90 active:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-sm"
                >
                  <div className="space-y-1.5 min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm truncate">
                        {cliente?.nome || 'Cliente sem nome'}
                      </span>
                      {cliente?.apelido && (
                        <span className="text-xs text-slate-500 truncate">
                          ({cliente.apelido})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{emprestimo.taxaMensal}% a.m.</span>
                      <span>•</span>
                      <span>Início: {formatarDataBR(emprestimo.dataInicio)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      {emprestimo.status === 'Quitado' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Quitado
                        </span>
                      ) : estaAtrasado ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Atrasado ({diasAtraso}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Em dia
                        </span>
                      )}

                      {item.amortizacoes.length > 0 && (
                        <span className="text-[10px] text-slate-500">
                          {item.amortizacoes.length} pagamento(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">
                        Saldo Atual
                      </span>
                      <span className="text-base font-bold text-emerald-400 font-mono block">
                        {formatarMoeda(v5_valorAtualizado)}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTÃO FLUTUANTE INFERIOR FIXO PARA ADICIONAR NOVO EMPRÉSTIMO */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-20 pointer-events-none">
        <button
          onClick={onNovoEmprestimo}
          className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-2xl shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 pointer-events-auto transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-sm tracking-wide">NOVO EMPRÉSTIMO</span>
        </button>
      </div>
    </div>
  );
}
