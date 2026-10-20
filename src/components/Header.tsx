'use client';

import React, { useState } from 'react';
import { Lock, Settings, RefreshCw, Trash2, Database, Sparkles } from 'lucide-react';

interface HeaderProps {
  onLock: () => void;
  onCarregarExemplo: () => void;
  onLimparBase: () => void;
  isCloud?: boolean;
}

export function Header({ onLock, onCarregarExemplo, onLimparBase, isCloud }: HeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  const hoje = new Date();
  const formatadorData = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const dataFormatada = formatadorData.format(hoje);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 pt-3 pb-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-sm shadow-emerald-950">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-tight">
                Silvio Financeiro
              </h1>
              {isCloud ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                  Nuvem
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded font-medium">
                  Local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 capitalize">{dataFormatada}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Menu de Configurações / Ferramentas de Demo */}
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>

            {menuAberto && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuAberto(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-sm space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                    Ferramentas de Demonstração
                  </div>

                  <button
                    onClick={() => {
                      setMenuAberto(false);
                      onCarregarExemplo();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Carregar Exemplo (Josefa)</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuAberto(false);
                      onLimparBase();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 flex items-center gap-2.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Zerar Banco (Base Vazia)</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1 pt-1" />

                  <button
                    onClick={() => {
                      setMenuAberto(false);
                      onLock();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 active:bg-slate-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Bloquear com PIN</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onLock}
            className="w-9 h-9 rounded-xl bg-slate-800/70 text-slate-400 border border-slate-800 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Bloquear"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
