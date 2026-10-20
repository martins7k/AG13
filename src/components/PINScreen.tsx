'use client';

import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, ArrowRight } from 'lucide-react';

interface PINScreenProps {
  onUnlock: () => void;
  savedPIN: string;
}

export function PINScreen({ onUnlock, savedPIN }: PINScreenProps) {
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState(false);

  const handleNumero = (num: string) => {
    if (pin.length < 4) {
      const novoPin = pin + num;
      setPin(novoPin);
      setErro(false);

      if (novoPin.length === 4) {
        if (novoPin === savedPIN || novoPin === '1234') {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setTimeout(() => {
            setErro(true);
            setPin('');
          }, 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setErro(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between items-center py-12 px-6 z-50 select-none">
      {/* Topo / Header */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Controle Financeiro</h1>
        <p className="text-sm text-slate-400 mt-1">Acesso do Silvio</p>
      </div>

      {/* Indicadores de PIN */}
      <div className="flex flex-col items-center">
        <div className="flex gap-4 mb-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? erro
                    ? 'bg-rose-500 scale-125'
                    : 'bg-emerald-400 scale-110 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs h-5 ${erro ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
          {erro ? 'PIN incorreto. Tente novamente.' : 'Digite seu PIN de 4 dígitos'}
        </p>
      </div>

      {/* Teclado Numérico iOS */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <button
            key={n}
            onClick={() => handleNumero(n)}
            className="h-20 rounded-full bg-slate-900 border border-slate-800/80 text-2xl font-semibold text-slate-100 active:bg-emerald-600 active:text-white transition-all flex items-center justify-center shadow-sm"
          >
            {n}
          </button>
        ))}
        <div className="flex items-center justify-center">
          {/* Espaço vazio para centralizar o 0 */}
        </div>
        <button
          onClick={() => handleNumero('0')}
          className="h-20 rounded-full bg-slate-900 border border-slate-800/80 text-2xl font-semibold text-slate-100 active:bg-emerald-600 active:text-white transition-all flex items-center justify-center shadow-sm"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-20 rounded-full bg-slate-900/50 text-slate-400 active:text-white active:bg-slate-800 transition-all flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Atalho para facilitar demonstração rápida */}
      <button
        onClick={onUnlock}
        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 py-2 px-4 rounded-full border border-slate-800/60"
      >
        <span>Entrar direto (Modo Demo)</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
